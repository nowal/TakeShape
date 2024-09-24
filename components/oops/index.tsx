'use client';;
import type { FC } from 'react';
import { ComponentsOopsPanel } from '@/components/oops/panel';

export const ComponentsOops: FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white">
      <ComponentsOopsPanel />
    </div>
  );
};
