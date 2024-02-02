import Stripe from "stripe";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { price } = request.body;
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                      name: 'Deposit Payment',
                    },
                    unit_amount: price,
                  },
                  quantity: 1,
            }
        ],
        mode: 'payment',
        success_url: `${request.headers.origin}/success`,
        cancel_url: `${request.headers.origin}/cancel`,
    })

    return NextResponse.json(session.url)
}