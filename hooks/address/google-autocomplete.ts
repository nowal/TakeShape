import { MutableRefObject, useEffect, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export type TAddressInputRef =
  MutableRefObject<HTMLInputElement | null>;

type TConfig = {
  onPlaceChange(
    place: google.maps.places.PlaceResult
  ): void;
};

export const useGoogleAddressAutocomplete = (
  addressInputRef: TAddressInputRef,
  { onPlaceChange }: TConfig
) => {
  const places = useMapsLibrary('places');
  const callbackRef = useRef(onPlaceChange);
  callbackRef.current = onPlaceChange;

  useEffect(() => {
    if (places === null || !addressInputRef.current) {
      return;
    }

    const { Autocomplete } = places;
    const autocomplete = new Autocomplete(
      addressInputRef.current,
      {
        types: ['address'],
        componentRestrictions: { country: 'us' },
      }
    );

    const listener = autocomplete.addListener(
      'place_changed',
      () => {
        const place = autocomplete.getPlace();
        if (!place) return;
        callbackRef.current(place);
      }
    );

    return () => {
      google.maps.event.removeListener(listener);
      google.maps.event.clearInstanceListeners(
        autocomplete
      );
    };
  }, [addressInputRef, places]);
};
