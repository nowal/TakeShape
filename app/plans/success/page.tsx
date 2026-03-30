'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PlansSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [statusMessage, setStatusMessage] = useState(
    'Confirming your subscription...'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const confirmSubscription = async () => {
      if (!sessionId) {
        setErrorMessage('Missing Stripe session ID.');
        return;
      }

      try {
        const response = await fetch('/api/stripe/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const data = await response.json();

        if (!response.ok || !data?.ok) {
          throw new Error(
            data?.error || 'Unable to confirm subscription status.'
          );
        }

        if (!isMounted) return;
        setStatusMessage('Subscription confirmed. Redirecting to call center...');
        window.setTimeout(() => {
          router.replace('/call');
        }, 900);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error instanceof Error ? error.message : 'Subscription confirmation failed.'
        );
      }
    };

    confirmSubscription();

    return () => {
      isMounted = false;
    };
  }, [router, sessionId]);

  return (
    <div className="w-full px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-xl">
        <div className="fill-column-surface-sm sm:fill-column-surface text-center">
          <h1 className="typography-page-title">Plan Setup</h1>
          <p className="mt-3 text-sm text-black-6 sm:text-base">
            {errorMessage || statusMessage}
          </p>

          {errorMessage && (
            <button
              type="button"
              onClick={() => router.push('/plans')}
              className="mt-5 rounded-lg border border-black-08 bg-[var(--app-surface-card)] px-4 py-3 text-base font-semibold text-black transition hover:border-pink hover:text-pink"
            >
              Back to Plans
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
