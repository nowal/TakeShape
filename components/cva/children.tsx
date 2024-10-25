import type { FC } from 'react';
import { motion } from 'framer-motion';
import { TDivMotionProps } from '@/types/dom';

export type TCvaChildrenProps = TDivMotionProps;
export const CvaChildren: FC<
  TCvaChildrenProps
> = ({ children, layout = 'preserve-aspect' }) => {
  return (
    <motion.div className="truncate mt-[-1px] pointer-events-none">
      {children}
    </motion.div>
  );
};
