import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

const required = (name: string) => {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
};

const COLLECTIONS = [
  { firestore: 'painters', supabase: 'providers' },
  { firestore: 'homeowners', supabase: 'homeowners' },
  { firestore: 'houses', supabase: 'houses' },
  { firestore: 'sessions', supabase: 'sessions' },
  { firestore: 'rooms', supabase: 'rooms' },
] as const;

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
    required('SUPABASE_SERVICE_ROLE_KEY')
  );

  let hasMismatch = false;

  for (const collection of COLLECTIONS) {
    const firestoreSnapshot = await firestore
      .collection(collection.firestore)
      .count()
      .get();
    const firestoreCount = firestoreSnapshot.data().count;

    const { count: supabaseCount, error } = await supabase
      .from(collection.supabase)
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    const safeSupabaseCount = Number(supabaseCount || 0);
    const matches = safeSupabaseCount === firestoreCount;
    if (!matches) hasMismatch = true;

    console.log(
      `[verify] ${collection.firestore} -> ${collection.supabase}: firestore=${firestoreCount}, supabase=${safeSupabaseCount}, match=${matches}`
    );
  }

  const firestoreQuoteCountSnapshot = await firestore
    .collectionGroup('quotes')
    .count()
    .get();
  const firestoreQuoteCount =
    firestoreQuoteCountSnapshot.data().count;
  const { count: supabaseQuoteCount, error: quoteCountError } =
    await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true });

  if (quoteCountError) throw quoteCountError;
  const safeSupabaseQuoteCount = Number(supabaseQuoteCount || 0);
  const quoteCountsMatch =
    safeSupabaseQuoteCount === firestoreQuoteCount;
  if (!quoteCountsMatch) hasMismatch = true;

  console.log(
    `[verify] collectionGroup(quotes) -> quotes: firestore=${firestoreQuoteCount}, supabase=${safeSupabaseQuoteCount}, match=${quoteCountsMatch}`
  );

  if (hasMismatch) {
    throw new Error(
      'Verification failed: one or more table counts did not match'
    );
  }

  console.log('[verify] all counts match');
};

main().catch((error) => {
  console.error('[verify] failed:', error);
  process.exit(1);
});
