import { FC, useMemo, useState } from 'react';
import {
  Map,
  useMap,
  AdvancedMarker,
  useMapsLibrary,
  Pin,
} from '@vis.gl/react-google-maps';
import { useAccountSettings } from '@/context/account-settings/provider';
import { TypographyFormSubtitle } from '@/components/typography/form/subtitle';
import { cx } from 'class-variance-authority';
import { Circle } from './components/circle';
import { TPainterAddressProps } from '@/components/painter/address/types';
import { milesToMetres } from '@/utils/transform/miles-to-metres';

export const PainterAddressMap: FC<
  TPainterAddressProps
> = ({ isReady }) => {
  const map = useMap();
  const maps = useMapsLibrary('maps');
  const {
    range: rangeMiles,
    coords,
    dispatchCoords,
  } = useAccountSettings();

  const handleDragEnd = (
    event: google.maps.MapMouseEvent
  ) => {
    if (map === null) return;
    const position = event.latLng;
    if (position === null) return;
    map.panTo(position);

    const nextCoords = {
      lat: position.lat(),
      lng: position.lng(),
    };
    dispatchCoords(nextCoords);
  };

  const rangeMetres = useMemo(() => {
    const value = milesToMetres(rangeMiles);
    return value;
  }, [rangeMiles]);

  return (
    <div className="flex flex-col items-stretch gap-2">
      <TypographyFormSubtitle isDisabled={!isReady}>
        Drag Marker to adjust service location
      </TypographyFormSubtitle>
      {isReady && coords ? (
        <Map
          className={cx('h-[400px]')}
          defaultZoom={10}
          defaultCenter={coords}
          center={coords}
          mapId="4d7092f4ba346ef1"
        >
          <Circle
            radius={rangeMetres}
            center={coords}
            strokeColor="#0c4cb3"
            strokeOpacity={1}
            strokeWeight={3}
            fillColor="#3b82f6"
            fillOpacity={0.3}
          />
          <AdvancedMarker
            position={coords}
            draggable
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
        <div className="h-[400px] rounded-lg bg-white-1" />
      )}
    </div>
  );
};
