import {
  AnimationFadeUp,
  TFadeUpProps,
} from '@/components/animation/fade-up';
import { InView, TInViewProps } from '@/components/in-view';
import { TChildren } from '@/types/dom';
import { cx } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { type FC } from 'react';
import * as RDD from 'react-device-detect';

type TProps = {
  fadeUpProps?: TFadeUpProps;
  children: TChildren;
} & Omit<TInViewProps, 'children'>;
export const InViewReplacersFadeUp: FC<TProps> = ({
  options,
  children,
  fadeUpProps,
  classValue,
  style,
  ...props
}) => {
  if (RDD.isMobile) {
    return <>{children}</>;
  }
  return (
    <InView
      options={{
        rootMargin: '-20px',
        triggerOnce: true,
        ...options,
      }}
      style={style}
      {...props}
    >
      {({ inView }) => {
        if (inView) {
          return (
            <AnimationFadeUp {...fadeUpProps}>
              {children}
            </AnimationFadeUp>
          );
        }
        return (
          <motion.div
            style={style}
            className={cx('opacity-0', classValue)}
            {...props}
          >
            {children}
          </motion.div>
        );
      }}
    </InView>
  );
};
