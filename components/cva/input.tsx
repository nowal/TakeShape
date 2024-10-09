import { forwardRef } from 'react';
import { TButtonsCvaProps } from '@/components/cva/types';
import { motion } from 'framer-motion';
import { ButtonsCvaContent } from '@/components/cva/content';
import { useButtonsCvaProps } from '@/components/cva/props';
import { TInputMotionProps } from '@/types/dom';
import { TLabelMotionProps } from '@/types/dom/motion';
import { cx } from 'class-variance-authority';

type TElementProps = TLabelMotionProps & {
  inputProps: TInputMotionProps;
  bottom?: JSX.Element;
};
export type TButtonsCvaInputProps =
  TButtonsCvaProps<TElementProps>;
const ButtonsCvaInput = forwardRef<
  HTMLLabelElement,
  TButtonsCvaInputProps
>(({ inputProps, children, ...props }, ref) => {
  const { classValue, ...restInputProps } = inputProps;
  const { Icon, ...cvaProps } = useButtonsCvaProps(props);
  return (
    <motion.label ref={ref} {...cvaProps}>
      <motion.input
        disabled={Boolean(props.isDisabled)}
        className={cx(
          'opacity-0 absolute inset-0',
          classValue
        )}
        {...restInputProps}
        layout={false}
      />
      <ButtonsCvaContent Icon={Icon} layout={false}>
        {children}
      </ButtonsCvaContent>
    </motion.label>
  );
});

ButtonsCvaInput.displayName = 'ButtonsCvaInput';
export { ButtonsCvaInput };
