import type { FC, ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CvaIconLeading } from '@/components/cva/icon/leading';
import { CvaIconTrailing } from '@/components/cva/icon/trailing';
import { TCvaContentProps } from '@/components/cva/types';
import { CvaChildren } from '@/components/cva/children';
import { TDivMotionProps } from '@/types/dom';

const CvaAnimatePresence = AnimatePresence as unknown as FC<{
  children?: ReactNode;
  mode?: 'sync' | 'popLayout' | 'wait';
}>;

export const CvaContent: FC<
  TCvaContentProps & TDivMotionProps
> = ({ Icon, children, ...props }) => {
  return (
    <>
      <CvaAnimatePresence mode="wait">
        {Icon.isLeading && (
          <CvaIconLeading
            key="icon-leading"
            {...props}
          >
            <Icon.Leading />
          </CvaIconLeading>
        )}
      </CvaAnimatePresence>
      <CvaChildren {...props}>
        {children}
      </CvaChildren>
      <CvaAnimatePresence mode="wait">
        {Icon.isTrailing && (
          <CvaIconTrailing
            key="icon-trailing"
            {...props}
          >
            <Icon.Trailing />
          </CvaIconTrailing>
        )}
      </CvaAnimatePresence>
    </>
  );
};
