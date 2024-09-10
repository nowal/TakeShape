import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ButtonsCvaContent } from '@/components/cva/content';
import { useButtonsCvaProps } from '@/components/cva/props';
import { TButtonsCvaProps } from '@/components/cva/types';
import { TButtonMotionProps } from '@/types/dom';
import { NOOP } from '@/constants/functions';

type TProps = TButtonsCvaProps<TButtonMotionProps>;
const Button = forwardRef<HTMLButtonElement, TProps>(
  ({ onClick, title, ...props }, ref) => {
    const isDisabled = Boolean(props.isDisabled);

    const { Icon, ...cvaProps } = useButtonsCvaProps({
      isDisabled,
      ...props,
    });
    if (isDisabled) {
      title = `(disabled) ${title}`;
    }

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        title={title}
        onClick={isDisabled ? NOOP : onClick}
        {...cvaProps}
      >
        <ButtonsCvaContent Icon={Icon}>
          {props.children}
        </ButtonsCvaContent>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
