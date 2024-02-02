import React from 'react';
import axios from "axios";

type StripePaymentProps = {
  price: number;
};

const StripePayment: React.FC<StripePaymentProps> = ({ price }) => {
  const handleClick = async () => {
    try {
      const { data: sessionUrl } = await axios.post('/api/payDeposit', {
        price,
      });

      // Redirect to the Stripe Checkout page
      window.location.href = sessionUrl;
    } catch (error) {
      console.error('Error during Stripe Checkout:', error);
    }
  };

  return (
    <button onClick={handleClick}>
      Pay with Stripe Test
    </button>
  );
};

export default StripePayment;



// components/PaymentForm.js
/*import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import axios from "axios";
import React from "react";

export default function PaymentForm() {
  console.log('What about here?');
  const stripe = useStripe();
  const elements = useElements();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cardElement = elements?.getElement(CardElement);

    try {
      if (!stripe || !cardElement) {
        throw new Error("Stripe has not initialized");
      }
      const { data } = await axios.post("/api/create-payment-intent", {
        amount: 89, // This is the correct payload structure
      });
      const clientSecret = data.clientSecret; // Make sure to access the clientSecret like this

      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (paymentResult.error) {
        console.error(paymentResult.error.message);
      } else {
        if (paymentResult.paymentIntent.status === 'succeeded') {
          console.log("Payment succeeded!");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <CardElement />
      <button type="submit">Submit</button>
    </form>
  );
}
*/