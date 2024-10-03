import { useState, useEffect } from 'react';
import {
  isMocks,
  MOCKS_PAINTER_DATA,
} from '@/components/dashboard/homeowner/contractor-quotes/mocks';
import {
  getFirestore,
  query,
  collection,
  where,
  getDocs,
} from 'firebase/firestore';
import { TPainterData } from '@/components/painter/card/types';

export const usePainterData = (painterId: string) => {
  const [painterData, setPainterInfo] =
    useState<TPainterData | null>(
      isMocks() ? MOCKS_PAINTER_DATA : null
    );
  const firestore = getFirestore();

  useEffect(() => {
    const fetchPainterData = async () => {
      const painterQuery = query(
        collection(firestore, 'painters'),
        where('userId', '==', painterId)
      );
      console.log(
        'retrieving info for painter ' + painterId
      );
      const painterSnapshot = await getDocs(painterQuery);

      if (!painterSnapshot.empty) {
        const painterDoc = painterSnapshot.docs[0].data();
        setPainterInfo(painterDoc as TPainterData);
      } else {
        console.log('No such painter!');
      }
    };

    if (painterId) {
      fetchPainterData();
    }
  }, [painterId, firestore]);

  return painterData;
};
