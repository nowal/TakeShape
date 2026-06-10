import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import { getTakeShapeAppSupabaseAdmin } from '@/lib/supabase/takeshape-app-server';
import { parseReferralFile } from '@/lib/provider-referrals/parse-referral-file';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const REFERRAL_UPLOAD_BUCKET = 'provider-referral-uploads';
const SOURCE_SYSTEM = 'provider_dashboard_upload';
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ProviderRow = {
  id: string;
  business_name: string;
  service_types: string[] | null;
  city: string | null;
  state: string | null;
};

type SupabaseAdmin = ReturnType<typeof getTakeShapeAppSupabaseAdmin>;

const getUploadFile = (formData: FormData) => {
  const value = formData.get('file');
  if (!value || typeof value === 'string') {
    throw new Error('Choose a CSV or Excel file.');
  }
  return value;
};

const cleanFileName = (fileName: string) =>
  (fileName || 'referral-list')
    .replace(/[^a-z0-9._-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140) || 'referral-list';

const ensureReferralUploadBucket = async (supabase: SupabaseAdmin) => {
  const { error } = await supabase.storage.getBucket(REFERRAL_UPLOAD_BUCKET);
  if (!error) return;

  const { error: createError } = await supabase.storage.createBucket(
    REFERRAL_UPLOAD_BUCKET,
    {
      public: false,
    }
  );

  if (createError && !/already exists/i.test(createError.message)) {
    throw createError;
  }
};

const storeReferralUpload = async ({
  file,
  providerId,
  supabase,
}: {
  file: File;
  providerId: string;
  supabase: SupabaseAdmin;
}) => {
  await ensureReferralUploadBucket(supabase);

  const filePath = [
    providerId,
    `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}-${cleanFileName(
      file.name
    )}`,
  ].join('/');
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from(REFERRAL_UPLOAD_BUCKET)
    .upload(filePath, bytes, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

  if (error) throw error;

  return filePath;
};

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { ok: false, error: 'Upload a CSV or Excel file.' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const providerId = String(formData.get('providerId') || '').trim();

    if (!UUID_PATTERN.test(providerId)) {
      return NextResponse.json(
        { ok: false, error: 'Provider is not available for referral import.' },
        { status: 400 }
      );
    }

    const file = getUploadFile(formData);
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { ok: false, error: 'Upload a file smaller than 12 MB.' },
        { status: 400 }
      );
    }

    const rows = await parseReferralFile(file);
    if (!rows.length) {
      return NextResponse.json(
        { ok: false, error: 'No referral rows were found in that file.' },
        { status: 400 }
      );
    }

    const supabase = getTakeShapeAppSupabaseAdmin();
    const { data: providerData, error: providerError } = await supabase
      .from('providers')
      .select('id,business_name,service_types,city,state')
      .eq('id', providerId)
      .maybeSingle();

    if (providerError) throw providerError;
    const provider = (providerData as ProviderRow | null) || null;
    if (!provider) {
      return NextResponse.json(
        { ok: false, error: 'Provider was not found.' },
        { status: 404 }
      );
    }

    const storagePath = await storeReferralUpload({
      file,
      providerId,
      supabase,
    });
    const uploadedAt = new Date().toISOString();
    const { data: batchData, error: batchError } = await supabase
      .from('provider_import_batches')
      .insert({
        provider_id: providerId,
        source_system: SOURCE_SYSTEM,
        source_label: 'Referral list upload',
        file_name: file.name,
        total_rows: rows.length,
        imported_rows: 0,
        skipped_rows: 0,
        metadata: {
          customerIo: {
            enabled: false,
            status: 'waiting_for_manual_review',
          },
          file: {
            bucket: REFERRAL_UPLOAD_BUCKET,
            name: file.name,
            path: storagePath,
            size: file.size,
            type: file.type || null,
          },
          manualReview: {
            status: 'pending_review',
            uploadedAt,
          },
          sourceHeaders: Object.keys(rows[0] || {}),
          sourceRowSample: rows.slice(0, 10),
        },
      })
      .select('id')
      .single();

    if (batchError) throw batchError;
    const importBatchId = String((batchData as { id: string }).id);

    revalidatePath('/communicationDashboard');

    return NextResponse.json({
      ok: true,
      customerIo: {
        enabled: false,
        failed: 0,
        synced: 0,
      },
      importBatchId,
      importedRows: 0,
      pendingReview: true,
      skippedRows: 0,
      totalRows: rows.length,
    });
  } catch (error) {
    console.error('Provider referral list import failed:', error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Referral list import failed.',
      },
      { status: 500 }
    );
  }
}
