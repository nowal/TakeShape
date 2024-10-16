import { TCoords } from '@/context/account-settings/types';
import { resolveBounds } from '@/utils/maps/bounds';
import { useMap } from '@vis.gl/react-google-maps';

export const useBoundsUpdate = () => {
  const map = useMap();
  const handler = (...args: [TCoords, number]) => {
    if (!map) return;
    const googleMaps = window.google.maps;
    const bounds = resolveBounds(googleMaps, ...args);
    if (bounds) {
      map.fitBounds(bounds);
    }
  };

  return handler;
};
