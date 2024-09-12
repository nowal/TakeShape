import clsx from 'clsx';
import { motion } from 'framer-motion';
import { FC } from 'react';
import { ANIMATION_INITIAL_DURATION } from '@/components/modal/constants';
import { useFreezeScrollBar } from '@/hooks/use-freeze-scroll';
import { TDivMotionProps } from '@/types/dom';
import { cx } from 'class-variance-authority';

type TProps = TDivMotionProps;
export const Modal: FC<TProps> = ({
  children,
  ...props
}) => {
  useFreezeScrollBar();

  return (
    <motion.div
      className={cx(
        'flex items-center justify-center fixed inset-0 z-20'
      )}
      {...props}

    >
      <motion.div
        className="absolute inset-0 bg-black bg-opacity-40 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: ANIMATION_INITIAL_DURATION / 4,
          ease: 'linear',
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          delay: ANIMATION_INITIAL_DURATION / 4,
          duration: ANIMATION_INITIAL_DURATION / 4,
          ease: 'linear',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
