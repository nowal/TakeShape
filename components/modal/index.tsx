import { motion } from 'framer-motion';
import { FC } from 'react';
import { ANIMATION_INITIAL_DURATION } from '@/components/modal/constants';
import { TDivMotionProps } from '@/types/dom';
import { ComponentsModalPosition } from '@/components/modal/position';
import { ComponentsModalBackground } from '@/components/modal/background';

type TProps = TDivMotionProps & {
  classBackgroundColor?: string;
};
export const ComponentsModal: FC<TProps> = ({
  children,
  ...props
}) => {
  return (
    <ComponentsModalPosition>
      <ComponentsModalBackground classValue="z-0" {...props} />
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: ANIMATION_INITIAL_DURATION / 4,
          ease: 'linear',
        }}
      >
        {children}
      </motion.div>
    </ComponentsModalPosition>
  );
};
