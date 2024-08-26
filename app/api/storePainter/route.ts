// /app/api/storePainter/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, collection, where, query, getDocs, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCtM9oQWFui3v5wWI8A463_AN1QN0ITWAA",
  authDomain: "takeshape-8ef35.firebaseapp.com",
  projectId: "takeshape-8ef35",
  storageBucket: "takeshape-8ef35.appspot.com",
  messagingSenderId: "2834175666",
  appId: "1:2834175666:web:22fc9bbec8a9cd3c05dbab",
  measurementId: "G-47EYLN83WE"
};

initializeApp(firebaseConfig);

export async function POST(request: NextRequest) {
  const firestore = getFirestore();
  const { painterId, userImageId, userId } = await request.json();

  // Fetch the user document
  const userDocRef = doc(firestore, 'users', userId);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    return NextResponse.json({ status: 'error', message: 'User not found' }, { status: 404 });
  }

  const userData = userDoc.data();

  // Find the price entry for the given painterId and userImageId
  const pricesCollectionRef = collection(firestore, 'userImages', userImageId, 'prices');
  const priceQuery = query(pricesCollectionRef, where('painterId', '==', painterId));
  console.log(priceQuery);
  const priceSnapshot = await getDocs(priceQuery);

  if (priceSnapshot.empty) {
    return NextResponse.json({ status: 'error', message: 'Price entry not found' }, { status: 404 });
  }

  const priceDocRef = priceSnapshot.docs[0].ref;

  // Update the price entry with the accepted field
  await updateDoc(priceDocRef, {
    accepted: true
  });

  return NextResponse.json({ status: 'success' });
}