import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const initAdminApp = (): App => {
  const existing = getApps();
  if (existing.length) {
    return existing[0];
  }

  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const privateKey = privateKeyRaw?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey
      }),
      storageBucket:
        process.env.FIREBASE_ADMIN_STORAGE_BUCKET ||
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        `${projectId}.appspot.com`,
    });
  }

  return initializeApp({
    storageBucket: process.env.FIREBASE_ADMIN_STORAGE_BUCKET,
  });
};

export const getAdminFirestore = () => {
  const app = initAdminApp();
  return getFirestore(app);
};

export const getAdminAuth = () => {
  const app = initAdminApp();
  return getAuth(app);
};

export const getAdminStorageBucket = () => {
  const app = initAdminApp();
  return getStorage(app).bucket();
};
