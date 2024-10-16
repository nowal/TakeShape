import { FC } from 'react';
import { TPropsWithChildren } from '@/types/dom/main';

export const InputsFilePicOutline: FC<TPropsWithChildren> = ({
  children,
}) => (
  <div className="size-[64px] overflow-hidden bg-white rounded-full shadow-09">
    {children}
  </div>
);
