import { TDivProps } from '@/types/dom';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

export type TComponentsCongratsContentProps = {
  emoji: string;
  title: string;
  long: string;
  footer: JSX.Element;
} & TDivProps;
export const ComponentsCongratsContent: FC<
  TComponentsCongratsContentProps
> = ({
  classValue,
  emoji,
  title,
  long,
  footer,
  children,
  ...props
}) => {
  return (
    <div
      className={cx(
        'relative flex flex-col gap-5',
        classValue
      )}
      {...props}
    >
      <div className="text-8xl">{emoji}</div>
      <div className="flex flex-col gap-2">
        <h2 className="text-base font-bold text-black px-2">
          {title}
        </h2>
        {children}
        <p className="text-gray-7 text-sm">{long}</p>
      </div>
      {footer}
    </div>
  );
};
