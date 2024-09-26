import { motion, MotionValue } from 'framer-motion';
import type { FC } from 'react';
export const FILTER_GRAYSCALE_ID = 'FILTER_GRAYSCALE_ID';

type TProps = { x: MotionValue };
export const FilterGrayscale: FC<TProps> = ({ x }) => {
  return (
    <svg
      width="0"
      height="0"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id={FILTER_GRAYSCALE_ID}>
        <feColorMatrix type="saturate" values="0.05" />
        <motion.feComposite operator="in" x="0" width={x} />
        <feMerge>
          <feMergeNode in="SourceGraphic" />
          <feMergeNode />
        </feMerge>
      </filter>
    </svg>
  );
};
