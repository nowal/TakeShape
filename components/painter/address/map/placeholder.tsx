import { FC } from 'react';
import { Map } from '@vis.gl/react-google-maps';
import { useAccountSettings } from '@/context/account-settings/provider';
import {
  DEFAULT_LNG,
  DEFAULT_LAT,
} from '@/components/painter/address/map/constants';

export const MapPlaceholder: FC = () => {
  const { prevCoordsRef } = useAccountSettings();

  return (
    <div className="cursor-not-allowed">
      <Map
        className="h-[400px] rounded-lg bg-white-1 pointer-events-none grayscale"
        {...(prevCoordsRef.current !== null
          ? {
              zoom: 6,
              center: new google.maps.LatLng(
                prevCoordsRef.current.lat,
                prevCoordsRef.current.lng
              ),
            }
          : {
              zoom: 4,
              center: new google.maps.LatLng(
                DEFAULT_LNG,
                DEFAULT_LAT
              ),
            })}
        mapTypeId={google.maps.MapTypeId.ROADMAP}
      />
    </div>
  );
};
