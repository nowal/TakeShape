import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import { mapFirestoreQuoteToSupabaseRow } from '@/lib/data/supabase/quotes';

const required = (name: string) => {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
};

const initFirebaseAdmin = () => {
  if (admin.apps.length) return;

  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    '\n'
  );

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    return;
  }

  admin.initializeApp();
};

const main = async () => {
  initFirebaseAdmin();

  const firestore = admin.firestore();
  const supabase = createClient(
    required('NEXT_PUBLIC_SUPABASE_URL'),
    required('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const snapshot = await firestore.collectionGroup('quotes').get();
  const rows = snapshot.docs
    .map((doc) => {
      const parent = doc.ref.parent.parent;
      const providerId = String(parent?.id || '').trim();
      if (!providerId) return null;
      const quoteData = doc.data() as Record<string, any>;
      return mapFirestoreQuoteToSupabaseRow({
        providerId,
        quoteId: doc.id,
        quoteData,
      });
    })
    .filter(Boolean) as ReturnType<
    typeof mapFirestoreQuoteToSupabaseRow
  >[];

  console.log(
    `[backfill:quotes] Firestore quotes -> Supabase quotes: ${rows.length} rows`
  );

  if (!rows.length) {
    console.log('[backfill:quotes] No quote rows found.');
    return;
  }

  const chunkSize = 200;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from('quotes').upsert(chunk, {
      onConflict: 'id',
    });
    if (error) {
      throw new Error(
        `Failed upserting quotes chunk (${i}-${i + chunk.length - 1}): ${error.message}`
      );
    }
  }

  console.log('[backfill:quotes] completed successfully');
};

main().catch((error) => {
  console.error('[backfill:quotes] failed:', error);
  process.exit(1);
});

