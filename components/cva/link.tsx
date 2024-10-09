import {
  ComponentPropsWithoutRef,
  forwardRef,
} from 'react';
import Link from 'next/link';
import { useButtonsCvaProps } from '@/components/cva/props';
import { ButtonsCvaContent } from '@/components/cva/content';
import { TButtonsCvaProps } from '@/components/cva/types';
import { motion } from 'framer-motion';
import { TButtonsCvaChildrenProps } from '@/components/cva/children';
import { TClassValueProps } from '@/types/dom';
import { cx } from 'class-variance-authority';

const LinkMotion = motion.create(Link);

export type TLinkMotionElement = typeof LinkMotion &
  HTMLAnchorElement;
export type TLinkMotionElementProps =
  ComponentPropsWithoutRef<TLinkMotionElement>;
export type TButtonsCvaLinkProps =
  TButtonsCvaProps<TLinkMotionElementProps> &
    TButtonsCvaChildrenProps &
    TClassValueProps;

const ButtonsCvaLink = forwardRef<
  TLinkMotionElement,
  TButtonsCvaLinkProps
>(({ href, onTap, ...props }, ref) => {
  const isDisabled = props.isDisabled ?? !Boolean(href);
  const { Icon, className, ...cvaProps } =
    useButtonsCvaProps({ isDisabled, ...props });

  return (
    <LinkMotion
      href={href ?? ''}
      className={cx(
        className,
        isDisabled && 'pointer-events-none'
      )}
      ref={ref}
      onTap={onTap}
      {...cvaProps}
      layout={false}
    >
      <ButtonsCvaContent Icon={Icon} layout={false}>
        {props.children ?? props.title ?? ''}
      </ButtonsCvaContent>
    </LinkMotion>
  );
});

ButtonsCvaLink.displayName = 'ButtonsCvaLink';
export { ButtonsCvaLink };
