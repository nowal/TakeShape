export default function PaymentForm() {
  return (
    <h1>hello world</h1>
  );
  }

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