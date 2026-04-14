'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { cx } from 'class-variance-authority';
import { LandingFaq } from '@/components/landing/faq';
import { LandingProblemAndDecision } from '@/components/landing/problem-and-decision';
import { LandingBenefits } from '@/components/landing/benefits';
import { LandingDreamRoom } from '@/components/landing/dream-room';
import { SignUpButton } from '@/components/buttons/sign-up/signUpButton';
import imageHero from '@/public/landing/hero.png';
import { LandingHeroText } from '@/components/landing/hero/text';
import { useObjectPosition } from '@/components/landing/hero/object-position';
import { useViewport } from '@/context/viewport';
import { AnimationFade } from '@/components/animation/fade';

const Landing = () => {
  const viewport = useViewport();
  const objectPosition = useObjectPosition();

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
        buttonText: 'Send Us A Video',
        buttonPosition: 'bottom-right',
        providerId: '9IsuIup4lcqZB2KHd4yh',
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
    <>
      <section
        className="relative"
        style={{
          height: viewport.landingHeroHeight,
        }}
      >
        <div className="h-0 lg:h-20" />
        <AnimationFade classValue="absolute inset-0">
          <Image
            style={{
              objectPosition,
              objectFit: 'cover',
            }}
            src={imageHero.src}
            alt="Landing Hero, Happy Pic"
            quality="100"
            fill
            priority
            loading="eager"
            sizes="(max-width: 1250px) 100vw, 1250px"
          />
        </AnimationFade>
        <LandingHeroText />
      </section>
      <section
        className={cx(
          'relative',
          'xl:h-[676px]',
          'flex flex-col items-center px-0 sm:px-20 lg:px-44 xl:px-0'
        )}
      >
        <LandingBenefits />
      </section>
      <div className="flex justify-center py-12 xl:py-0 xl:hidden">
        <SignUpButton />
      </div>
      <section className={cx('relative')}>
        <LandingProblemAndDecision />
      </section>
      <section
        className={cx('relative', 'overflow-hidden')}
      >
        <LandingFaq />
      </section>
      <section className="relative h-[748px] lg:h-[717px]">
        <LandingDreamRoom />
      </section>
    </>
  );
};

export default Landing;
