import { useDashboardPainter } from '@/context/dashboard/painter/provider';
import { InputsSelect } from '@/components/inputs/select';
import { QUOTE_KEYS } from '@/components/dashboard/painter/constants';
import { TPropsWithChildren } from '@/types/dom/main';
import { FC } from 'react';
import { isQuoteType } from '@/components/dashboard/painter/validation';
import { TypographyFormTitle } from '@/components/typography/form/title';
import { DashboardHeader } from '@/components/dashboard/header';

type TProps = TPropsWithChildren;
export const DashboardPainterWithSelect: FC<TProps> = (
  props
) => {
  const { selectedPage, onPageChange } =
    useDashboardPainter();

  return (
    <div className="flex flex-col items-center px-4 md:px-8">
      <div className="h-8" />
      <DashboardHeader>
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
      </DashboardHeader>
      <div className="h-8" />
      <div>{props.children}</div>
    </div>
  );
};
