import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

const required = (name: string) => {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
};

const toIsoTimestamp = (
  value: unknown,
  fallbackIso: string
): string => {
  if (!value) return fallbackIso;
  if (value instanceof Date) return value.toISOString();

  const maybeTimestamp = value as {
    toDate?: () => Date;
    _seconds?: number;
  };
  if (typeof maybeTimestamp.toDate === 'function') {
    return maybeTimestamp.toDate().toISOString();
  }
  if (typeof maybeTimestamp._seconds === 'number') {
    return new Date(
      maybeTimestamp._seconds * 1000
    ).toISOString();
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime())
    ? fallbackIso
    : parsed.toISOString();
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

const mapPainterToProviderRow = (
  id: string,
  painter: Record<string, unknown>
) => {
  const nowIso = new Date().toISOString();
  const createdAt = toIsoTimestamp(
    painter.createdAt || painter.created_at,
    nowIso
  );
  const updatedAt = toIsoTimestamp(
    painter.updatedAt || painter.updated_at,
    createdAt
  );

  return {
    id,
    user_id: String(painter.userId || '').trim() || null,
    business_name: String(painter.businessName || '').trim(),
    address: String(painter.address || '').trim(),
    coords: painter.coords || null,
    range_km:
      typeof painter.range === 'number' ? painter.range : null,
    is_insured: Boolean(painter.isInsured),
    logo_url: String(painter.logoUrl || '').trim(),
    phone_number: String(painter.phoneNumber || '').trim(),
    sessions: Array.isArray(painter.sessions)
      ? painter.sessions
      : [],
    paid: Boolean(painter.paid),
    paying: Boolean(painter.paying),
    billing_plan:
      String(painter.billingPlan || '').trim() || null,
    subscription_status:
      String(painter.subscriptionStatus || '').trim() || null,
    stripe_customer_id:
      String(painter.stripeCustomerId || '').trim() || null,
    stripe_subscription_id:
      String(painter.stripeSubscriptionId || '').trim() ||
      null,
    trial_ends_at: painter.trialEndsAt || null,
    terms_and_conditions_url:
      String(painter.termsAndConditionsUrl || '').trim() ||
      null,
    created_at: createdAt,
    updated_at: updatedAt,
  };
};

const main = async () => {
  const providerId = String(process.argv[2] || '').trim();
  if (!providerId) {
    throw new Error(
      'Usage: npx esrun scripts/backfill-provider-to-supabase.ts <providerId>'
    );
  }

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

  const painterDoc = await firestore
    .collection('painters')
    .doc(providerId)
    .get();

  if (!painterDoc.exists) {
    throw new Error(
      `Painter not found in Firestore: ${providerId}`
    );
  }

  const providerRow = mapPainterToProviderRow(
    painterDoc.id,
    painterDoc.data() as Record<string, unknown>
  );

  const { error } = await supabase
    .from('providers')
    .upsert(providerRow, { onConflict: 'id' });

  if (error) {
    throw new Error(
      `Failed upserting provider ${providerId}: ${error.message}`
    );
  }

  console.log(
    `[backfill:provider] migrated painter ${providerId} -> providers`
  );
  console.log(
    `[backfill:provider] business_name=${providerRow.business_name || '<empty>'}, user_id=${providerRow.user_id || '<none>'}`
  );
};

main().catch((error) => {
  console.error('[backfill:provider] failed:', error);
  process.exit(1);
});
