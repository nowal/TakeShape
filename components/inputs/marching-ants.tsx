import type {FC} from 'react';
import {cx} from 'class-variance-authority';

interface TProps {
  isFocus?: boolean;
  borderRadius: string;
}
export const MarchingAnts: FC<TProps> = ({borderRadius, isFocus}) => (
  <div className="pointer-events-none absolute inset-0">
    <svg width="100%" height="100%">
      <rect
        key={isFocus ? 'focus' : 'unfocus'}
        width="100%"
        height="100%"
        fill="none"
        style={{
          strokeWidth: '2px',
          strokeDasharray: '8px',
          shapeRendering: 'geometricPrecision',
          strokeDashoffset: '16px',
        }}
        className={cx(
          isFocus
            ? 'animate-[ant-walk_0.5s_linear_infinite] stroke-_neutral-500'
            : 'stroke-_neutral-200'
        )}
        rx={borderRadius}
      />
    </svg>
  </div>
);
