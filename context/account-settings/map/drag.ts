import { MutableRefObject, useRef } from 'react';
import { TAccountSettingsConfig } from '@/context/account-settings/types';
import { isNumber } from '@/utils/validation/is/number';

type TConfig = TAccountSettingsConfig;
export const useMapDrag = (
  config: TConfig,
  markerRef: MutableRefObject<google.maps.marker.AdvancedMarkerElement | null>
) => {
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

      if (!mapInstanceRef.current) {
        const { Map } = (await maps.importLibrary(
          'maps'
        )) as google.maps.MapsLibrary;

        mapInstanceRef.current = new Map(mapElement, {
          // mapId: '4d7092f4ba346ef1',
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

  return { onDragEnd: handleDragEnd, onMapUpdate: handler };
};
