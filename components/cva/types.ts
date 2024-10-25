import { FC } from 'react';
import { VariantProps } from 'class-variance-authority';
import { buttonsCvaConfig } from '@/components/cva/config';
import { useCvaProps } from '@/components/cva/props';
import { TCvaChildrenProps } from '@/components/cva/children';
import { MotionProps } from 'framer-motion';
import { TCommonIconProps } from '@/components/icon';

export type TCvaIcon = {
  Leading?: FC<TCommonIconProps> | null | false;
  Trailing?: FC<TCommonIconProps> | null | false;
};
type TCvaPropsWithIcon = VariantProps<
  typeof buttonsCvaConfig
> & {
  icon?: TCvaIcon;
};
export type TCvaProps<E extends MotionProps = MotionProps> =
  Omit<E, 'children'> &
    TCvaChildrenProps &
    TCvaPropsWithIcon;

export type TCvaContentProps = TCvaChildrenProps &
  Pick<ReturnType<typeof useCvaProps>, 'Icon'>;
