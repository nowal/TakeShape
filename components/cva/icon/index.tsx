import type { FC, PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { TDivMotionProps } from '@/types/dom';

export const ButtonsCvaIcon: FC<
  PropsWithChildren<TDivMotionProps>
> = ({ children, ...props }) => {
  return (
    <motion.div
      layout
      className="flex items-center justify-center size-6 pointer-events-none"
      {...props}
    >
      {children}
    </motion.div>
  );
};
