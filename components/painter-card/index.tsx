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

type PainterCardProps = {
  painterId: string;
};

type PainterData = {
  businessName: string;
  logoUrl?: string;
  phoneNumber?: string;
  reviews?: number[];
};

export const PainterCard: React.FC<PainterCardProps> = ({
  painterId,
}) => {
  const [painterData, setPainterData] =
    useState<PainterData | null>(null);
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
        setPainterData(painterDoc as PainterData);
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
    return <div>Loading painter data...</div>;
  }

  return (
    <div className="painter-card secondary-color">
      {painterData.logoUrl && (
        <img
          src={painterData.logoUrl}
          alt={`${painterData.businessName} Logo`}
          className="painter-logo"
        />
      )}
      <div className="flex-col flex justify-between">
        <h2 className="painter-name">
          {painterData.businessName}
        </h2>
        <h2 className="painter-phone">
          {painterData.phoneNumber}
        </h2>
        {calculateAverageRating(painterData.reviews)}
      </div>
      
    </div>
  );
};
