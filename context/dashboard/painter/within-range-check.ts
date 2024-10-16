import { TCoords } from '@/context/account-settings/types';
import { getDistanceFromCoordsInKm } from '@/utils/maps/get-distance-from-coords-in-km';

export const useWithinRangeCheckHandler = () => {
  const handler = async (
    painterCoords: TCoords,
    jobCoords: TCoords,
    range: number
  ): Promise<boolean> => {
    if (painterCoords) {
      const { lat: painterLat, lng: painterLng } =
        painterCoords;
      const { lat: jobLat, lng: jobLng } = jobCoords;

      const distance = getDistanceFromCoordsInKm(
        painterLat,
        painterLng,
        jobLat,
        jobLng
      );

      return distance <= range * 1.60934; // Convert miles to kilometers
    } else {
      return false;
    }
  };

  return handler;
};
