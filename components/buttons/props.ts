import {cx} from 'class-variance-authority';
import {buttonsCvaConfig} from '@/components/buttons/config';
import {useMemo} from 'react';
import {TButtonsCvaProps} from '@/components/buttons/types';
import {iconResolve} from '@/components/buttons/icon/resolve';
import {TClassValueProps} from '@/types/dom';
import { TButtonsCvaChildrenProps } from '@/components/buttons/children';

export const useButtonsCvaProps = ({
  children,
  icon,
  hierarchy,
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
          hierarchy,
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
