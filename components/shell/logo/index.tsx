'use client';
import { IconsLogo } from '@/components/icons/logo';
import { TShellLogoProps } from '@/components/shell/logo/types';
import { cx } from 'class-variance-authority';
import { FC } from 'react';

type TProps = TShellLogoProps;
export const ShellLogo: FC<TProps> = (props) => {
  const { isFooter } = props;
  return (
    <div className="flex items-center space-x-2">
      <IconsLogo {...props} />
      <h1
        className={cx(
          isFooter
            ? 'typography-logo-title-footer--responsive'
            : 'typography-logo-title--responsive'
        )}
      >
        TakeShape
      </h1>
    </div>
  );
};
