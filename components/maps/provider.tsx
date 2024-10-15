'use client';
import { APIProvider } from '@vis.gl/react-google-maps';
import { TProviderFc } from '@/context/type';

export const MapsProvider: TProviderFc = ({ children }) => {
  return (
    <APIProvider
      apiKey="AIzaSyCtM9oQWFui3v5wWI8A463_AN1QN0ITWAA"
      onLoad={() => console.log('Maps API has loaded.')}
    >
      {children}
    </APIProvider>
  );
};
