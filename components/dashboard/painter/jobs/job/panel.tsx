import type { FC } from 'react';
import { TDivProps } from '@/types/dom';
import { cx } from 'class-variance-authority';

type TProps = TDivProps;
export const DashboardPainterJobPanel: FC<TProps> = ({
  classValue,
  children,
  ...props
}) => {
  return (
    <div
      className={cx(
        'gap-1.5 p-4 bg-white rounded-lg border-white-4 border',
        classValue
      )}
      {...props}
    >
      {children}
    </div>
  );
};
