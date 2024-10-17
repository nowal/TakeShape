import { MutableRefObject, useEffect } from 'react';
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
  const {
    range,
    dispatchAddressFormatted,
    onCoordsUpdate,
  } = useAccountSettings();
  const handleBoundsUpdate = useBoundsUpdate();

  const init = async (
    map: google.maps.Map,
    places: google.maps.PlacesLibrary
  ) => {
    console.log(
      'INIT ',
      addressInputRef.current,
      map,
      places
    );
    const { Autocomplete } = places;
    if (!addressInputRef.current) return null;
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

      const formattedAddress = place.formatted_address;
      const location = place.geometry.location;

      dispatchAddressFormatted(formattedAddress || '');

      const nextCoords = {
        lat: location.lat(),
        lng: location.lng(),
      };
      console.log(
        'autocomplete place_changed updated nextCoords ',
        nextCoords
      );
      onCoordsUpdate(nextCoords);
      handleBoundsUpdate(map, nextCoords, range);
    });
  };

  useEffect(() => {
    if (places === null) return;
    if (map === null) return;
    init(map, places);
  }, [map, places]);
};
