import type { FC } from 'react';
import { useAccountSettings } from '@/context/account-settings/provider';
import { TypographyFormSubtitle } from '@/components/typography/form/subtitle';

export const ComponentsAccountSettingsPainterMap: FC =
  () => {
    const { mapElementRef } = useAccountSettings();
    return (
      <div>
        <TypographyFormSubtitle>
          Drag Marker to adjust service location
        </TypographyFormSubtitle>
        <div
          ref={mapElementRef}
          style={{
            height: '400px',
          }}
        ></div>
      </div>
    );
  };
