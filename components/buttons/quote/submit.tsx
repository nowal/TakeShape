import type { FC } from 'react';
import { CvaButton } from '@/components/cva/button';
import { TCvaProps } from '@/components/cva/types';
import { TButtonMotionProps } from '@/types/dom';

export const ButtonsQuoteSubmit: FC<
  TCvaProps<TButtonMotionProps>
> = ({ title, ...props }) => {
  return (
    <CvaButton
      type="submit"
      title={title}
      intent="primary"
      size="sm"
      center
      classValue="font-bold"
      gap="xl"
      {...props}
    >
      {title}
    </CvaButton>
  );
};
