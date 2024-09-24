'use client';
import type { FC } from 'react';
import { ComponentsModalPanel } from '@/components/modal/panel';
import { ButtonsCvaButton } from '@/components/cva/button';

export const ComponentsOopsPanel: FC = () => {
  return (
    <ComponentsModalPanel classValue="text-center">
      <div className="flex flex-col gap-5">
        <div className="text-8xl">😭</div>
        <h2 className="text-base font-bold text-black px-2">
          Oops... Something went wrong
        </h2>
        <ButtonsCvaButton
          title="Contact Support, Call (615) 809-6429"
          center
        >
          <span className="text-gray-7 font-semibold">
            Try again
          </span>
        </ButtonsCvaButton>
      </div>
    </ComponentsModalPanel>
  );
};
