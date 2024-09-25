'use client';
import { TAccountSettingsConfig } from '@/context/account-settings/types';
import { useRef } from 'react';

type TProps = TAccountSettingsConfig;
export const useAccountSettingsMap = (config: TProps) => {
  const mapInstanceRef = useRef<google.maps.Map | null>(
    null
  );
  const circleRef = useRef<google.maps.Circle | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const handler = (
    lat: number,
    lng: number,
    range: number
  ) => {
    if (window.google && config.mapRef.current) {
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

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(
          config.mapRef.current,
          {
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

      if (!markerRef.current) {
        markerRef.current = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstanceRef.current,
          draggable: true,
        });

        markerRef.current.addListener('dragend', () => {
          const newLat = markerRef
            .current!.getPosition()!
            .lat();
          const newLng = markerRef
            .current!.getPosition()!
            .lng();
          config.dispatchAddress(`${newLat}, ${newLng}`);
          handler(newLat, newLng, range);
        });
      } else {
        markerRef.current.setPosition({ lat, lng });
      }

      mapInstanceRef.current.fitBounds(
        circleRef.current.getBounds()!
      );
    }
  };

  return {
    onInitializeMap: handler,
  };
};

// const initializeMap = (
//   lat: number,
//   lng: number,
//   range: number
// ) => {
//   if (window.google && mapRef.current) {
//     const bounds = new window.google.maps.LatLngBounds();
//     const center = new window.google.maps.LatLng(
//       lat,
//       lng
//     );
//     bounds.extend(center);
//     bounds.extend(
//       new window.google.maps.LatLng(lat + range / 69, lng)
//     );
//     bounds.extend(
//       new window.google.maps.LatLng(lat - range / 69, lng)
//     );
//     bounds.extend(
//       new window.google.maps.LatLng(lat, lng + range / 69)
//     );
//     bounds.extend(
//       new window.google.maps.LatLng(lat, lng - range / 69)
//     );

//     if (!mapInstanceRef.current) {
//       mapInstanceRef.current = new window.google.maps.Map(
//         mapRef.current,
//         {
//           center: { lat, lng },
//           zoom: 10,
//         }
//       );
//     } else {
//       mapInstanceRef.current.fitBounds(bounds);
//     }

//     if (!circleRef.current) {
//       circleRef.current = new window.google.maps.Circle({
//         map: mapInstanceRef.current,
//         center: { lat, lng },
//         radius: range * 1609.34, // Convert miles to meters
//         fillColor: '#AA0000',
//         strokeColor: '#AA0000',
//         strokeOpacity: 0.8,
//         strokeWeight: 2,
//         fillOpacity: 0.35,
//       });
//     } else {
//       circleRef.current.setCenter({ lat, lng });
//       circleRef.current.setRadius(range * 1609.34);
//     }

//     if (!markerRef.current) {
//       markerRef.current = new window.google.maps.Marker({
//         position: { lat, lng },
//         map: mapInstanceRef.current,
//         draggable: true,
//       });

//       markerRef.current.addListener('dragend', () => {
//         const newLat = markerRef
//           .current!.getPosition()!
//           .lat();
//         const newLng = markerRef
//           .current!.getPosition()!
//           .lng();
//         dispatchAddress(`${newLat}, ${newLng}`);
//         initializeMap(newLat, newLng, range);
//       });
//     } else {
//       markerRef.current.setPosition({ lat, lng });
//     }

//     mapInstanceRef.current.fitBounds(
//       circleRef.current.getBounds()!
//     );
//   }
// };
