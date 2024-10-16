import { FC, useEffect, useRef, useState } from 'react';
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
  AdvancedMarker,
  Pin,
} from '@vis.gl/react-google-maps';
import { useAccountSettings } from '@/context/account-settings/provider';
import { TypographyFormSubtitle } from '@/components/typography/form/subtitle';
import { PoiMarkers } from '@/components/painter/address/map/poi';
import { cx } from 'class-variance-authority';
import { Circle } from './components/circle';

export const PainterAddressMap: FC = () => {
  const map = useMap();
  const [circleCenter, setCircleCenter] =
    useState<null | google.maps.LatLng>(null);
  // const map = useMap();
  const places = useMapsLibrary('places');
  // const marker = useMapsLibrary('marker');
  // const autofill = useRef<AutoFill | null>(null);
  const {
    address,
    coords,
    dispatchAddress,
    dispatchCoords,
    addressInputRef,
  } = useAccountSettings();
  // console.log(address, ' ', coords);
  const loadingStatus = useApiLoadingStatus();

  const handleClick = (
    event: google.maps.MapMouseEvent
  ) => {
    if (!map) return;
    if (!event.latLng) return;
    console.log(
      'marker clicked: ',
      event.latLng.toString()
    );
    map.panTo(event.latLng);
    setCircleCenter(event.latLng);
  };

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

  const handleDrag = (event: google.maps.MapMouseEvent) => {
    if (!map) return;
    const position = event.latLng;
    if (!position) return;
    console.log('marker clicked: ', position.toString());
    map.panTo(position);
    setCircleCenter(position);

    const nextCoords = {
      lat: position.lat(),
      lng: position.lng(),
    };
    dispatchCoords(nextCoords);
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
          defaultZoom={10}
          defaultCenter={coords}
          onCameraChanged={(
            event: MapCameraChangedEvent
          ) => {
            // const position = event.detail.center;
            console.log(
              'camera changed:',
              event.detail.center,
              'zoom:',
              event.detail.zoom
            );
          }}
          mapId="4d7092f4ba346ef1"
        >
          <Circle
            radius={800}
            center={circleCenter}
            strokeColor="#0c4cb3"
            strokeOpacity={1}
            strokeWeight={3}
            fillColor="#3b82f6"
            fillOpacity={0.3}
          />
          <AdvancedMarker
            position={coords}
            clickable
            draggable
            onClick={handleClick}
            onDrag={handleDrag}
            // ref={(marker) => setMarkerRef(marker, poi.key)}
          >
            <Pin
              background="#FBBC04"
              glyphColor="#000"
              borderColor="#000"
            />
          </AdvancedMarker>
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
