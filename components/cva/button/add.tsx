import {
  CvaButton,
  TCvaButtonProps,
} from '@/components/cva/button';
import { IconsPlusCircle } from '@/components/icons/plus/circle';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = TCvaButtonProps;
export const CvaButtonAdd: FC<TProps> = ({
  children,
  ...props
}) => {
  return (
    <CvaButton
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
    </CvaButton>
  );
};
