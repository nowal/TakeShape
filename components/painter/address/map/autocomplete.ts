import { useAccountSettings } from "@/context/account-settings/provider";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect } from "react";

type TConfig = any;
export const useAutocomplete = (config?:TConfig) => {
  const {
    dispatchAddress,
    dispatchCoords,
    addressInputRef,
  } = useAccountSettings();
  const places = useMapsLibrary('places');

  const init = async (
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

      dispatchAddress(formattedAddress || '');
      const nextCoords = {
        lat: location.lat(),
        lng: location.lng(),
      };
      console.log('nextCoords ', nextCoords);
      dispatchCoords(nextCoords);
    });
  };

  

  useEffect(() => {
    
    if (!places) return;
    init(places);
  }, [places]);

}