import { FC } from 'react';
import { motion, MotionValue } from 'framer-motion';
import { cx } from 'class-variance-authority';
import { useViewport } from '@/context/viewport';
import { AnimationFadeUp } from '@/components/animation/fade-up';

type TProps = { x: MotionValue };
export const LandingHeroHandleLine: FC<TProps> = ({
  x,
}) => {
  const viewport = useViewport();

  return (
    <div className="absolute bottom-0 h-0 left-0 w-full z-0">
      <AnimationFadeUp delay={1}>
        <motion.div
          className={cx(
            'absolute',
            'bottom-0',
            'flex items-center justify-center',
            'bg-gray-12'
          )}
          style={{
            x,
            height: viewport.landingHeroHeight,
            width: '0.25rem',
            left: 0,
          }}
        />
      </AnimationFadeUp>
    </div>
  );
};
