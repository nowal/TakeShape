import { useEffect } from 'react';
import { loadGoogleMapsScript } from '@/utils/libs/load-google-maps-script'; // Adjust the import path as needed
import { errorLoading } from '@/utils/error';
import { notifyError } from '@/utils/notifications';
import { useAccountSettings } from '@/context/account-settings/provider';

export const useAutoFillAddress = () => {
  const {
    addressInputRef,
    dispatchAddress,
    dispatchAddressLoading,
    dispatchCoords,
  } = useAccountSettings();

  useEffect(() => {
    const initAutocomplete = async () => {
      console.log('useAutoFillAddress.initAutocomplete');

      try {
        dispatchAddressLoading(true);
        await loadGoogleMapsScript(
          'AIzaSyCtM9oQWFui3v5wWI8A463_AN1QN0ITWAA'
        ); // Replace with your actual API key
        if (
          window.google &&
          addressInputRef.current !== null
        ) {
          const { Autocomplete } =
            (await google.maps.importLibrary(
              'places'
            )) as google.maps.PlacesLibrary;

          const autocomplete = new Autocomplete(
            addressInputRef.current,
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

            dispatchAddress(formattedAddress || '');
            const nextCoords = {
              lat: location.lat(),
              lng: location.lng(),
            };
            console.log('nextCoords ', nextCoords);
            dispatchCoords(nextCoords);
          });
        }
      } catch (error) {
        const errorMessage = errorLoading(
          'Google Maps script'
        );
        notifyError(errorMessage);
        console.error(errorMessage, error);
      } finally {
        dispatchAddressLoading(false);
      }
    };

    initAutocomplete();
  }, []);
};
