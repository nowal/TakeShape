'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Cormorant_Garamond } from 'next/font/google';

// Française not available on Google Fonts — Cormorant Garamond is the closest
// elegant high-contrast serif. Swap variable --font-cormorant if you license Française.
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

// ─── Images ──────────────────────────────────────────────────────────────────
// Hero background: rural lakehouse with trees (swap for your own asset)
const HERO_BG =
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=82&auto=format&fit=crop';

// Gallery room card interiors — zoomed fragments of rooms
const ROOM_1 =
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80&auto=format&fit=crop';
const ROOM_2 =
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&auto=format&fit=crop';

// ─── Drone-orbit keyframes ────────────────────────────────────────────────────
// Approximates a camera orbiting a fixed point (the house) by combining
// scale, x-pan, and y-pan. 11 s loop → active but still cinematic.
const ORBIT_ANIMATE = {
  scale: [1.18, 1.25, 1.31, 1.28, 1.22, 1.19, 1.18],
  x: ['0%', '-2.4%', '-0.8%', '2.2%', '2.8%', '0.6%', '0%'],
  y: ['0%', '1.4%', '-1.8%', '-1.4%', '1.6%', '0.9%', '0%'],
};

const ORBIT_TRANSITION = {
  duration: 11,
  ease: 'easeInOut' as const,
  repeat: Infinity,
  times: [0, 0.18, 0.36, 0.54, 0.72, 0.9, 1],
};

// Door slide-open easing
const DOOR_EASE = [0.76, 0, 0.24, 1] as [number, number, number, number];

// ─── Shared styles ────────────────────────────────────────────────────────────
const WORDMARK_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant)',
  fontWeight: 400,
  letterSpacing: '0.30em',
  textTransform: 'uppercase',
};

const FRAME_SHADOW =
  '0 4px 14px rgba(0,0,0,0.14), 0 14px 40px rgba(0,0,0,0.18), inset 0 0 0 11px #EDE7D9';

// ─────────────────────────────────────────────────────────────────────────────

