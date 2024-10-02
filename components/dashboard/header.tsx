import { TDivProps } from '@/types/dom';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = TDivProps;
export const DashboardHeader: FC<TProps> = ({
  children,
  classValue,
  ...props
}) => {
  return (
    <div
      className={cx(
        'flex flex-row items-center justify-start',
        'gap-2',
        classValue
      )}
      {...props}
    >
      {children}
    </div>
  );
};
