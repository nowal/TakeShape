'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import imageHero from '@/public/landing/hero.png';

const LANDING_EMBED_PROVIDER_ID =
  process.env.NEXT_PUBLIC_LANDING_EMBED_PROVIDER_ID?.trim() ||
  'kBkowdrNetYiZ73P8fPI';

const Landing = () => {
  useEffect(() => {
    let isCancelled = false;
    let controller: { destroy: () => void } | null = null;

    const initializeEmbed = () => {
      const embedApi = (window as any).TakeShapeEmbed;
      if (!embedApi || typeof embedApi.init !== 'function') {
        return;
      }

      controller = embedApi.init({
        mode: 'modal',
        buttonText: 'Start Your Free Estimate',
        buttonPosition: 'bottom-right',
        providerId: LANDING_EMBED_PROVIDER_ID,
      });
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
    <main className="min-h-screen bg-white pt-6 md:pt-10">
      <section className="relative min-h-[560px] overflow-hidden">
        <Image
          src={imageHero}
          alt="Freshly painted home interior"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 mx-auto flex min-h-[560px] max-w-6xl flex-col justify-center px-6 py-20 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.2em]">
            Noah&apos;s Painting
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            Professional interior and exterior painting in your area.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-white/90 md:text-lg">
            This is a demo landing page for a painting company. Use the floating button to open the embedded estimate form.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Go to Contact Page
            </Link>
            <span className="text-sm text-white/80">
              Licensed and insured
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Interior Painting</h2>
            <p className="mt-2 text-sm text-neutral-600">Walls, ceilings, trim, and cabinet refinishing.</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Exterior Painting</h2>
            <p className="mt-2 text-sm text-neutral-600">Siding, stucco, fences, and durable weather-ready coatings.</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Fast Estimates</h2>
            <p className="mt-2 text-sm text-neutral-600">Share project details and get a quick estimate with the embedded form.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Landing;
