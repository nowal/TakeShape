import { FallbacksCenter } from '@/components/fallbacks/center';
import { IconsLogo } from '@/components/icons/logo';
import { TDivProps } from '@/types/dom';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = TDivProps;
export const FallbacksLogoFill: FC<TProps> = ({
  children,
  classValue,
  ...props
}) => {
  return (
    <FallbacksCenter
      classValue={cx('absolute inset-0', classValue)}
      style={{ minHeight: 400 }}
      IconFc={IconsLogo}
      {...props}
    />
  );
};
