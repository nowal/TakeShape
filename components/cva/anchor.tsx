import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { CvaContent } from '@/components/cva/content';
import { useCvaProps } from '@/components/cva/props';
import { TCvaProps } from '@/components/cva/types';
import { NOOP } from '@/constants/functions';
import { TAnchorMotionProps } from '@/types/dom';

export type TCvaAnchorProps =
  TCvaProps<TAnchorMotionProps>;
const CvaAnchor = forwardRef<
  HTMLAnchorElement,
  TCvaAnchorProps
>(({ type, onTap, title, href, target, rel, ...props }, ref) => {
  const isDisabled = Boolean(props.isDisabled);

  const { Icon, ...cvaProps } = useCvaProps({
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
      rel={rel}
      title={title}
      onTap={isDisabled ? NOOP : onTap}
      type={type}
      target={target}
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
    </motion.a>
  );
});

CvaAnchor.displayName = 'CvaAnchor';
export { CvaAnchor };
