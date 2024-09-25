import type { FC } from 'react';
import { TAccountSettingsConfig } from '@/context/account-settings/types';

type TProps = Pick<TAccountSettingsConfig, 'mapRef'>;
export const ComponentsAccountSettingsPainterMarker: FC<
  TProps
> = ({ mapRef }) => {
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
      />
    </>
  );
};
