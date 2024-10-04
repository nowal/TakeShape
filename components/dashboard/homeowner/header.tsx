import { ButtonsCvaButton } from '@/components/cva/button';
import { DashboardHeader } from '@/components/dashboard/header';
import { IconsPlus } from '@/components/icons/plus';
import {
  InputsSelect,
  TInputsSelectProps,
} from '@/components/inputs/select';
import { TypographyFormTitle } from '@/components/typography/form/title';
import { useAuth } from '@/context/auth/provider';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = Partial<TInputsSelectProps> &
  Pick<TInputsSelectProps, 'onValueChange'>;
export const DashboardHomeownerHeader: FC<TProps> = (
  props
) => {
  const { onNavigateScrollTopClick } = useAuth();
  return (
    <DashboardHeader>
      <TypographyFormTitle>Your Quotes</TypographyFormTitle>
      <InputsSelect
        name="client-quote"
        placeholder="Select Quote"
        {...props}
      />
      <ButtonsCvaButton
        onTap={() => onNavigateScrollTopClick('/quote')}
        title="Add New Quote"
        isIconOnly
        size="iconMd"
        rounded="full"
        center
        classValue={cx(
          'text-pink',
          'bg-white',
          'hover:bg-white-7 active:bg-pink active:text-white',
          'shadow-md',
          'z-10'
        )}
      >
        <IconsPlus />
      </ButtonsCvaButton>
    </DashboardHeader>
  );
};
