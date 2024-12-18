import { useAddressGeocodeHandler } from '@/hooks/address/geocode';
import { TJob } from '@/types/jobs';
import { isNumber } from '@/utils/validation/is/number';

export const useJobCoords = () => {
  const handleAddressGeocode = useAddressGeocodeHandler();
  const handler = async (jobData: TJob) => {
    const { lat, lng } = jobData;
    if (!isNumber(lat) || !isNumber(lng)) {
      console.log(
        'Geocoding address...',
        'lat or lng was not a number...',
        jobData
      );
      const coords = await handleAddressGeocode(
        jobData.address
      );
      console.log("Got Stuff:")
      console.log(coords);
      return coords;
    }
    return { lat, lng };
  };

  return handler;
};
