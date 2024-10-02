import React, { FC, useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { IconsLoading } from '@/components/icons/loading';
import {
  isMocks,
  MOCKS_PAINTER_DATA,
} from '@/components/dashboard/homeowner/contractor-quotes/mocks';
import { PainterCardInfo } from '@/components/painter-card/info';

export type TPainterInfo = {
  businessName: string;
  logoUrl?: string;
  phoneNumber?: string;
  reviews?: number[];
};

export type PainterCardProps = {
  painterId: string;
};

export const PainterCard: FC<PainterCardProps> = ({
  painterId,
}) => {
  const [painterData, seTPainterInfo] =
    useState<TPainterInfo | null>(
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
        seTPainterInfo(painterDoc as TPainterInfo);
      } else {
        console.log('No such painter!');
      }
    };

    if (painterId) {
      fetchPainterData();
    }
  }, [painterId, firestore]);

  if (!painterData) {
    return (
      <div className="flex flex-row gap-2 text-xs">
        <IconsLoading classValue="text-white" />
        Loading painter data...
      </div>
    );
  }

  return <PainterCardInfo info={painterData} />;
};
