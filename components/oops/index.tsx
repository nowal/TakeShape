'use client';

import type { FC } from 'react';
import { ComponentsModal } from '@/components/modal';
import { ComponentsOopsPanel } from '@/components/congrats/panel';

export const ComponentsOops: FC = () => {
  return (
    <ComponentsModal classBackgroundColor="bg-white">
      <ComponentsOopsPanel />
    </ComponentsModal>
  );
};
