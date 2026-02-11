'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cx } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { AnimationFadeUp } from '@/components/animation/fade-up';
import { AnimationFade } from '@/components/animation/fade';
import { CommonIcon } from '@/components/icon';
import { useViewport } from '@/context/viewport';
import imageHero from '@/public/landing/hero.png';
import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '@/context/auth/provider';
import { PRIMARY_COLOR_HEX } from '@/constants/brand-color';

const PRIMARY_COLOR = PRIMARY_COLOR_HEX;

// Shared content - edit these to change content in both sections
const HERO_CONTENT = {
  title: "See What Painting Will Cost",
  description: "Take one video of your space to see the range of what local painters are charging"
};

// Custom Logo Component for Landing Page
const LandingLogo = () => {
  return (
    <CommonIcon
      width="67"
      height="67"
      viewBox="0 0 251 251"
      classValue="size-10 sm:size-12"
      fill="none"
      classColor=""
    >
      <defs>
        <mask id="logo-mask">
          {/* White area will be visible, black area will be masked out */}
          <rect x="0" y="0" width="251" height="251" fill="white" />
          <rect
            x="8.46484"
            y="118.547"
            width="211.017"
            height="35"
            transform="rotate(-20 8.46484 118.547)"
            fill="black"
          />
        </mask>
      </defs>
      <path
        d="M149.189 211.166C167.89 206.078 184.552 194.96 196.507 179.226C197.143 178.389 197.559 177.276 197.807 176.003C199.452 167.593 192.503 159.943 183.945 160.417L170.778 161.145C160.396 161.719 151.51 153.769 150.93 143.387C150.35 133.006 160.516 125.4 170.778 120.744C197.807 108.481 206.19 87.5822 190.442 66.2595C187.843 62.7396 185.111 59.6559 182.295 57.3115C164.907 42.8346 142.927 35.5277 120.399 36.7381C71.4167 39.371 33.853 81.3071 36.6625 130.223C39.0983 172.641 71.1061 206.59 111.508 213.144"
        fill="transparent"
      />
      <path
        d="M149.189 211.166C167.89 206.078 184.552 194.96 196.507 179.226C197.143 178.389 197.559 177.276 197.807 176.003C199.452 167.593 192.503 159.943 183.945 160.417L170.778 161.145C160.396 161.719 151.51 153.769 150.93 143.387C150.35 133.006 160.516 125.4 170.778 120.744C197.807 108.481 206.19 87.5822 190.442 66.2595C187.843 62.7396 185.111 59.6559 182.295 57.3115C164.907 42.8346 142.927 35.5277 120.399 36.7381C71.4167 39.371 33.853 81.3071 36.6625 130.223C39.0983 172.641 71.1061 206.59 111.508 213.144C116.257 214.452 130.441 215.888 149.189 211.166Z"
        stroke={PRIMARY_COLOR}
        strokeWidth="27"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        mask="url(#logo-mask)"
      />
      <path
        d="M95.5 44.5H122.5V180.5H95.5V44.5Z"
        fill={PRIMARY_COLOR}
      />
    </CommonIcon>
  );
};

// Reusable Hero Content Component
const HeroContent = ({ textColor }: { textColor: string }) => {
  return (
    <div className={`relative z-10 flex flex-col items-center justify-center text-center px-10 max-w-4xl mx-auto ${textColor}`}>
      {/* Mobile gradient overlay - only for image background section */}
      {textColor.includes('white') && (
        <div
          className="flex absolute inset-0 lg:hidden -z-10"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(1, 1, 0, 0.00) 0%, rgba(1, 1, 0, 0.50) 100%)',
          }}
        />
      )}

      {/* Logo */}
      <div className="mb-8">
        <LandingLogo />
      </div>

      {/* Title */}
      <h1 className="typography-landing-hero-title--responsive mb-5">
        <AnimationFadeUp delay={0.5}>
          {HERO_CONTENT.title}
        </AnimationFadeUp>
      </h1>

      {/* Description */}
      <AnimationFadeUp delay={0.75}>
        <p className="text-xl mb-7 max-w-2xl">
          {HERO_CONTENT.description}
        </p>
      </AnimationFadeUp>

      {/* Button */}
      <AnimationFadeUp delay={1}>
        <LandingButton />
      </AnimationFadeUp>
    </div>
  );
};

// Custom Button Component for Landing Page
const LandingButton = () => {
  const auth = useAuth();
  const firebaseAuth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      (user) => {
        auth.dispatchUserSignedIn(Boolean(user));
      }
    );
    return () => unsubscribe();
  }, [firebaseAuth, auth]);

  if (auth.isUserSignedIn || auth.isAuthLoading) {
    return null;
  }

  return (
    <motion.div layout={false}>
      <Link
        href="/quote"
        className={cx(
          'inline-flex items-center justify-center',
          'px-6 py-3 text-xl font-bold',
          'text-white rounded-lg',
          'transition-all duration-200',
          'hover:shadow-lg',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'focus:ring-offset-transparent'
        )}
        style={{
          backgroundColor: PRIMARY_COLOR,
          borderColor: PRIMARY_COLOR
        }}
      >
        Color Me Curious!
      </Link>
    </motion.div>
  );
};

const LandingPage = () => {
  const viewport = useViewport();

  return (
    <div className="landing-page-wrapper">
      {/* Landing Page Specific Styles */}
      <style jsx global>{`
        /* Header overrides for landing page */
        .landing-page-wrapper header {
          --landing-primary-color: ${PRIMARY_COLOR};
        }
        
        /* Header background override */
        .landing-page-wrapper header [class*="background"] {
          background-color: ${PRIMARY_COLOR} !important;
        }
        
        /* Header logo stroke override */
        .landing-page-wrapper header svg path[stroke] {
          stroke: white !important;
        }
        
        /* Header logo fill override */
        .landing-page-wrapper header svg path[fill]:not([fill="none"]):not([fill="transparent"]) {
          fill: white !important;
        }
        
        /* Footer background override */
        .landing-page-wrapper footer .bg-white-1 {
          background-color: ${PRIMARY_COLOR} !important;
        }
        
        /* Footer logo stroke override */
        .landing-page-wrapper footer svg path[stroke] {
          stroke: white !important;
        }
        
        /* Footer logo fill override */
        .landing-page-wrapper footer svg path[fill]:not([fill="none"]):not([fill="transparent"]) {
          fill: white !important;
        }
        
        /* Footer text color override */
        .landing-page-wrapper footer {
          color: white;
        }
        
        /* Footer links color override */
        .landing-page-wrapper footer a {
          color: white !important;
        }
        
        /* Footer border color override */
        .landing-page-wrapper footer .border-gray-3 {
          border-color: rgba(255, 255, 255, 0.3) !important;
        }
      `}</style>

      {/* Hero Section with Background Image */}
      <section
        className="relative flex items-center justify-center min-h-screen"
        style={{
          height: viewport.landingHeroHeight,
        }}
      >
        <div className="h-0 lg:h-20" />
        
        {/* Background Image */}
        <AnimationFade classValue="absolute inset-0">
          <Image
            style={{
              objectPosition: 'center',
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

        {/* Centered Hero Content */}
        <HeroContent textColor="text-white" />
      </section>

      {/* Section with White Background */}
      <section className="relative flex items-center justify-center min-h-screen bg-white">
        <div className="h-0 lg:h-20" />

        {/* Centered Hero Content */}
        <HeroContent textColor="text-gray-800" />
      </section>
    </div>
  );
};

export default LandingPage;
