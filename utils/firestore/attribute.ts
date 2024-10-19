import {
  getDoc,
  doc,
  getFirestore,
} from 'firebase/firestore';

export const resolveFirestoreAttribute = async <T>(
  record: T,
  key: keyof T,
  id?: string
) => {
  const firestore = getFirestore();

  if (!id) return record;
  const paintPrefDocRef = doc(
    firestore,
    'paintPreferences',
    id
  );
  const snapshot = await getDoc(paintPrefDocRef);
  if (snapshot.exists()) {
    record[key] = snapshot.data() as T[typeof key];
  }
  return record;
};
