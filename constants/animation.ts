import { Variant, Variants } from 'framer-motion';

export const resolvePresence = (
  O: Variant,
  I: Variant
): Variants => ({
  initial: O,
  animate: I,
  exit: O,
});

export const resolveFadeUp = (isI: boolean) => {
  const O = { opacity: 0, y: 10 };
  const I = { opacity: 1, y: 0 };

  return isI ? I : O;
};

export const resolveFadeUpProps = (isI: boolean) => ({
  initial: resolveFadeUp(false),
  animate: resolveFadeUp(isI),
});

export const resolveVerticalShiftPresence = (
  y: `${number}%`
) => {
  const O = { opacity: 1, y, rotateX: 45 };
  const I = { opacity: 1, y: 0, rotateX: 0 };

  return {
    ...resolvePresence(O, I),
    transition: {
      ease: 'easeInOut',
    },
  };
};

export const DURATION = 0.2;

export const TRANSITION = {
  duration: DURATION,
  ease: 'linear',
};

export const DELAY_TRANSITION = {
  ...TRANSITION,
  delay: TRANSITION.duration,
};

export const FADE_PRESENCE_WITH_DELAY = resolvePresence(
  {
    opacity: 0,
    transition: DELAY_TRANSITION,
  },
  {
    opacity: 1,
    transition: DELAY_TRANSITION,
  }
);

export const FADE_PRESENCE = resolvePresence(
  { opacity: 0 },
  { opacity: 1 }
);

export const FADE_UP_PRESENCE = resolveFadeUpProps(true);

export const MOTION_CONFIG = {
  transition: TRANSITION,
};
