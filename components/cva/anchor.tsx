import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ButtonsCvaContent } from '@/components/cva/content';
import { useButtonsCvaProps } from '@/components/cva/props';
import { TButtonsCvaProps } from '@/components/cva/types';
import { NOOP } from '@/constants/functions';
import { TAnchorMotionProps } from '@/types/dom';

export type TButtonsCvaAnchorProps =
  TButtonsCvaProps<TAnchorMotionProps>;
const ButtonsCvaAnchor = forwardRef<
  HTMLAnchorElement,
  TButtonsCvaAnchorProps
>(({ type, onTap, title, href, target, ...props }, ref) => {
  const isDisabled = Boolean(props.isDisabled);

  const { Icon, ...cvaProps } = useButtonsCvaProps({
    isDisabled,
    ...props,
  });
  if (isDisabled) {
    title = `${title} (disabled)`;
  }
  return (
    <motion.a
      href={href}
      ref={ref}
      title={title}
      onTap={isDisabled ? NOOP : onTap}
      type={type}
      target={target}
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
    </motion.a>
  );
});

ButtonsCvaAnchor.displayName = 'ButtonsCvaAnchor';
export { ButtonsCvaAnchor };
