'use client';
import type { FC } from 'react';
import { ComponentsCongratsPanel } from '@/components/congrats/panel/index';
import { TPropsWithChildren } from '@/types/dom/main';

type TProps = TPropsWithChildren;
export const ComponentsCongrats: FC<TProps> = ({
  children,
}) => {
  return (
    <div className="flex flex-col items-center py-12">
      <ComponentsCongratsPanel>
        {children}
      </ComponentsCongratsPanel>
    </div>
  );
};
