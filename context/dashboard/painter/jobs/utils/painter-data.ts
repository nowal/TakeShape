'use client';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const fetchPainter = async () => {
  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    console.error(
      'No user found, unable to fetch painter data.'
    );
    return;
  }
  const painterQuery = query(
    collection(firestore, 'painters'),
    where('userId', '==', user.uid)
  );
  const painterSnapshot = await getDocs(painterQuery);
  if (painterSnapshot.empty) {
    console.error(
      'No painter data found, unable to fetch painter data.'
    );
    return;
  }
  return { data: painterSnapshot.docs[0].data(), user };
};
