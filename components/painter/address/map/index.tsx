import { FC } from 'react';
import { TypographyFormSubtitle } from '@/components/typography/form/subtitle';
import { TPainterAddressProps } from '@/components/painter/address/types';
import { MapPlaceholder } from '@/components/painter/address/map/ placeholder';
import { MapReady } from '@/components/painter/address/map/ready';

export const PainterAddressMap: FC<
  TPainterAddressProps
> = ({ isReady }) => {
  
  return (
    <div className="flex flex-col items-stretch gap-2">
      <TypographyFormSubtitle isDisabled={!isReady}>
        Drag Marker to adjust service location
      </TypographyFormSubtitle>
      {isReady ? <MapReady /> : <MapPlaceholder />}
    </div>
  );
};
