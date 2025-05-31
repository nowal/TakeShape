import {
  ComponentPropsWithoutRef,
  forwardRef,
} from 'react';
import Link from 'next/link';
import { useCvaProps } from '@/components/cva/props';
import { CvaContent } from '@/components/cva/content';
import { TCvaProps } from '@/components/cva/types';
import { motion } from 'framer-motion';
import { TCvaChildrenProps } from '@/components/cva/children';
import { TClassValueProps } from '@/types/dom';
import { cx } from 'class-variance-authority';

const LinkMotion = motion(Link);

export type TLinkMotionElement = typeof LinkMotion &
  HTMLAnchorElement;
export type TLinkMotionElementProps =
  ComponentPropsWithoutRef<TLinkMotionElement>;
export type TCvaLinkProps =
  TCvaProps<Omit<TLinkMotionElementProps, 'href'>> &
    TCvaChildrenProps &
    TClassValueProps & {
      href?: string;
    };

const CvaLink = forwardRef<
  TLinkMotionElement,
  TCvaLinkProps
>(({ href, onTap, ...props }, ref) => {
  const isDisabled = props.isDisabled ?? !Boolean(href);
  const { Icon, className, ...cvaProps } =
    useCvaProps({ isDisabled, ...props });

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
      <CvaContent Icon={Icon} layout={false}>
        {props.children ?? props.title ?? ''}
      </CvaContent>
    </LinkMotion>
  );
});

CvaLink.displayName = 'CvaLink';
export { CvaLink };
