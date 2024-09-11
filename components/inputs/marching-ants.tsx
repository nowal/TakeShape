import type { FC } from 'react';
import { cx } from 'class-variance-authority';
import { motion } from 'framer-motion';

interface TProps {
  isFocus?: boolean;
  borderRadius: string;
}
export const MarchingAnts: FC<TProps> = ({
  borderRadius,
  isFocus,
}) => (
  <motion.div
    initial={false}
    animate={{ opacity: isFocus ? 1 : 0 }}
    transition={{duration:0.4,ease:'linear'}}
    className="pointer-events-none absolute inset-0 z-10"
  >
    <svg width="100%" height="100%">
      <rect
        key={isFocus ? 'focus' : 'unfocus'}
        width="100%"
        height="100%"
        fill="none"
        stroke="green"
        style={{
          strokeWidth: '2px',
          strokeDasharray: '8px',
          shapeRendering: 'geometricPrecision',
          strokeDashoffset: '16px',
        }}
        className={cx(
          isFocus
            ? 'animate-[ant-walk_0.5s_linear_infinite] stroke-white'
            : 'hidden'
        )}
        rx={borderRadius}
      />
    </svg>
  </motion.div>
);
