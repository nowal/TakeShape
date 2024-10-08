import type { FC } from 'react';
import { motion } from 'framer-motion';
import {
  FADE_UP_PRESENCE,
  MOTION_CONFIG,
} from '@/constants/animation';
import { TDivMotionProps } from '@/types/dom';
import { cx } from 'class-variance-authority';

export type TFadeUpProps = TDivMotionProps & {
  delay?: number;
};
export const AnimationFadeUp: FC<TFadeUpProps> = ({
  delay = 0,
  children,
  classValue,
  ...props
}) => {
  return (
    <motion.div
      {...FADE_UP_PRESENCE}
      transition={{ ...MOTION_CONFIG.transition, delay }}
      className={cx(classValue)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
