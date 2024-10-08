import {
  IntersectionOptions,
  useInView,
} from 'react-intersection-observer';
import { motion } from 'framer-motion';
import {
  TChildren,
  TDivMotionProps,
  TClassValueProps,
} from '@/types/dom';
import { cx } from 'class-variance-authority';

export type TInViewChildrenProps = Omit<
  ReturnType<typeof useInView>,
  'ref'
>;
export type TBoxChildrenProps = {
  children(props: TInViewChildrenProps): TChildren;
};
export type TInViewProps = Omit<
  TDivMotionProps,
  'children'
> &
  TClassValueProps &
  TBoxChildrenProps & {
    options?: IntersectionOptions;
  };
export const InView = ({
  classValue,
  style,
  options,
  children,
  ...props
}: TInViewProps) => {
  const { ref, ...rest } = useInView({
    threshold: 1,
    ...options,
  });

  return (
    <motion.div
      ref={ref}
      style={style}
      className={cx(classValue ?? 'relative')}
      {...props}
    >
      {children(rest)}
    </motion.div>
  );
};

export * from './replacers/custom';
