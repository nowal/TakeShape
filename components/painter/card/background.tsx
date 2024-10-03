import type { FC } from 'react';
import { TPropsWithChildren } from '@/types/dom/main';

type TProps = TPropsWithChildren;
export const PainterCardBackground: FC<TProps> = ({ children }) => {
  return (
    <div className="flex flex-col items-center text-gray-7 font-semibold">
      <div className="fill-column-white-sm">{children}</div>
    </div>
  );
};
