import { FC, useRef } from 'react';
import {
  motion,
  motionValue,
  MotionValue,
  useMotionValue,
} from 'framer-motion';
import { ButtonsCvaButton } from '@/components/cva/button';
import { IconsResizeHorizontal } from '@/components/icons/resize/horizontal';
import { resolveSquare } from '@/utils/measure/resolve-square';
import { cx } from 'class-variance-authority';
import {
  LANDING_HERO_HANDLE_SIZE,
  LANDING_HERO_HEIGHT,
} from '@/components/landing/hero/constants';

type TProps = { x: MotionValue };
export const LandingHeroHandle: FC<TProps> = ({ x }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <div
      ref={ref}
      className="absolute bottom-0 h-0 left-0 w-full z-0"
    >
      <motion.div
        className={cx(
          'absolute',
          'bottom-0',
          'flex items-center justify-center',
          'bg-gray-12'
        )}
        style={{
          x,
          height: LANDING_HERO_HEIGHT,
          width: '0.25rem',
          left: 0
       
        }}
      />
      <motion.div
        className="absolute flex items-center justify-center bg-white cursor-pointer"
        style={{
          borderRadius: LANDING_HERO_HANDLE_SIZE,
          ...resolveSquare(LANDING_HERO_HANDLE_SIZE),
          x,
          filter:
            'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
          bottom: LANDING_HERO_HANDLE_SIZE,
            left: `calc(${
            -LANDING_HERO_HANDLE_SIZE / 2
          }px + 0.125rem)`,
        }}
        drag="x"
        dragConstraints={ref}
      >
        <ButtonsCvaButton
          title="Resize"
          icon={{ Leading: IconsResizeHorizontal }}
          isIconOnly
          intent="icon"
        />
      </motion.div>
    </div>
  );
};
