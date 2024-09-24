'use client';

import { FC } from 'react';
import { useButtonsCheckout } from '@/components/buttons/checkout/hook';
import { ButtonsCvaButton } from '@/components/cva/button';
import { IconsStripe } from '@/components/icons/stripe';

export type TButtonsCheckoutProps = {
  selectedQuoteAmount: number;
  painterId: string;
  userImageId: string;
  userId: string;
};
export const ButtonsCheckout: FC<TButtonsCheckoutProps> = (
  props
) => {
  const buttonsCheckout = useButtonsCheckout(props);

  return (
    <ButtonsCvaButton
      title="Pay securely with Stripe"
      onTap={buttonsCheckout.onClick}
      rounded="lg"
      classValue="bg-green-2 gap-1.5 font-bold"
      size="md"
      center
      icon={{ Trailing: IconsStripe }}
    >
      Pay securely with
    </ButtonsCvaButton>
  );
};
