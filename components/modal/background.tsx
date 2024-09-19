import { cx } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { FC } from 'react';
import { ANIMATION_INITIAL_DURATION } from '@/components/modal/constants';
import { TDivMotionProps } from '@/types/dom';

type TProps = TDivMotionProps & {
  classBackgroundColor?: string;
};
export const ComponentsModalBackground: FC<TProps> = ({
  children,
  classValue,
  classBackgroundColor,
  ...props
}) => {
  return (
    <motion.div
      className={cx(
        'absolute inset-0 cursor-pointer',
        classBackgroundColor ?? 'bg-black bg-opacity-40',
        classValue
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: ANIMATION_INITIAL_DURATION / 4,
        ease: 'linear',
      }}
      {...props}
    />
  );
};
