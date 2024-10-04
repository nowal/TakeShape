import type { FC } from 'react';
import { TDivProps } from '@/types/dom';

type TProps = TDivProps;
export const ComponentsDashboardShell: FC<TProps> = ({
  children,
  ...props
}) => {
  return (
    <div className="my-8" {...props}>
      {children}
    </div>
  );
};
