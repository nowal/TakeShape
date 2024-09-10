import { FC } from 'react';
import { VariantProps } from 'class-variance-authority';
import { buttonsCvaConfig } from '@/components/buttons/config';
import { useButtonsCvaProps } from '@/components/buttons/props';
import { TButtonsCvaChildrenProps } from '@/components/buttons/children';
import { MotionProps } from 'framer-motion';
import { TCommonIconProps } from '@/components/icons';

export type TButtonsCvaIcon = {
  Leading?: FC<TCommonIconProps> | null | false;
  Trailing?: FC<TCommonIconProps> | null | false;
};
type TCvaProps = VariantProps<typeof buttonsCvaConfig> & {
  icon?: TButtonsCvaIcon;
};
export type TButtonsCvaProps<
  E extends MotionProps = MotionProps
> = Omit<E, 'children'> &
  TButtonsCvaChildrenProps &
  TCvaProps;

export type TButtonsCvaContentProps =
  TButtonsCvaChildrenProps &
    Pick<ReturnType<typeof useButtonsCvaProps>, 'Icon'>;
