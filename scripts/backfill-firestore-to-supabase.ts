import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

const required = (name: string) => {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
};

const FIRESTORE_TO_SUPABASE_TABLES: Array<{
  firestoreCollection: string;
  supabaseTable: string;
}> = [
  { firestoreCollection: 'painters', supabaseTable: 'providers' },
  { firestoreCollection: 'homeowners', supabaseTable: 'homeowners' },
  { firestoreCollection: 'houses', supabaseTable: 'houses' },
  { firestoreCollection: 'sessions', supabaseTable: 'sessions' },
  { firestoreCollection: 'rooms', supabaseTable: 'rooms' },
];

const toIsoIfDateLike = (value: unknown): unknown => {
  if (!value) return value;

  if (value instanceof Date) {
    return value.toISOString();
  }

  const maybeTimestamp = value as {
    toDate?: () => Date;
    _seconds?: number;
    _nanoseconds?: number;
  };

  if (typeof maybeTimestamp.toDate === 'function') {
    return maybeTimestamp.toDate().toISOString();
  }

  if (
    typeof maybeTimestamp._seconds === 'number' &&
    typeof maybeTimestamp._nanoseconds === 'number'
  ) {
    const milliseconds = maybeTimestamp._seconds * 1000;
    return new Date(milliseconds).toISOString();
  }

  return value;
};

const normalizeObject = (value: unknown): unknown => {
  const dateLike = toIsoIfDateLike(value);

  if (Array.isArray(dateLike)) {
    return dateLike.map(normalizeObject);
  }

  if (dateLike && typeof dateLike === 'object') {
    const objectValue = dateLike as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(objectValue).map(([key, nestedValue]) => [
        key,
        normalizeObject(nestedValue),
      ])
    );
  }

  return dateLike;
};

const toIsoTimestamp = (
  value: unknown,
  fallbackIso: string
): string => {
  if (!value) return fallbackIso;

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    // Firestore-adjacent systems sometimes persist timestamps as epoch milliseconds.
    const millis = value > 1e12 ? value : value > 1e9 ? value * 1000 : value;
    const date = new Date(millis);
    return Number.isNaN(date.getTime()) ? fallbackIso : date.toISOString();
  }

  const raw = String(value).trim();
  if (!raw) return fallbackIso;

  const numeric = Number(raw);
  if (Number.isFinite(numeric)) {
    const millis =
      numeric > 1e12 ? numeric : numeric > 1e9 ? numeric * 1000 : numeric;
    const date = new Date(millis);
    return Number.isNaN(date.getTime()) ? fallbackIso : date.toISOString();
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime())
    ? fallbackIso
    : parsed.toISOString();
};

const toSupabaseRow = (
  id: string,
  firestoreData: Record<string, unknown>,
  table: string
) => {
  const nowIso = new Date().toISOString();
  const normalized = normalizeObject(
    firestoreData
  ) as Record<string, unknown>;

  const createdAt = toIsoTimestamp(
    normalized.createdAt || normalized.created_at,
    nowIso
  );
  const updatedAt = toIsoTimestamp(
    normalized.updatedAt || normalized.updated_at,
    createdAt
  );
  const lastActive = toIsoTimestamp(
    normalized.lastActive || normalized.last_active,
    createdAt
  );

  if (table === 'providers') {
    return {
      id,
      user_id: normalized.userId || null,
      business_name: normalized.businessName || '',
      address: normalized.address || '',
      coords: normalized.coords || null,
      range_km:
        typeof normalized.range === 'number'
          ? normalized.range
          : null,
      is_insured: Boolean(normalized.isInsured),
      logo_url: normalized.logoUrl || '',
      phone_number: normalized.phoneNumber || '',
      sessions: Array.isArray(normalized.sessions)
        ? normalized.sessions
        : [],
      paid: Boolean(normalized.paid),
      paying: Boolean(normalized.paying),
      billing_plan: normalized.billingPlan || null,
      subscription_status:
        normalized.subscriptionStatus || null,
      stripe_customer_id: normalized.stripeCustomerId || null,
      stripe_subscription_id:
        normalized.stripeSubscriptionId || null,
      trial_ends_at: normalized.trialEndsAt || null,
      terms_and_conditions_url:
        normalized.termsAndConditionsUrl || null,
      created_at: createdAt,
      updated_at: updatedAt,
    };
  }

  if (table === 'homeowners') {
    return {
      id,
      name: normalized.name || '',
      email: normalized.email || '',
      phone: normalized.phone || '',
      sessions: Array.isArray(normalized.sessions)
        ? normalized.sessions
        : [],
      houses: Array.isArray(normalized.houses)
        ? normalized.houses
        : [],
      created_at: createdAt,
      updated_at: updatedAt,
    };
  }

  if (table === 'houses') {
    return {
      id,
      homeowner_id: normalized.homeownerId || null,
      address: normalized.address || '',
      room_ids: Array.isArray(normalized.roomIds)
        ? normalized.roomIds
        : [],
      add_ons: Array.isArray(normalized.addOns)
        ? normalized.addOns
        : [],
      submitted: Boolean(normalized.submitted),
      accepted: Boolean(normalized.accepted),
      created_at: createdAt,
      updated_at: updatedAt,
    };
  }

  if (table === 'sessions') {
    return {
      id,
      homeowner_id: normalized.homeownerId || null,
      house_id: normalized.houseId || null,
      current_room_id: normalized.currentRoomId || null,
      quote_feedback: normalized.quoteFeedback || null,
      chat_history: Array.isArray(normalized.chatHistory)
        ? normalized.chatHistory
        : [],
      created_at: createdAt,
      last_active: lastActive,
      updated_at: updatedAt,
    };
  }

  if (table === 'rooms') {
    return {
      id,
      session_id: normalized.sessionId || null,
      house_id: normalized.houseId || null,
      name: normalized.name || '',
      images: Array.isArray(normalized.images)
        ? normalized.images
        : [],
      processed: Boolean(normalized.processed),
      model_path:
        normalized.model_path || normalized.modelPath || null,
      created_at: createdAt,
      updated_at: updatedAt,
    };
  }

  return {
    id,
  };
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

const run = async () => {
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

  for (const mapping of FIRESTORE_TO_SUPABASE_TABLES) {
    const snapshot = await firestore
      .collection(mapping.firestoreCollection)
      .get();

    const rows = snapshot.docs
      .map((doc) =>
        toSupabaseRow(doc.id, doc.data(), mapping.supabaseTable)
      )
      .filter((row) => {
        if (
          mapping.supabaseTable === 'rooms' &&
          !String((row as Record<string, unknown>).session_id || '')
            .trim()
        ) {
          return false;
        }
        return true;
      });

    console.log(
      `[backfill] ${mapping.firestoreCollection} -> ${mapping.supabaseTable}: ${rows.length} rows`
    );

    if (!rows.length) continue;

    const { error } = await supabase
      .from(mapping.supabaseTable)
      .upsert(rows, {
        onConflict: 'id',
      });

    if (error) {
      throw new Error(
        `Failed upserting into ${mapping.supabaseTable}: ${error.message}`
      );
    }
  }

  console.log('[backfill] completed successfully');
};

run().catch((error) => {
  console.error('[backfill] failed:', error);
  process.exit(1);
});
