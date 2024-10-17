'use client';
import { APIProvider } from '@vis.gl/react-google-maps';
import { TProviderFc } from '@/context/type';
import { MAP_API_KEY } from '@/components/painter/address/map/constants';

export const MapsProvider: TProviderFc = ({ children }) => {
  return (
    <APIProvider apiKey={MAP_API_KEY}>
      {children}
    </APIProvider>
  );
};
