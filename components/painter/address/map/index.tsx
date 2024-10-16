import { FC, useMemo } from 'react';
import {
  Map,
  useMap,
  AdvancedMarker,
  Pin,
} from '@vis.gl/react-google-maps';
import { useAccountSettings } from '@/context/account-settings/provider';
import { TypographyFormSubtitle } from '@/components/typography/form/subtitle';
import { cx } from 'class-variance-authority';
import { Circle } from './components/circle';
import { TPainterAddressProps } from '@/components/painter/address/types';
import { milesToMetres } from '@/utils/transform/miles-to-metres';
import { useBoundsUpdate } from '@/hooks/maps/bounds';

export const PainterAddressMap: FC<
  TPainterAddressProps
> = ({ isReady }) => {
  const map = useMap();
  const {
    range: rangeMiles,
    coords,
    dispatchCoords,
  } = useAccountSettings();

  const handleBounds = useBoundsUpdate();

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
    handleBounds(nextCoords, rangeMiles);
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
            fillColor="#ff385c"
            strokeColor="#ff385c"
            strokeOpacity={0.8}
            strokeWeight={2}
            fillOpacity={0.1}
          />
          <AdvancedMarker
            position={coords}
            draggable
            onDragEnd={handleDragEnd}
          >
            <Pin
              background="#ff385c"
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
