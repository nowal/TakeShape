import { InputsSelect } from '@/components/inputs/select';
import { TypographyFormTitle } from '@/components/typography/form/title';
import { RANGE_VALUES } from '@/constants/map';
import { useAccountSettings } from '@/context/account-settings/provider';

export const PainterRange =
  () => {
    const { range, dispatchRange } = useAccountSettings();
    return (
      <div className="flex flex-row items-center gap-2">
        <TypographyFormTitle>Range</TypographyFormTitle>
        <InputsSelect
          name="range"
          placeholder="Range (miles)"
          value={range.toString()}
          onValueChange={(_, value) =>
            dispatchRange(Number(value))
          }
          required
          basicValues={RANGE_VALUES}
        />
      </div>
    );
  };
