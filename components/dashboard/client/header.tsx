import { ButtonsCvaButton } from '@/components/cva/button';
import { IconsPlus } from '@/components/icons/plus';
import {
  InputsSelect,
  TInputsSelectProps,
} from '@/components/inputs/select';
import { cx } from 'class-variance-authority';
import { useRouter } from 'next/navigation';
import type { FC } from 'react';

type TProps = Partial<TInputsSelectProps> &
  Pick<TInputsSelectProps, 'onValueChange'>;
export const DashboardClientHeader: FC<TProps> = (
  props
) => {
  const router = useRouter();
  return (
    <div
      className={cx(
        'flex flex-row items-center justify-start',
        'gap-2'
      )}
    >
      <InputsSelect
        name="quote-change"
        placeholder="Your Quotes"
        {...props}
      />
      <ButtonsCvaButton
        onTap={() => router.push('/quote')}
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
    </div>
  );
};
