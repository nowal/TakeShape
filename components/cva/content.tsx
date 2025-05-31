import type { FC } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CvaIconLeading } from '@/components/cva/icon/leading';
import { CvaIconTrailing } from '@/components/cva/icon/trailing';
import { TCvaContentProps } from '@/components/cva/types';
import { CvaChildren } from '@/components/cva/children';
import { TDivMotionProps } from '@/types/dom';

export const CvaContent: FC<
  TCvaContentProps & TDivMotionProps
> = ({ Icon, children, ...props }) => {
  return (
    <>
      <AnimatePresence mode="wait">
        {Icon.isLeading && (
          <CvaIconLeading
            key="icon-leading"
            {...props}
          >
            <Icon.Leading />
          </CvaIconLeading>
        )}
      </AnimatePresence>
      <CvaChildren {...props}>
        {children}
      </CvaChildren>
      <AnimatePresence mode="wait">
        {Icon.isTrailing && (
          <CvaIconTrailing
            key="icon-trailing"
            {...props}
          >
            <Icon.Trailing />
          </CvaIconTrailing>
        )}
      </AnimatePresence>
    </>
  );
};
