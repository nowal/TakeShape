import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { CvaContent } from '@/components/cva/content';
import { useCvaProps } from '@/components/cva/props';
import { TCvaProps } from '@/components/cva/types';
import { TButtonMotionProps } from '@/types/dom';
import { NOOP } from '@/constants/functions';

export type TCvaButtonProps = TCvaProps<TButtonMotionProps>;
const CvaButton = forwardRef<
  HTMLButtonElement,
  TCvaButtonProps
>(({ type, onTap, title, ...props }, ref) => {
  const isDisabled = Boolean(props.isDisabled);
  const { Icon, className, ...cvaProps } = useCvaProps({
    isDisabled,
    ...props,
  });
  if (isDisabled) {
    title = `${title} (disabled)`;
  }
  return (
    <motion.button
      ref={ref}
      disabled={isDisabled}
      title={title}
      onTap={isDisabled ? NOOP : onTap}
      type={type}
      className={className}
      {...cvaProps}
      layout={false}
    >
      <CvaContent
        Icon={Icon}
        {...cvaProps}
        layout={false}
      >
        {props.children}
      </CvaContent>
    </motion.button>
  );
});

CvaButton.displayName = 'CvaButton';
export { CvaButton };
