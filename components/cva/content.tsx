import type { FC } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ButtonsCvaIconLeading } from '@/components/cva/icon/leading';
import { ButtonsCvaIconTrailing } from '@/components/cva/icon/trailing';
import { TButtonsCvaContentProps } from '@/components/cva/types';
import { ButtonsCvaChildren } from '@/components/cva/children';
import { TDivMotionProps } from '@/types/dom';

export const ButtonsCvaContent: FC<
  TButtonsCvaContentProps & TDivMotionProps
> = ({ Icon, children, ...props }) => {
  return (
    <>
      <AnimatePresence>
        {Icon.isLeading && (
          <ButtonsCvaIconLeading
            key="icon-leading"
            {...props}
          >
            <Icon.Leading />
          </ButtonsCvaIconLeading>
        )}
      </AnimatePresence>
      <ButtonsCvaChildren {...props}>
        {children}
      </ButtonsCvaChildren>
      <AnimatePresence>
        {Icon.isTrailing && (
          <ButtonsCvaIconTrailing
            key="icon-trailing"
            {...props}
          >
            <Icon.Trailing />
          </ButtonsCvaIconTrailing>
        )}
      </AnimatePresence>
    </>
  );
};
