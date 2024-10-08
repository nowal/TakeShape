import type { FC } from 'react';
import { FADE_UP_PRESENCE } from '@/constants/animation';
import { TDivMotionProps } from '@/types/dom';
import { AnimationFade } from '@/components/animation/fade';

export type TFadeUpProps = TDivMotionProps & {
  delay?: number;
};
export const AnimationFadeUp: FC<TFadeUpProps> = ({
  children,
  ...props
}) => {
  return (
    <AnimationFade {...FADE_UP_PRESENCE} {...props}>
      {children}
    </AnimationFade>
  );
};
