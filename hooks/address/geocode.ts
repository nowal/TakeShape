import axios from 'axios';
import { notifyError } from '@/utils/notifications';
import { TCoordsValue } from '@/context/account-settings/types';

export const useAddressGeocodeHandler = () => {
  const handler = async (
    address: string
  ): Promise<TCoordsValue> => {
    console.log(
      'useGeocode.handleGeocodeAddress, address:',
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

  return handler;
};
