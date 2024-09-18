import React, { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import {
  Star,
  StarHalf,
  StarBorder,
} from '@mui/icons-material';
import { IconsLoading } from '@/components/icons/loading';
import { MOCKS_PAINTER_INFO } from '@/components/dashboard/client/quotes/mocks';
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
      MOCKS_PAINTER_INFO
      // null
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

  const calculateAverageRating = (
    reviews: number[] | undefined
  ) => {
    if (!reviews || reviews.length === 0) {
      return null;
    }
    const total = reviews.reduce(
      (acc, rating) => acc + rating,
      0
    );
    const average = total / reviews.length;
    const fullStars = Math.floor(average);
    const halfStar = average - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="painter-reviews">
        {Array(fullStars)
          .fill(0)
          .map((_, i) => (
            <Star key={`full-${i}`} className="star full" />
          ))}
        {halfStar && <StarHalf className="star half" />}
        {Array(emptyStars)
          .fill(0)
          .map((_, i) => (
            <StarBorder
              key={`empty-${i}`}
              className="star empty"
            />
          ))}
      </div>
    );
  };

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
        <img
          src={painterData.logoUrl}
          alt={`${painterData.businessName} Logo`}
          className="size-12 rounded-full"
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
          icon={{Leading:IconsPhone}}
        >

          <h6 className="text-gray-9 text-xs font-medium">
            {painterData.phoneNumber}
          </h6>
        </ButtonsCvaAnchor>

        {/* {calculateAverageRating(painterData.reviews)} */}
      </div>
    </div>
  );
};
