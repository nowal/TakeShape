import { FC, useEffect, useState } from 'react';
import {
  Map,
  MapCameraChangedEvent,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
  Pin,
} from '@vis.gl/react-google-maps';
import { useAccountSettings } from '@/context/account-settings/provider';
import { TypographyFormSubtitle } from '@/components/typography/form/subtitle';
import { cx } from 'class-variance-authority';
import { Circle } from './components/circle';
import { useAutocomplete } from '@/components/painter/address/map/autocomplete';

export const PainterAddressMap: FC = () => {
  const map = useMap();
  const [circleCenter, setCircleCenter] =
    useState<null | google.maps.LatLng>(null);
  const { coords, dispatchCoords } = useAccountSettings();

  useAutocomplete();

  const loadingStatus = useApiLoadingStatus();

  const handleDrag = (event: google.maps.MapMouseEvent) => {
    if (map === null) return;
    const position = event.latLng;
    if (position === null) return;
    console.log('marker clicked: ', position.toString());
    map.panTo(position);
    // setCircleCenter(position);

    const nextCoords = {
      lat: position.lat(),
      lng: position.lng(),
    };
    // dispatchCoords(nextCoords);
  };

  const handleDragEnd = (
    event: google.maps.MapMouseEvent
  ) => {
    if (map === null) return;
    const position = event.latLng;
    if (position === null) return;
    console.log('marker clicked: ', position.toString());
    map.panTo(position);
    setCircleCenter(position);

    const nextCoords = {
      lat: position.lat(),
      lng: position.lng(),
    };
    dispatchCoords(nextCoords);
  };

  console.log(coords, loadingStatus);

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
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
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