export default function Landing0626Page() {
  const [isOpen, setIsOpen] = useState(false);
  const hasOpened = useRef(false);

  const open = () => {
    if (hasOpened.current) return;
    hasOpened.current = true;
    setIsOpen(true);
  };

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) open();
    };
    const onTouch = () => open();
    const onKey = () => open();

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div
      className={cormorant.variable}
      style={{ fontFamily: 'var(--font-cormorant)', position: 'fixed', inset: 0, overflow: 'hidden' }}
    >

      {/* ══════════════════════════════════════════════════════════
          LAYER 1 — GALLERY ROOM  (z-index 1, always behind doors)
      ══════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0" style={{ zIndex: 1, background: '#F5EFE4' }}>

        {/* Gallery wall */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{ bottom: '32%', background: '#EDE7D9' }}
        />

        {/* Baseboard trim */}
        <div
          className="absolute left-0 right-0"
          style={{
            bottom: '32%',
            height: 6,
            background: 'linear-gradient(to bottom, #D1C5B2, #BEB09B)',
          }}
        />

        {/* Parquet floor */}
        <div
          className="absolute bottom-0 left-0 right-0 overflow-hidden"
          style={{ top: '68%' }}
        >
          <div
            className="w-full h-full"
            style={{
              background: `
                repeating-linear-gradient(0deg,  rgba(0,0,0,0) 0px, rgba(0,0,0,0) 47px, rgba(0,0,0,0.10) 47px, rgba(0,0,0,0.10) 48px),
                repeating-linear-gradient(90deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 23px, rgba(0,0,0,0.05) 23px, rgba(0,0,0,0.05) 24px),
                repeating-linear-gradient(0deg,  rgba(255,255,255,0) 0px, rgba(255,255,255,0) 23px, rgba(255,255,255,0.035) 23px, rgba(255,255,255,0.035) 24px),
                linear-gradient(to bottom, #C49A5A, #A68040)
              `,
            }}
          />
        </div>

        {/* Gallery inner */}
        <div className="absolute inset-0 flex flex-col items-center" style={{ pointerEvents: 'none' }}>

          {/* TakeShape wordmark — appears after doors open */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.9, delay: 0.65 }}
            style={{ ...WORDMARK_STYLE, color: '#5C5648', fontSize: 11, marginTop: 32 }}
          >
            TakeShape
          </motion.div>

          {/* Two framed gallery cards */}
          <div
            className="absolute flex items-end justify-center"
            style={{
              bottom: '32%',
              left: 0,
              right: 0,
              paddingBottom: '3.5rem',
              paddingLeft: '8vw',
              paddingRight: '8vw',
              gap: '5vw',
            }}
          >
            {/* Card 1 — taller, narrower */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 22 }}
              transition={{ duration: 0.95, delay: 0.22 }}
              className="relative flex-shrink-0"
              style={{ width: 'min(23vw, 260px)', aspectRatio: '2 / 3' }}
            >
              <div
                className="absolute"
                style={{
                  inset: -18,
                  border: '1.5px solid #8A7E6E',
                  boxShadow: FRAME_SHADOW,
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ROOM_1}
                alt="Living room interior"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'saturate(0.80) brightness(1.03)',
                }}
              />
            </motion.div>

            {/* Card 2 — wider */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 22 }}
              transition={{ duration: 0.95, delay: 0.46 }}
              className="relative flex-shrink-0"
              style={{ width: 'min(26vw, 300px)', aspectRatio: '3 / 4' }}
            >
              <div
                className="absolute"
                style={{
                  inset: -18,
                  border: '1.5px solid #8A7E6E',
                  boxShadow: FRAME_SHADOW,
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ROOM_2}
                alt="Kitchen interior"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'saturate(0.80) brightness(1.03)',
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* "Come on in" CTA — bottom right, appears after doors settle */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 10 }}
          transition={{ duration: 0.75, delay: 1.35 }}
          style={{
            position: 'absolute',
            bottom: 36,
            right: 48,
            zIndex: 3,
            background: '#C20A19',
            color: '#fff',
            border: 'none',
            borderRadius: 100,
            fontFamily: 'var(--font-cormorant)',
            fontSize: 16,
            fontWeight: 400,
            letterSpacing: '0.07em',
            padding: '13px 30px',
            cursor: isOpen ? 'pointer' : 'default',
            pointerEvents: isOpen ? 'auto' : 'none',
          }}
          onClick={() => {}}
          whileHover={{ background: '#A5081A' } as Record<string, string>}
        >
          Come on in
        </motion.button>
      </div>


      {/* ══════════════════════════════════════════════════════════
          LAYER 2 — DOOR PANELS  (z-index 10, slide away on open)
      ══════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 flex"
        style={{ zIndex: 10, pointerEvents: isOpen ? 'none' : 'auto' }}
        onClick={open}
      >
        {/* Left door */}
        <motion.div
          className="relative overflow-hidden"
          style={{ flex: '0 0 50%', height: '100%' }}
          animate={{ x: isOpen ? '-100%' : '0%' }}
          transition={{ duration: 1.5, ease: DOOR_EASE }}
        >
          {/* Background — full-width so left panel shows left half seamlessly */}
          <motion.div
            className="absolute top-0 left-0"
            style={{
              width: '100vw',
              height: '100vh',
              backgroundImage: `url('${HERO_BG}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transformOrigin: '50% 60%',
            }}
            animate={ORBIT_ANIMATE}
            transition={ORBIT_TRANSITION}
          />
          {/* Cinematic overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(6,4,3,0.68) 0%, rgba(6,4,3,0.12) 48%, rgba(6,4,3,0.30) 100%)',
              zIndex: 1,
            }}
          />
        </motion.div>

        {/* Right door */}
        <motion.div
          className="relative overflow-hidden"
          style={{ flex: '0 0 50%', height: '100%' }}
          animate={{ x: isOpen ? '100%' : '0%' }}
          transition={{ duration: 1.5, ease: DOOR_EASE }}
        >
          {/* Background — offset so right panel shows right half seamlessly */}
          <motion.div
            className="absolute top-0 right-0"
            style={{
              width: '100vw',
              height: '100vh',
              backgroundImage: `url('${HERO_BG}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transformOrigin: '50% 60%',
            }}
            animate={ORBIT_ANIMATE}
            transition={ORBIT_TRANSITION}
          />
          {/* Cinematic overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(6,4,3,0.68) 0%, rgba(6,4,3,0.12) 48%, rgba(6,4,3,0.30) 100%)',
              zIndex: 1,
            }}
          />
        </motion.div>
      </div>


      {/* ══════════════════════════════════════════════════════════
          LAYER 3 — HERO CONTENT  (z-index 15, fades out on open)
      ══════════════════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0 flex flex-col justify-between"
        style={{
          zIndex: 15,
          padding: '36px 7vw 10vh',
          pointerEvents: 'none',
        }}
        animate={{ opacity: isOpen ? 0 : 1, y: isOpen ? -14 : 0 }}
        transition={{ duration: 0.75 }}
      >
        {/* TakeShape wordmark — top-center on hero */}
        <div
          style={{
            ...WORDMARK_STYLE,
            alignSelf: 'center',
            color: 'rgba(255,255,255,0.88)',
            fontSize: 12,
          }}
        >
          TakeShape
        </div>

        {/* Headline + subtitle + CTA — bottom-left */}
        <div style={{ maxWidth: 560 }}>
          <h1
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(46px, 7vw, 90px)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: '#fff',
              lineHeight: 1.06,
              letterSpacing: '-0.5px',
              marginBottom: 18,
              textShadow: '0 2px 40px rgba(0,0,0,0.28)',
            }}
          >
            Your home<br />in your hands.
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(15px, 1.7vw, 20px)',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.68)',
              letterSpacing: '0.02em',
              marginBottom: 32,
              maxWidth: 400,
              lineHeight: 1.55,
            }}
          >
            Replace in-home estimates with a live model of your home.
          </p>

          {/* Download CTA — pointer-events enabled even though parent layer is pointer-events-none */}
          <button
            style={{
              pointerEvents: 'auto',
              background: '#C20A19',
              color: '#fff',
              border: 'none',
              borderRadius: 100,
              fontFamily: 'var(--font-cormorant)',
              fontSize: 16,
              fontWeight: 400,
              letterSpacing: '0.07em',
              padding: '13px 30px',
              cursor: 'pointer',
            }}
            onClick={() => {}}
          >
            Download the app
          </button>
        </div>
      </motion.div>


      {/* ══════════════════════════════════════════════════════════
          LAYER 4 — SWIPE HINT  (z-index 20)
      ══════════════════════════════════════════════════════════ */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          pointerEvents: 'none',
          fontFamily: 'var(--font-cormorant)',
          fontSize: 11,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.38)',
        }}
        animate={
          isOpen
            ? { opacity: 0, y: -8 }
            : {
                opacity: [0.35, 0.85, 0.35],
                y: [0, 5, 0],
              }
        }
        transition={
          isOpen
            ? { duration: 0.4 }
            : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        Swipe
        <div
          style={{
            width: 1,
            height: 28,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.45), transparent)',
          }}
        />
      </motion.div>

    </div>
  );
}
