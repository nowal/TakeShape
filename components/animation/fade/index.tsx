import type { FC } from 'react';
import { motion } from 'framer-motion';
import {
  FADE_PRESENCE,
  MOTION_CONFIG,
} from '@/constants/animation';
import { TDivMotionProps } from '@/types/dom';
import { cx } from 'class-variance-authority';

export type TFadeProps = TDivMotionProps & {
  delay?: number;
  duration?: number;
};
export const AnimationFade: FC<TFadeProps> = ({
  delay = 0,
  duration = 0.4,
  children,
  classValue,
  ...props
}) => {
  return (
    <motion.div
      {...FADE_PRESENCE}
      transition={{
        ...MOTION_CONFIG.transition,
        delay,
        duration,
      }}
      className={cx(classValue)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
