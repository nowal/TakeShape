import { Map } from '@vis.gl/react-google-maps';
import {
  DEFAULT_LNG,
  DEFAULT_LAT,
  MAP_ID,
} from '@/components/painter/address/map/constants';
import { TProviderFc } from '@/context/type';
import { MapsLoaded } from '@/components/maps/loaded/loaded';

export const MapsLoadedEmpty: TProviderFc = ({ children }) => {
  return (
    <MapsLoaded>
      <Map
        center={
          new google.maps.LatLng(DEFAULT_LNG, DEFAULT_LAT)
        }
        zoom={1}
        mapId={MAP_ID}
      />
      {children}
    </MapsLoaded>
  );
};
