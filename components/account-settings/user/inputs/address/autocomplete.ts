import { useEffect } from 'react';
import { useAccountSettings } from '@/context/account-settings/provider';
import { useBoundsUpdate } from '@/hooks/maps/bounds';
import {
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';

export const useAddressAutocomplete = () => {
  const map = useMap();
  const {
    range,
    dispatchAddressFormatted,
    prevCoordsRef,
    dispatchCoords,
    addressInputRef,
  } = useAccountSettings();
  const places = useMapsLibrary('places');
  const handleBoundsUpdate = useBoundsUpdate();

  const init = async (
    map: google.maps.Map,
    places: google.maps.PlacesLibrary
  ) => {
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
      prevCoordsRef.current = nextCoords;
      dispatchCoords(nextCoords);
      handleBoundsUpdate(map, nextCoords, range);
    });
  };

  useEffect(() => {
    if (places === null) return;
    if (map === null) return;
    init(map, places);
  }, [map, places]);
};
