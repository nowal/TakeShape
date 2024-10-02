import { TAccountSettingsMapReturn } from '@/context/account-settings/types';
import { loadGoogleMapsScript } from '@/utils/loadGoogleMapsScript'; // Adjust the import path as needed
import {
  Dispatch,
  MutableRefObject,
  useEffect,
} from 'react';

type TConfig = TAccountSettingsMapReturn & {
  addressInputRef: MutableRefObject<HTMLInputElement | null>;
  dispatchAddress: Dispatch<string>;
  range: number;
};
export const useAutoFillAddressGeocode = ({
  addressInputRef,
  dispatchAddress,
  onInitializeMap,
  range,
}: TConfig) => {
  const geocodeAddress = (
    address: string,
    nextRange = range
  ) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (
        status === 'OK' &&
        results &&
        results[0].geometry.location
      ) {
        const location = results[0].geometry.location;
        onInitializeMap(
          location.lat(),
          location.lng(),
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
      try {
        await loadGoogleMapsScript(
          'AIzaSyCtM9oQWFui3v5wWI8A463_AN1QN0ITWAA'
        ); // Replace with your actual API key
        if (
          window.google &&
          addressInputRef.current !== null
        ) {
          const autocomplete =
            new window.google.maps.places.Autocomplete(
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

            dispatchAddress(place.formatted_address ?? ''); // Add a fallback value
            geocodeAddress(place.formatted_address ?? '');
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

  return geocodeAddress;
};

// useEffect(() => {
//   const initAutocomplete = async () => {
//     try {
//       await loadGoogleMapsScript(
//         'AIzaSyCtM9oQWFui3v5wWI8A463_AN1QN0ITWAA'
//       ); // Replace with your actual API key
//       if (window.google) {
//         const autocomplete =
//           new window.google.maps.places.Autocomplete(
//             addressInputRef.current!,
//             {
//               types: ['address'],
//               componentRestrictions: { country: 'us' },
//             }
//           );

//         autocomplete.addListener('place_changed', () => {
//           const place = autocomplete.getPlace();
//           if (
//             !place.geometry ||
//             !place.geometry.location ||
//             !place.address_components
//           ) {
//             console.error(
//               'Error: place details are incomplete.'
//             );
//             return;
//           }

//           const formattedAddress =
//             place.formatted_address;
//           const location = place.geometry.location;

//           dispatchAddress(formattedAddress || '');
//           // setLat(location.lat());
//           // setLng(location.lng());
//         });
//       }
//     } catch (error) {
//       console.error(
//         'Error loading Google Maps script:',
//         error
//       );
//     }
//   };

//   initAutocomplete();
// }, [])
