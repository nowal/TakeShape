import type { FC } from 'react';
import { Map } from '@vis.gl/react-google-maps';
import { useAccountSettings } from '@/context/account-settings/provider';

export const MapPlaceholder: FC = () => {
  const { prevCoordsRef } = useAccountSettings();
  return (
    <div className="cursor-not-allowed">
      <Map
        className="h-[400px] rounded-lg bg-white-1 pointer-events-none grayscale"
        {...(prevCoordsRef.current !== null
          ? {
              center: new google.maps.LatLng(
                prevCoordsRef.current.lat,
                prevCoordsRef.current.lng
              ),
              zoom: 6,
            }
          : {
              zoom: 4,
              center: new google.maps.LatLng(
                37.4419,
                -122.1419
              ),
            })}
        mapTypeId={google.maps.MapTypeId.ROADMAP}
      />
    </div>
  );
};
