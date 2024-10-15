import { TAccountSettingsAddressGeocodeConfig } from '@/context/account-settings/types';
import { loadGoogleMapsScript } from '@/utils/libs/load-google-maps-script'; // Adjust the import path as needed
import { notifyError } from '@/utils/notifications';
import { useEffect } from 'react';

export const useAutoFillAddressGeocode = ({
  range,
  addressInputRef,
  dispatchAddress,
  onUpdateMap,
  dispatchCoords,
}: TAccountSettingsAddressGeocodeConfig) => {
  const geocodeAddress = (
    address: string,
    nextRange = range
  ) => {
    console.log('useAutoFillAddressGeocode.geocodeAddress');
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (
        status === 'OK' &&
        results &&
        results[0].geometry.location
      ) {
        const location = results[0].geometry.location;
        const nextCoords = {
          lat: location.lat(),
          lng: location.lng(),
        };
        console.log('nextCoords ', nextCoords);
        dispatchCoords(nextCoords);
        onUpdateMap(
          { lat: location.lat(), lng: location.lng() },
          nextRange
        );
      } else {
        console.error(
          'Geocode was not successful for the following reason: ' +
            status
        );
      }
    });
  };

  useEffect(() => {
    const initAutocomplete = async () => {
      console.log(
        'useAutoFillAddressGeocode.initAutocomplete'
      );

      try {
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
            dispatchAddress(formattedAddress ?? ''); // Add a fallback value
            const nextCoords = {
              lat: location.lat(),
              lng: location.lng(),
            };
            console.log('nextCoords ', nextCoords);
            dispatchCoords(nextCoords);

            geocodeAddress(formattedAddress ?? '');

          });
        }
      } catch (error) {
        const errorMessage =
          'Error loading Google Maps script';
        console.error(errorMessage, error);
        notifyError(errorMessage);
      }
    };

    initAutocomplete();
  }, []);

  return geocodeAddress;
};
