import type { FC, PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { TDivMotionProps } from '@/types/dom';
import { cx } from 'class-variance-authority';

export const ButtonsCvaIcon: FC<
  PropsWithChildren<TDivMotionProps>
> = ({ children, ...props }) => {
  return (
    <motion.div
      layout
      className={cx("flex items-center justify-center pointer-events-none")}
      {...props}
    >
      {children}
    </motion.div>
  );
};
