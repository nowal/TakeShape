import { LANDING_HERO_HANDLE_SIZE } from '@/components/landing/hero/constants';
import {
  motion,
  MotionValue,
  useTransform,
} from 'framer-motion';
import type { FC } from 'react';
export const FILTER_GRAYSCALE_ID = 'FILTER_GRAYSCALE_ID';

type TProps = { x: MotionValue };
export const FilterGrayscale: FC<TProps> = ({ x }) => {
  // const value = useTransform(x, (v) => {
  //   console.log(v);
  //   return v;
  // });
  return (
    <svg
      width="0"
      height="0"
      viewBox="0 0 1 1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.filter id={FILTER_GRAYSCALE_ID}>
        <feColorMatrix
          type="saturate"
          values="0.05"
          result="A"
        />
        <motion.feComposite
          operator="in"
          result="A"
          x="0"
          width={x}
        />
        <feComposite
          operator="over"
          in2="SourceGraphic"
          in="A"
        />
      </motion.filter>
    </svg>
  );
};
