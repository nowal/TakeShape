import {
  ButtonsCvaButton,
  TButtonsCvaButtonProps,
} from '@/components/cva/button';
import { IconsPlus } from '@/components/icons/plus';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = TButtonsCvaButtonProps;
export const ButtonsCvaButtonAdd: FC<TProps> = (
  props
) => {
  return (
    <ButtonsCvaButton
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
      {...props}
    >
      <IconsPlus />
    </ButtonsCvaButton>
  );
};
