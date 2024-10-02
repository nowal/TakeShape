import { cx } from 'class-variance-authority';
import type { FC } from 'react';
import { TPropsWithChildren } from '@/types/dom/main';

type TProps = TPropsWithChildren;
export const DashboardCard: FC<TProps> = ({ children }) => {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch p-5 bg-white rounded-2xl',
        'gap-5'
      )}
      style={{
        boxShadow: '0px 4px 90.8px 0px rgba(0, 0, 0, 0.08)',
      }}
    >
      {children}
    </div>
  );
};
