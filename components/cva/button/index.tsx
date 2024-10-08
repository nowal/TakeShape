import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ButtonsCvaContent } from '@/components/cva/content';
import { useButtonsCvaProps } from '@/components/cva/props';
import { TButtonsCvaProps } from '@/components/cva/types';
import { TButtonMotionProps } from '@/types/dom';
import { NOOP } from '@/constants/functions';

export type TButtonsCvaButtonProps = TButtonsCvaProps<TButtonMotionProps>;
const ButtonsCvaButton = forwardRef<
  HTMLButtonElement,
  TButtonsCvaButtonProps
>(({ type, onTap, title, ...props }, ref) => {
  const isDisabled = Boolean(props.isDisabled);

  const { Icon, className, ...cvaProps } = useButtonsCvaProps({
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
      <ButtonsCvaContent
        Icon={Icon}
        {...cvaProps}
        layout={false}
      >
        {props.children}
      </ButtonsCvaContent>
    </motion.button>
  );
});

ButtonsCvaButton.displayName = 'ButtonsCvaButton';
export { ButtonsCvaButton };
