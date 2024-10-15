'use client';
import {
  TAccountSettingsConfig,
  TCoordsValue,
} from '@/context/account-settings/types';
import { useEventListener } from '@/hooks/event-listener';
import { isNumber } from '@/utils/validation/is/number';
import { useEffect, useRef } from 'react';

type TProps = TAccountSettingsConfig;
export const useAccountSettingsMap = (config: TProps) => {
  const {
    coords,
    mapElement,
    dispatchAddress,
    range,
    dispatchCoords,
  } = config;
  const mapInstanceRef = useRef<google.maps.Map | null>(
    null
  );
  const circleRef = useRef<google.maps.Circle | null>(null);
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

  const handler = async (
    coords = currentRef.current.coords,
    range = currentRef.current.range
  ) => {
    console.log(currentRef)
    console.log(coords, currentRef.current)

    if (coords === null) {
      console.log('COORDS NULL ');
    } else {
      console.log('COORDS ', coords);
    }
    console.log(
      ' google ',
      window.google,
      ' mapElementRef ',
      mapElement,
      ' COORDS ',
      coords
    );
    const maps = window.google.maps;

    if (maps && mapElement && coords !== null) {
      const { lat, lng } = coords;
      const bounds = new maps.LatLngBounds();
      const center = new maps.LatLng(lat, lng);
      bounds.extend(center);
      bounds.extend(new maps.LatLng(lat + range / 69, lng));
      bounds.extend(new maps.LatLng(lat - range / 69, lng));
      bounds.extend(new maps.LatLng(lat, lng + range / 69));
      bounds.extend(new maps.LatLng(lat, lng - range / 69));
      console.log(
        'LOADING ',
        mapInstanceRef.current,
        '  ',
        mapElement
      );
      if (!mapInstanceRef.current) {
        const { Map } = (await maps.importLibrary(
          'maps'
        )) as google.maps.MapsLibrary;

        mapInstanceRef.current = new Map(mapElement, {
          mapId: '4d7092f4ba346ef1',
          center: { lat, lng },
          zoom: 10,
        });
      } else {
        mapInstanceRef.current.fitBounds(bounds);
      }

      if (!circleRef.current) {
        circleRef.current = new maps.Circle({
          map: mapInstanceRef.current,
          center: { lat, lng },
          radius: range * 1609.34, // Convert miles to meters
          fillColor: '#AA0000',
          strokeColor: '#AA0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillOpacity: 0.35,
        });
      } else {
        circleRef.current.setCenter({ lat, lng });
        circleRef.current.setRadius(range * 1609.34);
      }

      if (markerRef.current) {
        markerRef.current.position = { lat, lng };
        // markerRef.current.addListener(
        //   'dragend',
        //   handleDragEnd
        // );
      }

      mapInstanceRef.current.fitBounds(
        circleRef.current.getBounds()!
      );
    }
  };

  useEffect(() => {
    if (coords) {
      markerRef.current =
        new google.maps.marker.AdvancedMarkerElement({
          position: coords,
          map: mapInstanceRef.current,
          gmpDraggable: true,
        });
    }
  }, [coords]);

  const handleDragEnd = () => {
    console.log(' HANDLE DRAG END ');
    const position = markerRef.current?.position;
    if (!position) return;
    let newLat = position.lat;
    newLat = isNumber(newLat) ? newLat : newLat();
    let newLng = position.lng;
    newLng = isNumber(newLng) ? newLng : newLng();

    dispatchAddress(`${newLat}, ${newLng}`);
    dispatchCoords({ lat: newLat, lng: newLng });
    handler();
  };

  useEventListener('dragend', handleDragEnd, markerRef);

  return { onUpdateMap: handler };
};
