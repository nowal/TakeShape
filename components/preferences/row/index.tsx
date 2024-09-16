import { TClassValueProps } from '@/types/dom';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = TClassValueProps & {
  children: string;
  input: JSX.Element;
};
export const PreferencesRow: FC<TProps> = ({
  children,
  input,
  classValue,
}) => {
  return (
    <div
      className={cx(
        'relative flex flex-row items-center py-2 px-4 justify-between w-full',
        classValue
      )}
    >
      <span>{children}</span>
      {input}
    </div>
  );
};
