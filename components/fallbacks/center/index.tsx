import { TCommonIconFC } from '@/components/icon';
import { TDivProps } from '@/types/dom';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = TDivProps &
  Partial<{ IconFc: TCommonIconFC }>;
export const FallbacksCenter: FC<TProps> = ({
  children,
  classValue,
  IconFc,
  ...props
}) => {
  return (
    <div
      className={cx(
        'flex flex-row items-center justify-center text-inherit',
        classValue
      )}
      {...props}
    >
      {IconFc && <IconFc />}
    </div>
  );
};
