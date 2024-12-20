'use client';
import type { FC } from 'react';
import { ComponentsPanel } from '@/components/panel';
import { CvaButton } from '@/components/cva/button';

export const ComponentsOopsPanel: FC = () => {
  return (
    <ComponentsPanel classValue="text-center">
      <div className="flex flex-col gap-5">
        <div className="text-8xl">😭</div>
        <h2 className="text-base font-bold text-black px-2">
          Oops... Something went wrong
        </h2>
        <CvaButton
          title="Try again"
          center
        >
          <span className="text-gray-7 font-semibold">
            Try again
          </span>
        </CvaButton>
      </div>
    </ComponentsPanel>
  );
};
