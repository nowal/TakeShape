'use client';

import firebase from '@/lib/firebase';
import { isPainterPaying } from '@/utils/painter-billing';
import { loadStripe } from '@stripe/stripe-js';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type PlanKey = 'pro';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

type PlanCard = {
  title: string;
  headline: string;
  description: string;
  bullets: string[];
  cta: string;
  variant: 'light' | 'dark';
  planKey?: PlanKey;
  href?: string;
};

const PLAN_CARDS: PlanCard[] = [
  {
    title: 'Pro',
    headline: '$ 48.00 USD / month',
    description:
      'For home service businesses ready to start quoting faster and closing more jobs with video estimates.',
    bullets: [
      'Video estimate requests',
      'Live video calls',
      'Quotes dashboard',
      'Website embed',
      'We handle the setup',
    ],
    cta: 'Start Pro',
    planKey: 'pro',
    variant: 'light',
  },
  {
    title: 'Enterprise',
    headline: "Let's Talk",
    description:
      'For multi-location companies and franchises that need a custom solution built around how they operate.',
    bullets: [
      'Everything in Pro',
      'CRM integration',
      'Multi-location management',
      'Dedicated onboarding support',
      'Custom billing',
    ],
    cta: 'Call (615) 987-9575',
    href: '/call-demo',
    variant: 'dark',
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
    return (
      <div className="px-6 py-8 text-base font-semibold text-black-6">
        Loading plans...
      </div>
    );
  }

  const isCanceled = searchParams.get('canceled') === '1';

  return (
    <div className="w-full bg-[hsl(var(--app-bg-hsl))] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="typography-page-title">Choose Your Plan</h1>
          <p className="mt-2 text-base font-medium text-black-6">
            Pick the option that fits your business today.
          </p>
        </div>

        {isCanceled && (
          <div className="mx-auto mb-4 max-w-3xl rounded-xl border border-black-08 bg-white-pink-1 px-4 py-3 text-sm text-black-6">
            Stripe checkout was canceled. Pick a plan whenever you are ready.
          </div>
        )}

        {errorMessage && (
          <div className="mx-auto mb-4 max-w-3xl rounded-xl border border-red bg-red/10 px-4 py-3 text-sm text-red">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {PLAN_CARDS.map((plan) => {
            const isStripePlan = Boolean(plan.planKey);
            const isSubmitting =
              isStripePlan && submittingPlan === plan.planKey;
            const isDark = plan.variant === 'dark';
            const cardTextColor = isDark ? 'text-white' : 'text-black';
            const mutedTextColor = isDark ? 'text-white/85' : 'text-black-7';
            const lineColor = isDark ? 'border-white/35' : 'border-black/20';

            return (
              <div
                key={plan.title}
                className={[
                  'flex min-h-[680px] flex-col rounded-[2rem] border p-6 sm:min-h-[760px] sm:rounded-[2.25rem] sm:p-10',
                  isDark
                    ? 'border-transparent bg-pink shadow-pink-bottom-08'
                    : 'border-black-08 bg-white shadow-08',
                ].join(' ')}
              >
                <div className="flex items-center gap-4">
                  <Image
                    src="/logo/takeshape-logo-curved.svg"
                    alt="TakeShape Logo"
                    width={52}
                    height={52}
                    className={isDark ? 'brightness-0 invert' : ''}
                  />
                  <h2 className={`text-4xl font-bold sm:text-[2.75rem] ${cardTextColor}`}>
                    {plan.title}
                  </h2>
                </div>

                <div className="mt-10 sm:mt-12">
                  <p
                    className={`text-3xl font-bold leading-none sm:text-5xl ${cardTextColor}`}
                  >
                    {plan.headline}
                  </p>
                  <p
                    className={`mt-6 text-lg font-semibold leading-[1.35] sm:mt-8 sm:text-2xl ${mutedTextColor}`}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className={`mt-12 border-t ${lineColor}`} />

                <ul className="mt-8 space-y-4 sm:mt-10 sm:space-y-5">
                  {plan.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-4">
                      <span
                        className={[
                          'inline-flex h-9 w-9 items-center justify-center rounded-full text-xl font-bold',
                          isDark
                            ? 'bg-white text-pink'
                            : 'bg-pink text-white',
                        ].join(' ')}
                      >
                        ✓
                      </span>
                      <span
                        className={`text-xl font-semibold leading-[1.3] sm:text-2xl ${cardTextColor}`}
                      >
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-10 sm:pt-12">
                  {isStripePlan ? (
                    <button
                      type="button"
                      onClick={() => onCheckout(plan.planKey!)}
                      disabled={Boolean(submittingPlan)}
                      className={[
                        'w-full rounded-xl px-6 py-4 text-xl font-bold transition sm:px-7 sm:py-5 sm:text-2xl disabled:cursor-not-allowed disabled:opacity-70',
                        isDark
                          ? 'bg-white text-pink hover:bg-white/95'
                          : 'bg-pink text-white hover:bg-pink-1',
                      ].join(' ')}
                    >
                      {isSubmitting ? 'Redirecting...' : plan.cta}
                    </button>
                  ) : (
                    <a
                      href={plan.href || '#'}
                      className={[
                        'block w-full rounded-xl px-6 py-4 text-center text-xl font-bold transition sm:px-7 sm:py-5 sm:text-2xl',
                        isDark
                          ? 'bg-white text-pink hover:bg-white/95'
                          : 'bg-pink text-white hover:bg-pink-1',
                      ].join(' ')}
                    >
                      {plan.cta}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
