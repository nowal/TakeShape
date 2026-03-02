import { useRef } from 'react';
import { useAccountSettings } from '@/context/account-settings/provider';
import { useBoundsUpdate } from '@/hooks/maps/bounds';
import { useMap } from '@vis.gl/react-google-maps';
import {
  TAddressInputRef,
  useGoogleAddressAutocomplete,
} from '@/hooks/address/google-autocomplete';

export type TAddressAutocompleteRef = TAddressInputRef;

export const useAddressAutocomplete = (
  addressInputRef: TAddressAutocompleteRef
) => {
  const map = useMap();
  const accountSettings = useAccountSettings();
  const {
    range,
    dispatchAddressFormatted,
    dispatchAddress,
    onCoordsUpdate,
  } = accountSettings;
  const current = {
    range,
  };
  const currentRef = useRef(current);
  currentRef.current = current;
  const handleBoundsUpdate = useBoundsUpdate();

  useGoogleAddressAutocomplete(addressInputRef, {
    onPlaceChange: (place) => {
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

      const formattedAddress = place.formatted_address;
      const location = place.geometry.location;

      dispatchAddressFormatted(formattedAddress || '');

      const nextCoords = {
        lat: location.lat(),
        lng: location.lng(),
      };

      if (map !== null) {
        handleBoundsUpdate(
          map,
          nextCoords,
          currentRef.current.range
        );
      }
      onCoordsUpdate(nextCoords);
    },
  });
};
