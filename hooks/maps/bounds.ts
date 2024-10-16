import { TCoordsValue } from '@/context/account-settings/types';
import { resolveBounds } from '@/utils/maps/bounds';

export const useBoundsUpdate = () => {
  const handler = (
    ...argsInit: [google.maps.Map, TCoordsValue, number]
  ) => {
    const [map, ...args] = argsInit;
    if (map === null) return;
    const googleMaps = window.google.maps;
    const bounds = resolveBounds(googleMaps, ...args);
    if (bounds) {
      map.fitBounds(bounds);
    }
  };

  return handler;
};
