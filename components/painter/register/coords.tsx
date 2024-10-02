import type { FC } from 'react';
import { useAccountSettings } from '@/context/account-settings/provider';

export const ComponentsPainterRegisterCoords: FC = () => {
  const { mapRef } = useAccountSettings();
  return (
    <>
      <div className="text-left text-gray-700 mb-2">
        Drag Marker to adjust service location
      </div>
      <div
        ref={mapRef}
        style={{
          height: '400px',
          marginTop: '20px',
        }}
      ></div>
    </>
  );
};
