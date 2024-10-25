import { cx } from 'class-variance-authority';
import { buttonsCvaConfig } from '@/components/cva/config';
import { useMemo } from 'react';
import { TCvaProps } from '@/components/cva/types';
import { iconResolve } from '@/components/cva/icon/resolve';
import { TClassValueProps } from '@/types/dom';
import { TCvaChildrenProps } from '@/components/cva/children';

export const useCvaProps = ({
  children,
  icon,
  intent,
  size,
  gap,
  center,
  rounded,
  classValue,
  isIconOnly,
  layout,
  ...rest
}: TCvaProps &
  TCvaChildrenProps &
  TClassValueProps) => {
  const isDisabled = Boolean(rest.isDisabled);

  const memo = useMemo(() => {
    const Icon = iconResolve(icon);
    return {
      Icon,
      layout,
      className: cx(
        buttonsCvaConfig({
          intent,
          size,
          gap,
          center,
          rounded,
          isDisabled,
          isIconOnly:
            isIconOnly ||
            (!children && !Icon.isLeading) ||
            (!children && !Icon.isTrailing),
        }),
        classValue
      ),
      ...(isDisabled
        ? { tabIndex: -1, 'aria-disabled': isDisabled }
        : {}),
    };
  }, [isDisabled, children, icon, isIconOnly]);

  return memo;
};
