'use client';

import { FC } from 'react';
import { useButtonsCheckout } from '@/components/buttons/checkout/hook';
import { CvaButton } from '@/components/cva/button';
import { IconsStripe } from '@/components/icons/stripe';

export type TButtonsCheckoutProps = {
  selectedQuoteAmount: number;
  depositAmount: number;
  remainingAmount: number;
  painterId: string;
  userImageId: string;
  userId: string;
};
export const ButtonsCheckout: FC<TButtonsCheckoutProps> = (
  props
) => {
  const buttonsCheckout = useButtonsCheckout(props);

  return (
    <CvaButton
      title="Pay securely with Stripe"
      onTap={buttonsCheckout.onClick}
      rounded="lg"
      classValue="bg-green-2 gap-1.5 font-bold"
      size="md"
      center
      icon={{ Trailing: IconsStripe }}
    >
      Pay securely with
    </CvaButton>
  );
};
