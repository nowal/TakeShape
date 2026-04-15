'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const CONTACT_EMBED_PROVIDER_ID =
  process.env.NEXT_PUBLIC_LANDING_EMBED_PROVIDER_ID?.trim() ||
  'kBkowdrNetYiZ73P8fPI';

const ContactPage = () => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    let controller: { destroy: () => void } | null = null;

    const initializeEmbed = () => {
      const embedApi = (window as any).TakeShapeEmbed;
      if (!embedApi || typeof embedApi.init !== 'function') {
        return;
      }

      controller = embedApi.init({
        mode: 'inline',
        container: 'takeshape-embed-container',
        providerId: CONTACT_EMBED_PROVIDER_ID,
        height: '860px',
      });

      setHasError(!controller);
    };

    const existingScript = document.querySelector(
      'script[src="/embed.js"]'
    ) as HTMLScriptElement | null;

    if ((window as any).TakeShapeEmbed) {
      initializeEmbed();
    } else if (existingScript) {
      existingScript.addEventListener('load', initializeEmbed);
    } else {
      const script = document.createElement('script');
      script.src = '/embed.js';
      script.async = true;
      script.onload = () => {
        if (!isCancelled) {
          initializeEmbed();
        }
      };
      script.onerror = () => {
        if (!isCancelled) {
          setHasError(true);
        }
      };
      document.body.appendChild(script);
    }

    return () => {
      isCancelled = true;

      if (existingScript) {
        existingScript.removeEventListener('load', initializeEmbed);
      }

      controller?.destroy?.();
    };
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-14">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Noah&apos;s Painting
          </p>
          <h1 className="mt-3 text-3xl font-bold text-neutral-900 md:text-5xl">
            Contact us for a free estimate
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-600">
            This demo contact page shows the embedded form directly on the page.
          </p>
          <Link
            href="/landing"
            className="mt-4 inline-block text-sm font-semibold text-neutral-700 underline"
          >
            Back to landing page
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:p-6">
          <div className="overflow-x-auto">
            <div
              id="takeshape-embed-container"
              className="min-w-[980px]"
            />
          </div>
          {hasError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              The contact form could not be loaded. Please refresh and try again.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
