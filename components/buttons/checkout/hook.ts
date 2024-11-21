'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { TButtonsCheckoutProps } from '@/components/buttons/checkout';
import { GENERIC_ERROR_MESSAGE } from '@/constants/errors';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export type TCheckoutButtonConfig = TButtonsCheckoutProps;
export const useButtonsCheckout = ({
  selectedQuoteAmount,
  depositAmount,
  remainingAmount,
  painterId,
  userImageId,
  userId,
}: TCheckoutButtonConfig) => {
  const [sessionId, setSessionId] = useState<string | null>(
    null
  );
  const [isRedirecting, setRedirecting] = useState(false);

  useEffect(() => {
    console.log('SESSION ID HOOK');
    console.log(depositAmount);

    const fetchSessionId = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      console.log('baseUrl ', baseUrl);
      try {
        const url =
          `${baseUrl}/api/stripe/checkout` as const;
        const body = JSON.stringify({
          amount: depositAmount*100,
          painterId, // Include painterId in the request body
          userImageId, // Include userImageId in the request body
        });
        console.log(url, body);
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        });

        const data = await res.json();
        console.log('data ', url, data);
        console.log('Session ID:', data.sessionId); // Log the sessionId
        setSessionId(data.sessionId);
      } catch (error) {
        const errorMessage = GENERIC_ERROR_MESSAGE;

        console.error( errorMessage,error);
      }
    };

    fetchSessionId();
  }, [selectedQuoteAmount, painterId, userImageId]);

  const handleClick = async () => {
    console.log("Checking Deposit:");
    console.log(depositAmount);
    if (isRedirecting) return; // Prevent further execution if already redirecting

    const stripe = await stripePromise;

    if (!stripe) {
      console.error('Stripe is null');
      return;
    }

    if (!sessionId) {
      console.error('sessionId is null');
      return;
    }

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
      const errorMessage =
        'Error storing painter information';
      console.error(errorMessage, error);
    }
  };

  return {
    sessionId,
    onHandleStorePainterInfo: handleStorePainterInfo,
    onClick: handleClick,
    dispatchSessionId: setSessionId,
  };
};
