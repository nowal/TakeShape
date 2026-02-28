import axios from 'axios';
import { notifyError } from '@/utils/notifications';
import { TCoordsValue } from '@/context/account-settings/types';

const GEOCODE_API_KEY =
  'AIzaSyCtM9oQWFui3v5wWI8A463_AN1QN0ITWAA';

export const parseCoordsFromAddress = (
  value: string
): TCoordsValue => {
  const match = String(value || '')
    .trim()
    .match(
      /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/
    );
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null;
  }
  return { lat, lng };
};

export const resolveAddressFromCoords = async (
  coords: TCoordsValue
): Promise<string | null> => {
  if (!coords) return null;
  const { lat, lng } = coords;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(
    `${lat},${lng}`
  )}&key=${GEOCODE_API_KEY}`;
  try {
    const response = await axios.get(url);
    if (
      response.data.status === 'OK' &&
      Array.isArray(response.data.results) &&
      response.data.results.length > 0
    ) {
      return (
        String(
          response.data.results[0].formatted_address ||
            ''
        ).trim() || null
      );
    }
  } catch (error) {
    console.error('Reverse geocoding request failed', error);
  }
  return null;
};

export const useAddressGeocodeHandler = () => {
  const handler = async (
    address: string
  ): Promise<TCoordsValue> => {
    console.log(
      'useGeocode.handleGeocodeAddress, address:',
      address
    );

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${GEOCODE_API_KEY}`;

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
