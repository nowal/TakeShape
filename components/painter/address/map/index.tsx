import { FC, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  MapCameraChangedEvent,
  useApiLoadingStatus,
  useMap,
  useAdvancedMarkerRef,
  useMarkerRef,
  useApiIsLoaded,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { useAccountSettings } from '@/context/account-settings/provider';
import { TypographyFormSubtitle } from '@/components/typography/form/subtitle';
import { PoiMarkers } from '@/components/painter/address/map/poi';
import { cx } from 'class-variance-authority';

export const PainterAddressMap: FC = () => {
  const map = useMap();
  const places = useMapsLibrary('places');
  const marker = useMapsLibrary('marker');
  // const autofill = useRef<AutoFill | null>(null);
  const {
    address,
    coords,
    dispatchAddress,
    dispatchCoords,
    addressInputRef,
  } = useAccountSettings();
  console.log(address, ' ', coords);
  const loadingStatus = useApiLoadingStatus();

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

  return (
    <div>
      <TypographyFormSubtitle>
        Drag Marker to adjust service location
      </TypographyFormSubtitle>
      {coords !== null && loadingStatus === 'LOADED' ? (
        <Map
          className={cx('h-[400px]')}
          zoom={10}
          defaultCenter={coords}
          onCameraChanged={(
            event: MapCameraChangedEvent
          ) => {
            const position = event.detail.center;

            console.log(
              'camera changed:',
              event.detail.center,
              'zoom:',
              event.detail.zoom
            );

            // dispatchAddress(
            //   `${position.lat}, ${position.lng}`
            // );
          }}
          mapId="4d7092f4ba346ef1"
        >
          <PoiMarkers
            pois={
              coords
                ? [{ key: 'address', location: coords }]
                : []
            }
          />
        </Map>
      ) : (
        <div className="h-[400px]" />
      )}
    </div>
  );
};

{
  /* <div
         ref={(instance) => {
           if (instance && !mapElement) {
             dispatchMapElement(instance);
           }
         }}
         style={{
           height: '400px',
         }}
       ></div> */
}
