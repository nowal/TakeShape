'use client';
import type { FC } from 'react';
import { ComponentsCongratsPanel } from '@/components/congrats/panel/index';

export const ComponentsCongrats: FC = () => {
  return (
    <div className="flex flex-col items-center bg-white py-12">
      <ComponentsCongratsPanel />
    </div>
  );
};
