import {
  ButtonsCvaButton,
  TButtonsCvaButtonProps,
} from '@/components/cva/button';
import { IconsPlusCircle } from '@/components/icons/plus/circle';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = TButtonsCvaButtonProps;
export const ButtonsCvaButtonAdd: FC<TProps> = ({
  children,
  ...props
}) => {
  return (
    <ButtonsCvaButton
      // size="iconMd"
      center
      classValue={cx(
        'flex flex-row items-center gap-1.5',
        // 'bg-white',
        // 'hover:bg-white-7 active:bg-pink active:text-white',
        // 'shadow-md',
        'z-10'
      )}
      icon={{ Leading: IconsPlusCircle }}
      {...props}
    >
      {children}
    </ButtonsCvaButton>
  );
};
