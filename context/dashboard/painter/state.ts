import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { TQuoteKey } from '@/components/dashboard/painter/types';
import { useApp } from '@/context/app/provider';
import { getDistanceFromCoordsInKm } from '@/utils/maps/get-distance-from-coords-in-km';
import { useAddressGeocodeHandler } from '@/hooks/address/geocode';

export const usePainterState = () => {
  const { onNavigateScrollTopClick } = useApp();
  const handleGeocodeAddress = useAddressGeocodeHandler();
  const [selectedPage, setSelectedPage] =
    useState<TQuoteKey>('Available Quotes');
  const [isNavigating, setNavigating] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  const handleJobWithinRangeCheck = async (
    painterAddress: string,
    range: number,
    jobAddress: { lat: number; lng: number }
  ): Promise<boolean> => {
    const geocodedPainterAddress =
      await handleGeocodeAddress(painterAddress);

    if (geocodedPainterAddress) {
      const { lat: painterLat, lng: painterLng } =
        geocodedPainterAddress;
      const { lat: jobLat, lng: jobLng } = jobAddress;

      const distance = getDistanceFromCoordsInKm(
        painterLat,
        painterLng,
        jobLat,
        jobLng
      );

      return distance <= range * 1.60934; // Convert miles to kilometers
    } else {
      console.error(
        'Failed to geocode painter address:',
        painterAddress
      );
      return false;
    }
  };

  const handlePageChange = (selected: TQuoteKey) => {
    setNavigating(true);
    setSelectedPage(selected);
    if (selected === 'Available Quotes') {
      onNavigateScrollTopClick('/dashboard');
    } else if (selected === 'Accepted Quotes') {
      onNavigateScrollTopClick('/acceptedQuotes');
    } else if (selected === 'Completed Quotes') {
      onNavigateScrollTopClick('/completedQuotes');
    }
  };

  return {
    isNavigating,
    selectedPage,
    user,
    dispatchNavigating: setNavigating,
    onJobWithinRangeCheck: handleJobWithinRangeCheck,
    onPageChange: handlePageChange,
  };
};
