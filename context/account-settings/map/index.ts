'use client';
import {
  TAccountSettingsConfig,
  TCoordsValue,
} from '@/context/account-settings/types';
import { useEventListener } from '@/hooks/event-listener';
import { isNumber } from '@/utils/validation/is/number';
import { useEffect, useRef, useState } from 'react';

type TProps = TAccountSettingsConfig;
export const useAccountSettingsMap = (config: TProps) => {
  const { coords, mapElementRef, dispatchAddress } = config;
  const mapInstanceRef = useRef<google.maps.Map | null>(
    null
  );
  const circleRef = useRef<google.maps.Circle | null>(null);
  const markerRef =
    useRef<google.maps.marker.AdvancedMarkerElement | null>(
      null
    );
  const [range, setRange] = useState(10);

  const handler = async (
    coords: TCoordsValue,
    range: number
  ) => {
    if (coords === null) {
      console.log('COORDS NULL ');
    } else {
      console.log('COORDS ', coords);
    }
    console.log(
      ' window.google ',
      window.google,
      ' mapElementRef ',
      mapElementRef.current,
      ' COORDS ',
      coords
    );

    if (
      window.google &&
      mapElementRef.current &&
      coords !== null
    ) {
      const { lat, lng } = coords;
      const bounds = new window.google.maps.LatLngBounds();
      const center = new window.google.maps.LatLng(
        lat,
        lng
      );
      bounds.extend(center);
      bounds.extend(
        new window.google.maps.LatLng(lat + range / 69, lng)
      );
      bounds.extend(
        new window.google.maps.LatLng(lat - range / 69, lng)
      );
      bounds.extend(
        new window.google.maps.LatLng(lat, lng + range / 69)
      );
      bounds.extend(
        new window.google.maps.LatLng(lat, lng - range / 69)
      );
      console.log(
        'LOADING ',
        mapInstanceRef.current,
        '  ',
        mapElementRef.current
      );
      if (!mapInstanceRef.current) {
        const { Map } = (await google.maps.importLibrary(
          'maps'
        )) as google.maps.MapsLibrary;

        mapInstanceRef.current = new Map(
          mapElementRef.current,
          {
            mapId: '4d7092f4ba346ef1',
            center: { lat, lng },
            zoom: 10,
          }
        );
      } else {
        mapInstanceRef.current.fitBounds(bounds);
      }

      if (!circleRef.current) {
        circleRef.current = new window.google.maps.Circle({
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
        new window.google.maps.marker.AdvancedMarkerElement(
          {
            position: coords,
            map: mapInstanceRef.current,
            gmpDraggable: true,
          }
        );
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
    handler({ lat: newLat, lng: newLng }, range);
  };

  useEventListener('dragend', handleDragEnd, markerRef);

  return {
    range,
    dispatchRange: setRange,
    onUpdateMap: handler,
  };
};
