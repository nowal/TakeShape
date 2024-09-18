'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export type TCheckoutButtonConfig = {
  amount: number;
  painterId: string;
  userImageId: string;
  userId: string;
};
export const useButtonsCheckout = ({
  amount,
  painterId,
  userImageId,
  userId,
}: TCheckoutButtonConfig) => {
  const [sessionId, setSessionId] = useState<string | null>(
    null
  );
  const [isRedirecting, setRedirecting] = useState(false);

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
      setSessionId(data.sessionId);
    };

    fetchSessionId();
  }, [amount, painterId, userImageId]);

  const handleClick = async () => {
    if (isRedirecting) return; // Prevent further execution if already redirecting

    const stripe = await stripePromise;

    if (stripe && sessionId) {
      setRedirecting(true); // Set the flag before redirecting

      // Store parameters in session storage before redirecting to Stripe
      sessionStorage.setItem('userImageId', userImageId);
      sessionStorage.setItem('painterId', painterId);

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (!error) {
        // ... (rest of your handleClick logic)
      } else {
        console.error(error.message);
        setRedirecting(false); // Reset the flag if there's an error
      }
    } else {
      console.error('Stripe or sessionId is null');
    }
  };

  const handleStorePainterInfo = async () => {
    try {
      // Store the accepted painter information
      const storeRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/storePainter`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            painterId,
            userImageId,
            userId,
          }),
        }
      );

      if (!storeRes.ok) {
        throw new Error(
          'Failed to store accepted painter information'
        );
      }
    } catch (error) {
      console.error(
        'Error storing painter information:',
        error
      );
    }
  };

  return {
    onHandleStorePainterInfo: handleStorePainterInfo,
    onClick: handleClick,
    dispatchSessionId: setSessionId,
  };
};
