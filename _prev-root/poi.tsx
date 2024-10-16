import { useEffect, useState, useRef } from 'react';
import {
  useMap,
  AdvancedMarker,
  Pin,
} from '@vis.gl/react-google-maps';

import { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { Marker } from '@googlemaps/markerclusterer';
import { Circle } from '../components/painter/address/map/components/circle';
import { TPoi } from '@/components/painter/address/map/type';
import { useAccountSettings } from '@/context/account-settings/provider';

export const PoiMarkers = (props: { pois: TPoi[] }) => {
  const { coords, dispatchCoords } = useAccountSettings();
  const map = useMap();
  // const [markers, setMarkers] = useState<{
  //   [key: string]: Marker;
  // }>({});
  // const clusterer = useRef<MarkerClusterer | null>(null);
  const [circleCenter, setCircleCenter] =
    useState<null | google.maps.LatLng>(null);


  // Initialize MarkerClusterer, if the map has changed
  // useEffect(() => {
  //   if (!map) return;
  //   if (!clusterer.current) {
  //     clusterer.current = new MarkerClusterer({ map });
  //   }
  // }, [map]);

  // Update markers, if the markers array has changed
  // useEffect(() => {
  //   clusterer.current?.clearMarkers();
  //   clusterer.current?.addMarkers(Object.values(markers));
  // }, [markers]);

  // const setMarkerRef = (
  //   marker: Marker | null,
  //   key: string
  // ) => {
  //   if (marker && markers[key]) return;
  //   if (!marker && !markers[key]) return;

  //   setMarkers((prev) => {
  //     if (marker) {
  //       return { ...prev, [key]: marker };
  //     } else {
  //       const newMarkers = { ...prev };
  //       delete newMarkers[key];
  //       return newMarkers;
  //     }
  //   });
  // };



  return (
    <>
     
    </>
  );
};
