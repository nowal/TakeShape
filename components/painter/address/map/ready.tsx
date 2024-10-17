import { FC, useEffect, useMemo } from 'react';
import { useAccountSettings } from '@/context/account-settings/provider';
import { useBoundsUpdate } from '@/hooks/maps/bounds';
import { milesToMetres } from '@/utils/transform/miles-to-metres';
import {
  AdvancedMarker,
  Pin,
  useMap,
  Map,
} from '@vis.gl/react-google-maps';
import { AddressCircle } from '@/components/painter/address/map/components/circle';
import { cx } from 'class-variance-authority';
import {
  DEFAULT_LNG,
  DEFAULT_LAT,
  MAP_ID,
} from '@/components/painter/address/map/constants';

export const MapReady: FC = () => {
  const map = useMap();
  const {
    range: rangeMiles,
    coords,
    onCoordsUpdate,
    dispatchAddress,
  } = useAccountSettings();

  const rangeMetres = useMemo(() => {
    const value = milesToMetres(rangeMiles);
    return value;
  }, [rangeMiles]);

  const handleBounds = useBoundsUpdate();

  const handleDragEnd = (
    event: google.maps.MapMouseEvent
  ) => {
    if (map === null) return;
    const position = event.latLng;
    if (position === null) return;
    map.panTo(position);

    const nextLat = position.lat();
    const nextLng = position.lng();

    const nextCoords = {
      lat: nextLat,
      lng: nextLng,
    };
    onCoordsUpdate(nextCoords);
    handleBounds(map, nextCoords, rangeMiles);
    dispatchAddress(`${nextLat}, ${nextLng}`);
  };

  const isReady = map !== null && coords !== null;

  useEffect(() => {
    if (isReady) {
      handleBounds(map, coords, rangeMiles);
    }
  }, [isReady]);

  return (
    <Map
      className={cx('h-[400px]')}
      defaultZoom={10}
      defaultCenter={{
        lat: DEFAULT_LAT,
        lng: DEFAULT_LNG,
      }}
      mapId={MAP_ID}
    >
      <AddressCircle
        radius={rangeMetres}
        center={coords}
        fillColor="#ff385c"
        strokeColor="#ff385c"
        strokeOpacity={0.8}
        strokeWeight={2}
        fillOpacity={0.1}
      />
      <AdvancedMarker
        position={coords}
        draggable
        clickable
        onDragEnd={handleDragEnd}
        className="outline-none border-transparent"
        style={{ outline: 'transparent' }}
      >
        <Pin
          background="#ff385c"
          glyphColor="#000"
          borderColor="#000"
        />
      </AdvancedMarker>
    </Map>
  );
};
