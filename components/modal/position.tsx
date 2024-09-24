import { cx } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { FC } from 'react';
import { useFreezeScrollBar } from '@/hooks/use-freeze-scroll';
import { TDivMotionProps } from '@/types/dom';

type TProps = TDivMotionProps & {
  classBackgroundColor?: string;
};
export const ComponentsModalPosition: FC<TProps> = ({
  children,
  classValue,
  ...props
}) => {
  useFreezeScrollBar();

  return (
    <motion.div
      layout="size"
      className={cx(
        'flex items-center justify-center fixed inset-0 z-10',
        classValue
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
