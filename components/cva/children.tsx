import type { FC } from 'react';
import { motion } from 'framer-motion';
import { TDivMotionProps } from '@/types/dom';

export type TButtonsCvaChildrenProps = TDivMotionProps;
export const ButtonsCvaChildren: FC<
  TButtonsCvaChildrenProps
> = ({ children, layout = 'preserve-aspect' }) => {
  return (
    <motion.div
      className="truncate mt-[-1px] pointer-events-none"
      layout={layout}
    >
      {children}
    </motion.div>
  );
};
