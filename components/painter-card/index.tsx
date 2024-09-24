import Image from 'next/image';
import React, { useEffect, useState } from 'react';
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
  MOCKS_PAINTER_INFO,
} from '@/components/dashboard/client/quotes/mocks';
import { IconsPhone } from '@/components/icons/phone';
import { ButtonsCvaAnchor } from '@/components/cva/anchor';

type PainterCardProps = {
  painterId: string;
};

export type TPainterData = {
  businessName: string;
  logoUrl?: string;
  phoneNumber?: string;
  reviews?: number[];
};

export const PainterCard: React.FC<PainterCardProps> = ({
  painterId,
}) => {
  const [painterData, setPainterData] =
    useState<TPainterData | null>(
      isMocks() ? MOCKS_PAINTER_INFO : null
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
        setPainterData(painterDoc as TPainterData);
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

  return (
    <div className="flex flex-row gap-3">
      {painterData.logoUrl && (
        <Image
          src={painterData.logoUrl}
          alt={`${painterData.businessName} Logo`}
          className="size-12 rounded-full"
          width="48"
          height="48"
        />
      )}
      <div className="flex flex-col gap-1.5">
        <h5 className="text-base font-semibold text-black">
          {painterData.businessName}
        </h5>
        <ButtonsCvaAnchor
          href={`tel:${painterData.phoneNumber}`}
          classValue="flex flex-row items-center gap-1 h-[16px]"
          title={`Call ${painterData.phoneNumber}`}
          icon={{ Leading: IconsPhone }}
        >
          <h6 className="text-gray-9 text-xs font-medium">
            {painterData.phoneNumber}
          </h6>
        </ButtonsCvaAnchor>
      </div>
    </div>
  );
};
