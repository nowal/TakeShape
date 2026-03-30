import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const {
      amount,
      painterId,
      userImageId,
      plan,
      userId,
      email,
      painterDocId,
    } = await request.json();
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

    if (plan) {
      const normalizedPlan = String(plan).trim().toLowerCase();
      const isPro = normalizedPlan === 'pro';

      if (!isPro) {
        throw new Error('Invalid plan selected');
      }

      const monthlyCents = 4800;
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: typeof email === 'string' ? email : undefined,
        metadata: {
          plan: normalizedPlan,
          userId: String(userId || ''),
          painterDocId: String(painterDocId || ''),
        },
        line_items: [
          {
            price_data: {
              currency: 'usd',
              recurring: { interval: 'month' },
              product_data: {
                name: 'Pro Plan',
                description:
                  'Provider subscription for TakeShape call center access.',
              },
              unit_amount: monthlyCents,
            },
            quantity: 1,
          },
        ],
        subscription_data: { trial_period_days: 30 },
        custom_text: {
          submit: {
            message:
              'You will not be charged today. Your subscription starts at $48/month after the first 30 days.',
          },
        },
        success_url: `${baseUrl}/plans/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/plans?canceled=1`,
      });

      return NextResponse.json({ sessionId: session.id });
    }

    if (!amount) {
      throw new Error('Amount is required');
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
      success_url: `${baseUrl}/congrats?userImageId=${userImageId}&painterId=${painterId}`,
      cancel_url: `${baseUrl}/dashboard`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
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
