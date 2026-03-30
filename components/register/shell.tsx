import type { FC } from 'react';
import { cx } from 'class-variance-authority';
import { TDivProps } from '@/types/dom';

type TProps = {
  title: string;
  isSurface?: boolean;
} & TDivProps;
export const ComponentsRegisterShell: FC<TProps> = ({
  title,
  isSurface = false,
  children,
  ...props
}) => {
  return (
    <div {...props}>
      <div className="relative flex flex-col gap-5 items-center">
        <h2 className="typography-page-title">{title}</h2>
        <div className="relative flex flex-col gap-5 items-center w-[320px] sm:w-[382px]">
          <div
            className={cx(
              isSurface
                ? 'fill-column-surface-sm'
                : 'fill-column-white-sm'
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
