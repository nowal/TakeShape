import { FC, forwardRef, ForwardRefRenderFunction } from 'react';

interface LoadingIndicatorProps {
  message?: string;
  subtitle?: string;
  isHidden?: boolean;
}

/**
 * Loading indicator component with spinner and message
 */
const LoadingIndicator: ForwardRefRenderFunction<HTMLDivElement, LoadingIndicatorProps> = (
  { 
    message = 'Processing room...', 
    subtitle = 'This may take a few minutes',
    isHidden = true
  },
  ref
) => {
  return (
    <div ref={ref} className={`loading-indicator ${isHidden ? 'hidden' : ''}`}>
      <div className="spinner"></div>
      <p>{message}</p>
      {subtitle && <p className="loading-subtitle">{subtitle}</p>}
    </div>
  );
};

export default forwardRef(LoadingIndicator);
