import { forwardRef } from 'react';
import { TCvaProps } from '@/components/cva/types';
import { motion } from 'framer-motion';
import { CvaContent } from '@/components/cva/content';
import { useCvaProps } from '@/components/cva/props';
import { TInputMotionProps } from '@/types/dom';
import { TLabelMotionProps } from '@/types/dom/motion';
import { cx } from 'class-variance-authority';

type TElementProps = TLabelMotionProps & {
  inputProps: TInputMotionProps;
  bottom?: JSX.Element;
};
export type TCvaInputProps =
  TCvaProps<TElementProps>;
const CvaInput = forwardRef<
  HTMLLabelElement,
  TCvaInputProps
>(({ inputProps, children, ...props }, ref) => {
  const { classValue, ...restInputProps } = inputProps;
  const { Icon, ...cvaProps } = useCvaProps(props);
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
      <CvaContent Icon={Icon} layout={false}>
        {children}
      </CvaContent>
    </motion.label>
  );
});

CvaInput.displayName = 'CvaInput';
export { CvaInput };
