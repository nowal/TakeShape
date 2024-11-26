import { MutableRefObject, useEffect, useRef } from 'react';
import { useAccountSettings } from '@/context/account-settings/provider';
import { useBoundsUpdate } from '@/hooks/maps/bounds';
import {
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';

export type TAddressAutocompleteRef =
  MutableRefObject<HTMLInputElement | null>;

export const useAddressAutocomplete = (
  addressInputRef: TAddressAutocompleteRef
) => {
  const map = useMap();
  const places = useMapsLibrary('places');
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

  const init = async (
    map: google.maps.Map,
    places: google.maps.PlacesLibrary
  ) => {
    const { Autocomplete } = places;
    console.log("Here1");
    if (!addressInputRef.current) return null;
    console.log("Here2");
    const autocomplete = new Autocomplete(
      addressInputRef.current,
      {
        types: ['address'],
        componentRestrictions: { country: 'us' },
      }
    );
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      console.log("Here3");
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

      console.log("Here4");
      const formattedAddress = place.formatted_address;
      const location = place.geometry.location;

      dispatchAddressFormatted(formattedAddress || '');

      const nextCoords = {
        lat: location.lat(),
        lng: location.lng(),
      };

      handleBoundsUpdate(
        map,
        nextCoords,
        currentRef.current.range
      );
      onCoordsUpdate(nextCoords);
      console.log("Here5");
    });
  };

  useEffect(() => {
    if (places === null) return;
    if (map === null) return;
    init(map, places);
  }, [map, places]);
};
