import {cx} from 'class-variance-authority';
import {buttonsCvaConfig} from '@/components/cva/config';
import {useMemo} from 'react';
import {TButtonsCvaProps} from '@/components/cva/types';
import {iconResolve} from '@/components/cva/icon/resolve';
import {TClassValueProps} from '@/types/dom';
import { TButtonsCvaChildrenProps } from '@/components/cva/children';

export const useButtonsCvaProps = ({
  children,
  icon,
  intent,
  size,
  rounded,
  isDisabled,
  classValue,
  isIconOnly,
}: TButtonsCvaProps & TButtonsCvaChildrenProps & TClassValueProps) => {
  const memo = useMemo(() => {
    const Icon = iconResolve(icon);
    return {
      Icon,
      layout: true,
      className: cx(
        buttonsCvaConfig({
          intent,
          size,
          rounded,
          isDisabled,
          isIconOnly:
            isIconOnly ||
            (!children && !Icon.isLeading) ||
            (!children && !Icon.isTrailing),
        }),
        classValue
      ),
      'aria-disabled': Boolean(isDisabled),
    };
  }, [isDisabled, children, icon, isIconOnly]);

  return memo;
};
