'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutButtonProps {
  amount: number;
  painterId: string;
  userImageId: string;
  userId: string;
}

export default function CheckoutButton({ amount, painterId, userImageId, userId }: CheckoutButtonProps) {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);
  
    useEffect(() => {
      const fetchSessionId = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              amount, 
              painterId, // Include painterId in the request body
              userImageId // Include userImageId in the request body
            }),
          });
      
  
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
          setIsRedirecting(true); // Set the flag before redirecting
    
          // Store parameters in session storage before redirecting to Stripe
          sessionStorage.setItem('userImageId', userImageId);
          sessionStorage.setItem('painterId', painterId);
    
          const { error } = await stripe.redirectToCheckout({ sessionId });
    
          if (!error) {
            // ... (rest of your handleClick logic)
          } else {
            console.error(error.message);
            setIsRedirecting(false); // Reset the flag if there's an error
          }
        } else {
          console.error('Stripe or sessionId is null');
        }
      };

  const storePainterInfo = async () => {
    try {
      // Store the accepted painter information
      const storeRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/storePainter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ painterId, userImageId, userId }),
      });

      if (!storeRes.ok) {
        throw new Error('Failed to store accepted painter information');
      }
    } catch (error) {
      console.error('Error storing painter information:', error);
    }
  };

  return (
    <button
      onClick={handleClick}
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
      Pay securely with <span style={{ fontFamily: 'sans-serif', fontWeight: 'bold' }}>Stripe</span>
    </button>
  );
}