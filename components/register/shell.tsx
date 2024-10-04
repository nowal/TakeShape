import type { FC } from 'react';
import { TDivProps } from '@/types/dom';

type TProps = { title: string } & TDivProps;
export const ComponentsRegisterShell: FC<TProps> = ({
  title,
  children,
  ...props
}) => {
  return (
    <div {...props}>
      <div className="relative flex flex-col gap-5 items-center">
        <h2 className="typography-page-title">{title}</h2>
        <div className="relative flex flex-col gap-5 items-center w-[320px] sm:w-[382px]">
          <div className="fill-column-white-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
