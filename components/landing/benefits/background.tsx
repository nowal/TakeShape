import type { FC } from 'react';
import { cx } from 'class-variance-authority';
import { TDivProps } from '@/types/dom';

type TProps = TDivProps;
export const LandingBenefitsBackground: FC<TProps> = ({
  children,
  classValue,
  ...props
}) => {
  return (
    <div
      className={cx(
        'absolute inset-0 overflow-hidden border border-white-8',
        'rounded-2xl lg:rounded-4xl',
        'pointer-events-none',
        classValue
      )}
      {...props}
    >
      {children}
    </div>
  );
};
