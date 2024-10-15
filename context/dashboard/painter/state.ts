import { useState } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { TQuoteKey } from '@/components/dashboard/painter/types';
import { useApp } from '@/context/app/provider';
import { notifyError } from '@/utils/notifications';
import { getDistanceFromCoordsInKm } from '@/utils/maps/get-distance-from-coords-in-km';

export const usePainterState = () => {
  const { onNavigateScrollTopClick } = useApp();
  const [selectedPage, setSelectedPage] =
    useState<TQuoteKey>('Available Quotes');
  const [isNavigating, setNavigating] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  

  const handleGeocodeAddress = async (address: string) => {
    console.log(
      'useDashboardPainterState.handleGeocodeAddress, address:',
      address
    );

    const apiKey =
      'AIzaSyCtM9oQWFui3v5wWI8A463_AN1QN0ITWAA';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      if (response.data.status === 'OK') {
        const location =
          response.data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
        };
      } else {
        console.error(
          'Geocoding error:',
          response.data.status,
          response.data.error_message
        );
      }
    } catch (error) {
      const errorMessage = 'Geocoding request failed';
      console.error(errorMessage, error);
      notifyError(errorMessage);
    }
    return null;
  };

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

      // console.log(
      //   `Painter Location: (${painterLat}, ${painterLng})`
      // );
      // console.log(`TJob Location: (${jobLat}, ${jobLng})`);

      const distance = getDistanceFromCoordsInKm(
        painterLat,
        painterLng,
        jobLat,
        jobLng
      );
      // console.log(
      //   `Distance: ${distance} km, Range: ${
      //     range * 1.60934
      //   } km`
      // );

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
    onJobWithinRangeCheck:handleJobWithinRangeCheck,
    onPageChange: handlePageChange,
    onGeocodeAddress: handleGeocodeAddress,
  };
};
