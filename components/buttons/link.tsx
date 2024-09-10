import {
  ComponentPropsWithoutRef,
  forwardRef,
} from 'react';
import Link from 'next/link';
import { useButtonsCvaProps } from '@/components/buttons/props';
import { ButtonsCvaContent } from '@/components/buttons/content';
import { TButtonsCvaProps } from '@/components/buttons/types';
import { motion } from 'framer-motion';
import { TButtonsCvaChildrenProps } from '@/components/buttons/children';
import { TClassValueProps } from '@/types/dom';

const LinkMotion = motion(Link);

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
>(({ href, ...props }, ref) => {
  const { Icon, ...cvaProps } = useButtonsCvaProps(props);

  return (
    <LinkMotion href={href} ref={ref} {...cvaProps}>
      <ButtonsCvaContent Icon={Icon}>
        {props.children}
      </ButtonsCvaContent>
    </LinkMotion>
  );
});

ButtonsCvaLink.displayName = 'ButtonsCvaLink';
export { ButtonsCvaLink };
