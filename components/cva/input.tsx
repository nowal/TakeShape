import {forwardRef} from 'react';
import {TButtonsCvaProps} from '@/components/cva/types';
import {motion} from 'framer-motion';
import {ButtonsCvaContent} from '@/components/cva/content';
import {useButtonsCvaProps} from '@/components/cva/props';
import { TInputMotionProps } from '@/types/dom';
import { TLabelMotionProps } from '@/types/dom/motion';

type TElementProps = TLabelMotionProps & {
  inputProps: TInputMotionProps;
};
export type TButtonsCvaInputProps = TButtonsCvaProps<TElementProps>;
const ButtonsCvaInput = forwardRef<HTMLLabelElement, TButtonsCvaInputProps>(
  ({inputProps, ...props}, ref) => {
    const {Icon, ...cvaProps} = useButtonsCvaProps(props);
    console.log(props.children, inputProps)
    return (
      <motion.label ref={ref} {...cvaProps}>
        <motion.input
          disabled={Boolean(props.isDisabled)}
          className="opacity-0 absolute inset-0"
          {...inputProps}
        />
        <ButtonsCvaContent Icon={Icon}>{props.children}</ButtonsCvaContent>
      </motion.label>
    );
  }
);

ButtonsCvaInput.displayName = 'ButtonsCvaInput';
export {ButtonsCvaInput};
