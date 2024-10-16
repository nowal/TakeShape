import { TCoordsValue } from '@/context/account-settings/types';

export const resolveBounds = (
  maps: typeof google.maps | null,
  coords: TCoordsValue,
  range: number
) => {
  if (!maps) return;
  if (!coords) return;

  const { lat, lng } = coords;
  const bounds = new maps.LatLngBounds();
  const center = new maps.LatLng(lat, lng);
  bounds.extend(center);
  bounds.extend(new maps.LatLng(lat + range / 69, lng));
  bounds.extend(new maps.LatLng(lat - range / 69, lng));
  bounds.extend(new maps.LatLng(lat, lng + range / 69));
  bounds.extend(new maps.LatLng(lat, lng - range / 69));

  return bounds;
};
