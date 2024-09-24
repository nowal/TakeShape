'use client';

import type { FC } from 'react';
import { ComponentsModal } from '@/components/modal';
import { ComponentsCongratsPanel } from '@/components/congrats/panel';

export const ComponentsCongrats: FC = () => {
  return (
    <ComponentsModal classBackgroundColor='bg-white'>
      <ComponentsCongratsPanel />
    </ComponentsModal>
  );
};
