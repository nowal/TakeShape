import { ButtonsCvaButtonAdd } from '@/components/cva/button/add';
import { DashboardHeader } from '@/components/dashboard/header';
import {
  InputsSelect,
  TInputsSelectProps,
} from '@/components/inputs/select';
import { TypographyFormTitle } from '@/components/typography/form/title';
import { useApp } from '@/context/app/provider';
import type { FC } from 'react';

type TProps = Partial<TInputsSelectProps> &
  Pick<TInputsSelectProps, 'onValueChange' | 'value'>;
export const DashboardHomeownerHeader: FC<TProps> = (
  props
) => {
  const { onNavigateScrollTopClick } = useApp();
  return (
    <DashboardHeader>
      <TypographyFormTitle>Your Quotes</TypographyFormTitle>
      <InputsSelect
        name="client-quote"
        placeholder="Select Quote"
        {...props}
      />
      <ButtonsCvaButtonAdd
        onTap={() => onNavigateScrollTopClick('/quote')}
        title="Add New Quote"
      />
    </DashboardHeader>
  );
};
