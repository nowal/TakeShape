'use client';

import firebase from '@/lib/firebase';
import { isPainterPaying } from '@/utils/painter-billing';
import { loadStripe } from '@stripe/stripe-js';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type PlanKey = 'pro';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

type PlanCard = {
  title: string;
  price: string;
  bullets: string[];
  cta: string;
  planKey?: PlanKey;
};

const PLAN_CARDS: PlanCard[] = [
  {
    title: 'Pro Plan',
    price: 'First month free, then $48/month',
    bullets: [
      'Card required at signup',
      'No charge for first 30 days',
      'Automatic monthly billing',
      'Cancel anytime',
    ],
    cta: 'Register',
    planKey: 'pro',
  },
  {
    title: 'Enterprise Plan',
    price: 'Custom pricing',
    bullets: [
      'Multi-location support',
      'White-glove onboarding',
      'Custom terms and integrations',
    ],
    cta: 'Call 615-987-9575',
  },
];

export default function PlansPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useMemo(() => getAuth(firebase), []);
  const firestore = useMemo(() => getFirestore(firebase), []);

  const [user, setUser] = useState<User | null>(null);
  const [painterDocId, setPainterDocId] = useState<string | null>(null);
  const [isChecking, setChecking] = useState(true);
  const [submittingPlan, setSubmittingPlan] = useState<PlanKey | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      try {
        if (!nextUser) {
          router.push('/login');
          return;
        }

        setUser(nextUser);
        const paintersQuery = query(
          collection(firestore, 'painters'),
          where('userId', '==', nextUser.uid)
        );
        const snapshot = await getDocs(paintersQuery);

        if (snapshot.empty) {
          router.push('/providerRegister');
          return;
        }

        const painterDoc = snapshot.docs[0];
        setPainterDocId(painterDoc.id);

        const painterData = painterDoc.data() as Record<string, unknown>;
        if (isPainterPaying(painterData)) {
          router.push('/call');
          return;
        }
      } catch (error) {
        console.error('Failed to load plans page auth state:', error);
        setErrorMessage('Unable to load billing status. Please refresh and try again.');
      } finally {
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, [auth, firestore, router]);

  const onCheckout = async (plan: PlanKey) => {
    if (!painterDocId || !user) return;

    try {
      setSubmittingPlan(plan);
      setErrorMessage(null);

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          userId: user.uid,
          email: user.email || undefined,
          painterDocId,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.sessionId) {
        throw new Error(data?.error || 'Unable to start checkout session');
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize.');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Checkout failed. Please try again.'
      );
    } finally {
      setSubmittingPlan(null);
    }
  };

  if (isChecking) {
    return <div style={{ padding: 24 }}>Loading plans...</div>;
  }

  const isCanceled = searchParams.get('canceled') === '1';

  return (
    <div className="w-full px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="px-1 py-1 sm:px-0 sm:py-0">
          <div className="mb-6 text-center">
            <h1 className="typography-page-title">Choose Your Plan</h1>
            <p className="mt-2 text-sm text-black-6 sm:text-base">
              Select a provider plan to continue to your call center.
            </p>
          </div>

          {isCanceled && (
            <div className="mb-4 rounded-lg border border-black-08 bg-white-pink-1 px-4 py-3 text-sm text-black-6">
              Stripe checkout was canceled. Pick a plan whenever you are ready.
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red bg-red/10 px-4 py-3 text-sm text-red">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {PLAN_CARDS.map((plan) => {
              const isStripePlan = Boolean(plan.planKey);
              const isSubmitting =
                isStripePlan && submittingPlan === plan.planKey;

              return (
                <div
                  key={plan.title}
                  className="w-full rounded-xl border border-black-08 bg-[var(--app-surface)] p-4"
                >
                  <h2 className="text-lg font-semibold text-black min-h-[56px]">
                    {plan.title}
                  </h2>

                  <p className="mt-2 text-sm font-semibold text-pink">
                    {plan.price}
                  </p>

                  <div className="mt-4 rounded-lg border border-dashed border-gray-4 bg-white-pink-1 p-3">
                    <ul className="list-disc space-y-2 pl-5 text-sm font-open-sans text-black-6">
                      {plan.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>

                  {isStripePlan ? (
                    <button
                      type="button"
                      onClick={() => onCheckout(plan.planKey!)}
                      disabled={Boolean(submittingPlan)}
                      className="mt-4 w-full rounded-lg border border-black-08 bg-[var(--app-surface)] px-4 py-3 text-center text-base font-semibold text-black transition hover:border-pink hover:text-pink disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting ? 'Redirecting...' : plan.cta}
                    </button>
                  ) : (
                    <div className="mt-4 w-full rounded-lg border border-black-08 bg-[var(--app-surface)] px-4 py-3 text-center text-base font-semibold text-black">
                      {plan.cta}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
