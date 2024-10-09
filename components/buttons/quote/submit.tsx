import type { FC } from 'react';
import { ButtonsCvaButton } from '@/components/cva/button';
import { TButtonsCvaProps } from '@/components/cva/types';
import { TButtonMotionProps } from '@/types/dom';

export const ButtonsQuoteSubmit: FC<
  TButtonsCvaProps<TButtonMotionProps>
> = ({ title, ...props }) => {
  return (
    <ButtonsCvaButton
      type="submit"
      title={title}
      intent="primary"
      size="sm"
      center
      classValue="font-bold"
      {...props}
    >
      {title}
    </ButtonsCvaButton>
  );
};
