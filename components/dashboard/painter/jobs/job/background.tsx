import { TDivProps } from '@/types/dom';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = TDivProps;
export const DashboardPainterJobBackground: FC<TProps> = ({
  children,
  classValue,
  ...props
}) => {
  return (
    <div
      className={cx(
        'rounded-2xl border border-gray-7 bg-white-2',
        classValue
      )}
      {...props}
    >
      {children}
    </div>
  );
};
