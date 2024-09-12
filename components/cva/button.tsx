import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ButtonsCvaContent } from '@/components/cva/content';
import { useButtonsCvaProps } from '@/components/cva/props';
import { TButtonsCvaProps } from '@/components/cva/types';
import { TButtonMotionProps } from '@/types/dom';
import { NOOP } from '@/constants/functions';

type TProps = TButtonsCvaProps<TButtonMotionProps>;
const ButtonsCvaButton = forwardRef<
  HTMLButtonElement,
  TProps
>(({ onTap, title, ...props }, ref) => {
  const isDisabled = Boolean(props.isDisabled);

  const { Icon, ...cvaProps } = useButtonsCvaProps({
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
      {...cvaProps}
    >
      <ButtonsCvaContent Icon={Icon} {...cvaProps}>
        {props.children}
      </ButtonsCvaContent>
    </motion.button>
  );
});

ButtonsCvaButton.displayName = 'ButtonsCvaButton';
export { ButtonsCvaButton };
