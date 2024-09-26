import { useDashboardPainter } from '@/context/dashboard/painter/provider';
import { InputsSelect } from '@/components/inputs/select';
import { QUOTE_TYPES } from '@/components/dashboard/painter/constants';
import { TPropsWithChildren } from '@/types/dom/main';
import { FC } from 'react';

type TProps = TPropsWithChildren
export const DashboardPainterWithSelect:FC<TProps> = (props) => {
  const { selectedPage, onPageChange } =
    useDashboardPainter();

  return (
    <div className="flex flex-col items-center px-4 md:px-8">
      <InputsSelect
        name="quote"
        basicValues={QUOTE_TYPES}
        placeholder="Select Quote"
        value={selectedPage}
        onValueChange={(_, value: string) => {
          onPageChange(value);
        }}
      />
      <div className='h-8'/>
      {props.children}
    </div>
  );
};
