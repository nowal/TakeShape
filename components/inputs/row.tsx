import { TClassValueProps } from '@/types/dom';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = TClassValueProps & {
  children: string;
  input: JSX.Element;
};
export const InputsRow: FC<TProps> = ({
  children,
  input,
  classValue,
}) => {
  return (
    <div
      className={cx(
        'relative flex flex-col items-center py-2 px-4 justify-between w-full gap-2 xs:flex-row',
        classValue
      )}
    >
      <span>{children}</span>
      <div className="grow flex flex-row justify-end min-w-0">
        {input}
      </div>
    </div>
  );
};
