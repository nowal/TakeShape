import {forwardRef} from 'react';
import {TButtonsCvaProps} from '@/components/buttons/types';
import {motion} from 'framer-motion';
import {ButtonsCvaContent} from '@/components/buttons/content';
import {useButtonsCvaProps} from '@/components/buttons/props';
import { TInputMotionProps } from '@/types/dom';
import { TLabelMotionProps } from '@/types/dom/motion';

type TElementProps = TLabelMotionProps & {
  inputProps: TInputMotionProps;
};
type TProps = TButtonsCvaProps<TElementProps>;
const ButtonsCvaInput = forwardRef<HTMLLabelElement, TProps>(
  ({inputProps, ...props}, ref) => {
    const {Icon, ...cvaProps} = useButtonsCvaProps(props);
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
