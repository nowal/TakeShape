import { InputsSelect } from '@/components/inputs/select';
import { TPainterAddressProps } from '@/components/painter/address/types';
import { TypographyFormTitle } from '@/components/typography/form/title';
import { RANGE_VALUES } from '@/constants/map';
import { useAccountSettings } from '@/context/account-settings/provider';
import { useBoundsUpdate } from '@/hooks/maps/bounds';
import { useMap } from '@vis.gl/react-google-maps';
import { FC } from 'react';

export const PainterRange: FC<TPainterAddressProps> = ({
  isReady,
}) => {
  const map = useMap();
  const { coords, range, dispatchRange } =
    useAccountSettings();
  const disabledProps = { isDisabled: !isReady };
  const handleBoundsUpdate = useBoundsUpdate();

  return (
    <div className="flex flex-row items-center gap-2">
      <TypographyFormTitle {...disabledProps}>
        Range
      </TypographyFormTitle>
      <InputsSelect
        name="range"
        placeholder="Range (miles)"
        value={range.toString()}
        onValueChange={(_, value) => {
          if (map === null) return;
          const miles = Number(value);
          handleBoundsUpdate(map, coords, miles);
          dispatchRange(miles);
        }}
        required
        basicValues={RANGE_VALUES}
        {...disabledProps}
      />
    </div>
  );
};
