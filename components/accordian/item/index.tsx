import { FC } from 'react';
import { TDivProps } from '@/types/dom';

export const ComponentsAccordianItem: FC<TDivProps> = ({
  children,
  ...props
}) => {
  return <div {...props}>{children}</div>;
};
