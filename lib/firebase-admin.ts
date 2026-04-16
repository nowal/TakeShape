import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const FALLBACK_FIREBASE_ADMIN_PROJECT_ID = 'takeshape-8ef35';
const FALLBACK_FIREBASE_ADMIN_CLIENT_EMAIL =
  'firebase-adminsdk-el0rz@takeshape-8ef35.iam.gserviceaccount.com';
const FALLBACK_FIREBASE_ADMIN_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCrcxZAellJuf0Y
su5gn1Xetc196MsE9t32/Clm+1SX7qc6FemjZIhwg9qA06L/lJFxWOVz11bVwZGs
3YfXI9zmArcFGNzPlir011zGJKE+W+9tijK/dDkBJIiQTcdBPwmyCnhNNBcE7oiy
P6UwN3SZ41q5we/cMHNypRvvelvvcQSUbnFch84N9P4SUi3tZyme6c26KPwVO5wV
TSEc7jTiMXo33ywXt0X0xbj6368SsXxEuc5RatWZQbKJkYIPzleNEutZaJOQbzIa
5tIkCPo6TmAWdjN3LH0ABE29wqgee8elWYp6/c+kKnd5d6V0evP/izGVy2Ha7Plo
1g/RkSfVAgMBAAECggEAEvvIvHXvmf66e/gf9dnen6zApo7Wn+OXuye7i9gLS1FU
+dUATCOvCcpHsNj+JM919TdzHIr85ekrcJkM1/D0HhGx4yIYHPITKo4ICzZ2FhoG
3jmdmd5MC4jYiCXciKhqseh/3oiEffrNbvMmHrsdMYbffk7veJFyzwBiIfeJ426R
OSbfra3oDja1UD/yw/7zYD9B3L96jN7i0vcWZzstYB98ufarD2Xp5LBp/YOoBNne
WkGwJihuz+w+6tJUbz1fcaEWG44vcaphzvvDCvcKzFOegBIvv1TRyl/+AcfDteIc
1cOPNdVh7VvZuh71NMa0CQC6zbXFBi1ApT/wsbahhwKBgQDYDmc59z//G37tDofc
e6us6nL6ZW+oxn/gx5alVZijcsedpl0VZY47gPFvz+ERsgfmgkVPNHdqpJxm6JwC
w2R4FmSHXc9JTRZCQv9XPaMGx3NDCgsghzzyWjb860WDvpP/gyCX2Vq5mrVh+2MW
kmN9yXiFTPZKSoQnm2rk4QGDlwKBgQDLJYUURhdTv+XCBvlKjJtsXSmLKww4ShQr
JHCZ3DLip2NXIN3vmtMJ5upLHF3LqbqHfCSlgHOao9HyP2wYY1V5rzbboCVhw5L0
Im2S1B7xekj1uUJ+AeztOigcEihHitQEmxLLdUnW4SjF55ws9XZ93APBxXgx5swZ
oTqgTnqtcwKBgQCr4jmJSgSlxZAis86uP80CUbqLLiu4z8JoZyCYBBLc5bGc3/9p
yFNxT1HErFLYKxRR9A2Dx6/BLZgn3qJPKHdDej0b3CvOmv88U+Sj2Stbd01hZhoY
FL8N52ubpui0uOcw/Xbul0KwKj5m5wGbsXZpWeEB24qM699bSy+tSrxTnQKBgBSg
772aTH4dq3gjeycd1h6P60sNiQUiSKAE6EZHfQdVFhpf5QmSwEFuKHaOH9wxlRZy
/cmsnJCkeApQdGqZk7FyoHB297TQxlhyMoxJbAb7cvM4586h5WxFjpMjKOHy8Aqz
sJnmhCQE4z4Ngedy2aB4Og1wPv9aP3mOzMRAk+aPAoGAFKAC+L+9BbcbdWp2VeoH
s1lAnLiRP9chvm1S2WXborFN7j00xgWkW4pxjHckB0Czw1xBG5tWHUjTuWkyr67/
rmxSTYyHqxC8FnFzTydAgC2AukR+fz2Xfm5bqezs4l/cDmNtZ3rPr9yDl+H7LLaM
fMRvEk/oi9G2G264TQYZ+1Y=
-----END PRIVATE KEY-----`;

const initAdminApp = (): App => {
  const existing = getApps();
  if (existing.length) {
    return existing[0];
  }

  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    FALLBACK_FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail =
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    FALLBACK_FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const privateKey = (
    privateKeyRaw?.replace(/\\n/g, '\n') ||
    FALLBACK_FIREBASE_ADMIN_PRIVATE_KEY
  ).trim();

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
        `${FALLBACK_FIREBASE_ADMIN_PROJECT_ID}.appspot.com`,
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
