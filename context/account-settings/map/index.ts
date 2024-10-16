'use client';
import { useMapDrag } from '@/context/account-settings/map/drag';
import { TAccountSettingsConfig } from '@/context/account-settings/types';
import { useEventListener } from '@/hooks/event-listener';
import { useEffect, useRef } from 'react';

type TConfig = TAccountSettingsConfig;
export const useAccountSettingsMap = (config: TConfig) => {
  const { coords, range } = config;
  const mapInstanceRef = useRef<google.maps.Map | null>(
    null
  );
  const markerRef =
    useRef<google.maps.marker.AdvancedMarkerElement | null>(
      null
    );

  const current = {
    coords,
    range,
  };
  const currentRef = useRef(current);
  currentRef.current = current;

  const { onDragEnd, onMapUpdate } = useMapDrag(
    config,
    markerRef
  );

  // useEffect(() => {
  //   if (coords) {
  //     markerRef.current =
  //       new google.maps.marker.AdvancedMarkerElement({
  //         position: coords,
  //         map: mapInstanceRef.current,
  //         gmpDraggable: true,
  //       });
  //   }
  // }, [coords]);

  useEventListener('dragend', onDragEnd, markerRef);

  return { onMapUpdate };
};
