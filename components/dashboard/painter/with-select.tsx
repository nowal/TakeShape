import { useDashboardPainter } from '@/context/dashboard/painter/provider';
import { InputsSelect } from '@/components/inputs/select';
import { QUOTE_KEYS } from '@/components/dashboard/painter/constants';
import { TPropsWithChildren } from '@/types/dom/main';
import { FC } from 'react';
import { isQuoteType } from '@/components/dashboard/painter/validation';

type TProps = TPropsWithChildren;
export const DashboardPainterWithSelect: FC<TProps> = (
  props
) => {
  const { selectedPage, onPageChange } =
    useDashboardPainter();

  return (
    <div className="flex flex-col items-center px-4 md:px-8">
      <div className="flex flex-row item-center gap-2">
        <h3 className="typography-form-title leading-[38px]">Dashboard</h3>
        <InputsSelect
          name="painter-quote"
          basicValues={Object.keys(QUOTE_KEYS)}
          placeholder="Select Quote"
          value={selectedPage}
          onValueChange={(_, value) => {
            if (isQuoteType(value)) {
              onPageChange(value);
            }
          }}
        />
      </div>
      <div className="h-8" />
      {props.children}
    </div>
  );
};
