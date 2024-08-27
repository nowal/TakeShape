import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { amount, painterId, userImageId } = await request.json(); // Get painterId and userImageId

    if (!amount) {
      throw new Error("Amount is required");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Your Product Name' },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/congrats?userImageId=${userImageId}&painterId=${painterId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
    // Check if it's a preflight request
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204, 
        headers: {
          'Access-Control-Allow-Origin': 'https://www.takeshapehome.com', 
          'Access-Control-Allow-Methods': 'POST, OPTIONS', 
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    } else {
      // Handle other methods (if any) or return an error
      return new NextResponse(null, { status: 405 }); // Method Not Allowed
    }
  }