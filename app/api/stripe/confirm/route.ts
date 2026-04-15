import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { supabaseServer } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const isSubscriptionPaying = (status: Stripe.Subscription.Status) =>
  status === 'active' || status === 'trialing';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('sessionId is required');
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.mode !== 'subscription') {
      throw new Error('This session is not a subscription checkout');
    }

    if (!checkoutSession.subscription) {
      throw new Error('No subscription found on checkout session');
    }

    const subscriptionId =
      typeof checkoutSession.subscription === 'string'
        ? checkoutSession.subscription
        : checkoutSession.subscription.id;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const metadata = {
      ...checkoutSession.metadata,
      ...subscription.metadata,
    } as Record<string, string>;

    const userId = String(metadata.userId || '').trim();
    const plan = String(metadata.plan || '').trim() || null;
    const paying = isSubscriptionPaying(subscription.status);
    const stripeCustomerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id || null;
    const trialEndsAt = subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null;
    let painterDocId = String(metadata.painterDocId || '').trim() || null;
    let providerId =
      String(
        metadata.providerDocId ||
          metadata.providerId ||
          metadata.painterDocId ||
          ''
      ).trim() || null;
    const db = getAdminFirestore();

    if (!painterDocId && userId) {
      const painterSnapshot = await db
        .collection('painters')
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (!painterSnapshot.empty) {
        painterDocId = painterSnapshot.docs[0].id;
      }
    }

    if (!providerId && userId) {
      const { data, error } = await supabaseServer
        .from('providers')
        .select('id')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      providerId = data?.id || null;
    }

    if (!providerId && painterDocId) {
      providerId = painterDocId;
    }

    if (!painterDocId && providerId) {
      painterDocId = providerId;
    }

    if (!providerId || !painterDocId) {
      throw new Error('Could not find provider billing record');
    }

    await db
      .collection('painters')
      .doc(painterDocId)
      .set(
        {
          paid: paying,
          paying,
          billingPlan: plan,
          subscriptionStatus: subscription.status,
          stripeCustomerId,
          stripeSubscriptionId: subscription.id,
          trialEndsAt,
          billingUpdatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    const { error: upsertError } = await supabaseServer
      .from('providers')
      .upsert(
        {
          id: providerId,
          user_id: userId || null,
          paid: paying,
          paying,
          billing_plan: plan,
          subscription_status: subscription.status,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: subscription.id,
          trial_ends_at: trialEndsAt,
        },
        { onConflict: 'id' }
      );

    if (upsertError) throw upsertError;

    return NextResponse.json({
      ok: true,
      paying,
      subscriptionStatus: subscription.status,
    });
  } catch (error) {
    console.error('Error confirming Stripe subscription:', error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
