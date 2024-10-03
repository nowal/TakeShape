'use client';
import type { FC } from 'react';
import { ComponentsPanel } from '@/components/panel';
import { TPropsWithChildren } from '@/types/dom/main';
import { ComponentsCongratsContent } from '@/components/congrats/content';

type TProps = TPropsWithChildren;
export const ComponentsCongratsPanel: FC<TProps> = ({
  children,
}) => {
  return (
    <ComponentsPanel classValue="text-center">
      <ComponentsCongratsContent>
        {children}
      </ComponentsCongratsContent>
    </ComponentsPanel>
  );
};
