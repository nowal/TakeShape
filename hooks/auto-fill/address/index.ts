import {
  Dispatch,
  MutableRefObject,
  useEffect,
} from 'react';
import { loadGoogleMapsScript } from '@/utils/loadGoogleMapsScript'; // Adjust the import path as needed

type TConfig = {
  addressInputRef: MutableRefObject<HTMLInputElement | null>;
  dispatchAddress: Dispatch<string>;
};
export const useAutoFillAddress = (config: TConfig) => {
  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        await loadGoogleMapsScript(
          'AIzaSyCtM9oQWFui3v5wWI8A463_AN1QN0ITWAA'
        ); // Replace with your actual API key
        if (window.google) {
          const autocomplete =
            new window.google.maps.places.Autocomplete(
              config.addressInputRef.current!,
              {
                types: ['address'],
                componentRestrictions: { country: 'us' },
              }
            );

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (
              !place.geometry ||
              !place.geometry.location ||
              !place.address_components
            ) {
              console.error(
                'Error: place details are incomplete.'
              );
              return;
            }

            const formattedAddress =
              place.formatted_address;
            const location = place.geometry.location;

            config.dispatchAddress(formattedAddress || '');
            // setLat(location.lat());
            // setLng(location.lng());
          });
        }
      } catch (error) {
        console.error(
          'Error loading Google Maps script:',
          error
        );
      }
    };

    initAutocomplete();
  }, []);
};