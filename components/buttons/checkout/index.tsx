'use client';

import { FC, useEffect } from 'react';
import { useButtonsCheckout } from '@/components/buttons/checkout/hook';

export type TButtonsCheckoutProps = {
  amount: number;
  painterId: string;
  userImageId: string;
  userId: string;
};

export const ButtonsCheckout: FC<TButtonsCheckoutProps> = (
  props
) => {
  const buttonsCheckout = useButtonsCheckout(props);
  const {
    amount,
    painterId,
    userImageId,
    // userId
  } = props;
  const { onClick, dispatchSessionId } = buttonsCheckout;

  useEffect(() => {
    const fetchSessionId = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/checkout`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            painterId, // Include painterId in the request body
            userImageId, // Include userImageId in the request body
          }),
        }
      );

      const data = await res.json();
      console.log('Session ID:', data.sessionId); // Log the sessionId
      dispatchSessionId(data.sessionId);
    };

    fetchSessionId();
  }, [amount, painterId, userImageId]);

  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: '#6772E5', // Stripe's brand color
        color: '#FFF',
        padding: '12px 24px',
        borderRadius: '4px',
        fontSize: '16px',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      Pay securely with{' '}
      <span
        style={{
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
        }}
      >
        Stripe
      </span>
    </button>
  );
};
