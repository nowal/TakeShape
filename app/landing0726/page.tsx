'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import heroManor from '@/prototypes/takeshape-visuals/src/assets/hero-manor.jpg';
import roomDrawing from '@/prototypes/takeshape-visuals/src/assets/room-drawing.jpg';
import roomLibrary from '@/prototypes/takeshape-visuals/src/assets/room-library.jpg';
import roomStair from '@/prototypes/takeshape-visuals/src/assets/room-stair.jpg';
import discoverCourtyard from '@/prototypes/takeshape-visuals/src/assets/discover-courtyard.jpg';
import discoverPavilion from '@/prototypes/takeshape-visuals/src/assets/discover-pavilion.jpg';
import downloadDetail from '@/prototypes/takeshape-visuals/src/assets/download-detail.jpg';
import heroVideo from '@/prototypes/takeshape-visuals/src/assets/hero.mp4.asset.json';
import galleryVideo from '@/prototypes/takeshape-visuals/src/assets/gallery.mp4.asset.json';
import houseVideo from '@/prototypes/takeshape-visuals/src/assets/house.mp4.asset.json';

type MarkProps = React.SVGProps<SVGSVGElement> & {
  shineAngle?: number;
};

type ChatLine = { role: 'user' | 'ai'; text: string };

const CHAT_SCRIPT: ChatLine[] = [
  { role: 'user', text: 'What should I do to make my living room feel more cozy?' },
  {
    role: 'ai',
    text:
      'Great question! Here are some color palettes to choose from that can bring a cozy atmosphere: sage green, oak brown, canvas cream.',
  },
  { role: 'user', text: 'I like sage green for the walls.' },
  {
    role: 'ai',
    text:
      "Sounds good, let's take a scan of the room, and I'll give some suggestions on where to start!",
  },
];

const RED_BAR =
  'linear-gradient(135deg, hsl(355 90% 50%) 0%, hsl(355 90% 40%) 20%, hsl(355 90% 28%) 100%)';
const RED_TEXT_SHADOW =
  '0 1px 0 hsl(355 90% 22%), 0 -1px 0 hsl(355 90% 62%), 0 2px 3px rgba(20, 6, 6, 0.45)';

export default function Landing0726Page() {
  const heroRef = useRef<HTMLElement | null>(null);
  const lastCardRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [exploreOffset, setExploreOffset] = useState(0);

  useEffect(() => {
    let frame = 0;
    let releaseY: number | null = null;
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const update = () => {
      frame = 0;
      const hero = heroRef.current;
      if (!hero) return;

      const raw = Math.min(1, Math.max(0, window.scrollY / hero.offsetHeight));
      setProgress(easeInOutCubic(raw));

      const last = lastCardRef.current;
      if (last) {
        const isDesktop = window.matchMedia('(min-width: 768px)').matches;
        const stuckTop = isDesktop ? 216 : 184;
        const rect = last.getBoundingClientRect();
        const stacked = rect.top <= stuckTop + 0.5;
        if (stacked) {
          if (releaseY === null) releaseY = window.scrollY;
          setExploreOffset(window.scrollY - releaseY);
        } else {
          releaseY = null;
          setExploreOffset(0);
        }
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const cssAngle = 135 + progress * 180;

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />

      <section
        ref={heroRef}
        className="relative h-[calc(100svh-72px)] w-full overflow-hidden bg-cream md:h-[calc(100svh-88px)]"
      >
        <img
          src={heroManor.src}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <video
          src={heroVideo.url}
          autoPlay
          loop
          muted
          playsInline
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-black/10 to-black/70" />
        <div className="absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-[1500px] flex-col items-center px-6 pb-[9svh] text-center md:px-12 md:pb-[10svh]">
          <h1 className="animate-[tsFadeUp_1.1s_cubic-bezier(0.2,0.7,0.2,1)_both] w-screen max-w-none font-serif text-[clamp(3.9rem,11.5vw,11rem)] font-bold leading-[0.86] text-cream">
            <span className="block whitespace-nowrap">Your Home</span>
            <span className="block whitespace-nowrap">in Your Hands</span>
          </h1>
          <Link
            href="/download"
            className="mt-7 inline-flex min-h-[56px] min-w-[210px] items-center justify-center rounded-full bg-[hsl(355_90%_40%)] px-8 font-serif text-lg font-bold text-cream shadow-[0_12px_32px_rgba(20,6,6,0.35)] transition-[filter,transform] duration-200 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/80 active:translate-y-[1px] md:min-h-[60px] md:min-w-[240px] md:text-xl"
            style={{ textShadow: RED_TEXT_SHADOW }}
          >
            Download TakeShape
          </Link>
        </div>
      </section>

      <button
        type="button"
        aria-label="Download the TakeShape App"
        className="sticky top-0 z-30 block h-[72px] w-full cursor-pointer border-0 p-0 text-left transition-[filter] duration-300 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 md:h-[88px]"
        style={{
          background: `linear-gradient(${cssAngle}deg, hsl(355 90% 50%) 0%, hsl(355 90% 40%) 20%, hsl(355 90% 28%) 100%)`,
          boxShadow: '0 10px 24px -14px rgba(20, 12, 6, 0.45)',
        }}
      >
        <div className="mx-auto flex h-full max-w-[1500px] items-center justify-center px-6 md:px-12">
          <span
            className="mr-3 flex h-10 w-10 items-center justify-center text-cream md:mr-4 md:h-12 md:w-12"
            aria-hidden
          >
            <TakeShapeMark
              className="h-10 w-10 md:h-12 md:w-12"
              style={{
                filter:
                  'drop-shadow(0 1px 0 hsl(355 90% 22%)) drop-shadow(0 -1px 0 hsl(355 90% 62%)) drop-shadow(0 2px 3px rgba(20, 6, 6, 0.45))',
              }}
            />
          </span>
          <span
            className="font-serif text-2xl font-bold tracking-tight text-cream md:text-[28px]"
            style={{ textShadow: RED_TEXT_SHADOW }}
          >
            TakeShape
          </span>
        </div>
      </button>

      <HorizontalStatement />

      <section className="relative mx-auto max-w-[1500px] px-0 md:px-12">
        <div
          className="sticky top-[72px] z-10 h-[72px] w-full border-b border-taupe/60 bg-cream will-change-transform md:top-[88px] md:h-[88px]"
          style={{ transform: `translateY(${-exploreOffset}px)` }}
        >
          <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-6 md:px-0">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-ink md:text-[28px]">
              Explore More
            </h2>
            <Link
              href="/rooms"
              className="hidden text-[11px] uppercase tracking-[0.22em] text-rust hover:underline md:inline"
            >
              View all &rarr;
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6 px-6 pb-0 [--stack-top:156px] md:mt-10 md:grid md:grid-cols-3 md:gap-8 md:px-0 md:pb-0 md:[--stack-top:188px]">
          {[
            { src: roomDrawing.src, label: 'The Drawing Room', place: 'Wiltshire' },
            { src: roomStair.src, label: 'The Spiral', place: 'Lisbon' },
            { src: roomLibrary.src, label: 'The Long Library', place: 'Vermont' },
          ].map((room, index) => (
            <figure
              key={room.label}
              ref={index === 2 ? lastCardRef : undefined}
              className="group sticky md:static"
              style={{ top: `calc(var(--stack-top) + ${index * 14}px)` }}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream shadow-[0_-12px_30px_-20px_rgba(20,12,6,0.45)] md:shadow-none">
                <img
                  src={room.src}
                  alt={room.label}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.03]"
                />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-baseline justify-between bg-gradient-to-t from-ink/70 via-ink/30 to-transparent px-5 pb-5 pt-12 md:hidden">
                  <span className="font-serif text-lg text-cream">{room.label}</span>
                  <span className="text-[11px] uppercase tracking-[0.22em] text-cream/80">
                    {room.place}
                  </span>
                </figcaption>
              </div>
              <figcaption className="mt-4 hidden items-baseline justify-between md:flex">
                <span className="font-serif text-lg text-ink">{room.label}</span>
                <span className="text-[11px] uppercase tracking-[0.22em] text-ink/55">
                  {room.place}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-4 px-6 md:hidden">
          <Link href="/rooms" className="text-[11px] uppercase tracking-[0.22em] text-rust">
            View More &rarr;
          </Link>
        </div>
      </section>

      <section className="mt-4 md:mt-16">
        <Link href="/discover" className="group block">
          <div className="relative h-[70svh] min-h-[460px] w-full overflow-hidden shadow-[0_-20px_34px_-28px_rgba(20,12,6,0.72),0_20px_34px_-28px_rgba(20,12,6,0.72)]">
            <img
              src={discoverPavilion.src}
              alt="Stone pavilion at the edge of a misted meadow"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-ink/20 to-ink/45" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <p className="eyebrow text-cream/90">III &mdash; Discover</p>
              <p className="mt-4 font-serif text-4xl italic text-cream md:text-6xl">
                Field notes &amp; quiet places.
              </p>
            </div>
          </div>
        </Link>
      </section>

      <SiteFooter />

      <style jsx global>{`
        @keyframes tsFadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes tsChatFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .eyebrow {
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-size: 0.6875rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
      `}</style>
    </main>
  );
}

function HorizontalStatement() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = wrapRef.current;
      const inner = stickyRef.current;
      if (!el || !inner) return;
      const rect = el.getBoundingClientRect();
      const buffer = inner.offsetHeight * 0.35;
      const total = Math.max(1, el.offsetHeight - inner.offsetHeight - buffer);
      const scrolled = Math.min(total, Math.max(0, -rect.top));
      setProgress(scrolled / total);
      setPinned(rect.top <= 88 && rect.bottom > inner.offsetHeight);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const p = Math.min(1, Math.max(0, progress));
  const panel1Out = Math.min(1, p / 0.5);
  const panel2Out = Math.min(1, Math.max(0, (p - 0.5) / 0.5));

  return (
    <section
      ref={wrapRef}
      aria-label="A note on home"
      className="relative w-full"
      style={{ height: 'calc((100svh - 72px) * 3.35)' }}
    >
      <div
        ref={stickyRef}
        className="sticky top-[72px] h-[calc(100svh-72px)] overflow-hidden bg-cream md:top-[88px] md:h-[calc(100svh-88px)]"
      >
        <div className="absolute inset-0 z-0 overflow-hidden bg-ink">
          <img
            src={downloadDetail.src}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/45 to-ink/75" />
          <div className="relative z-10 flex h-full flex-col items-center justify-end px-6 pb-[24svh] text-center md:px-12 md:pb-[22svh]">
            <p className="eyebrow text-cream/80">TakeShape App</p>
            <h2 className="mt-4 w-screen max-w-none font-serif text-[clamp(4.25rem,17.8vw,10.5rem)] font-bold leading-[0.84] text-cream">
              <span className="block whitespace-nowrap">Power to</span>
              <span className="block whitespace-nowrap">Pursue Beauty</span>
            </h2>
            <p className="mt-5 max-w-[34rem] text-balance text-sm leading-6 text-cream/85 md:text-base">
              See what beauty could become before you begin.
            </p>
            <Link
              href="/download"
              className="absolute bottom-6 left-1/2 inline-flex min-h-[60px] min-w-[260px] -translate-x-1/2 items-center justify-center whitespace-nowrap rounded-full bg-[hsl(355_90%_40%)] px-9 font-serif text-xl font-bold text-cream shadow-[0_12px_32px_rgba(20,6,6,0.35)] transition-[filter,transform] duration-200 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/80 active:translate-y-[1px] md:bottom-10 md:min-h-[64px] md:min-w-[280px] md:text-2xl"
              style={{ textShadow: RED_TEXT_SHADOW }}
            >
              Download TakeShape
            </Link>
          </div>
        </div>

        <div
          className="absolute inset-0 z-10 overflow-hidden bg-cream will-change-transform"
          style={{
            transform: `translate3d(${-100 * panel2Out}%, 0, 0)`,
            boxShadow:
              panel2Out > 0 && panel2Out < 1 ? '8px 0 24px rgba(0,0,0,0.25)' : undefined,
          }}
        >
          <img
            src={roomDrawing.src}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <video
            src={houseVideo.url}
            autoPlay
            loop
            muted
            playsInline
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.55) 100%)',
            }}
          />
          <ChatDemo active={panel1Out > 0.5} />
        </div>

        <div
          className="absolute inset-0 z-20 overflow-hidden bg-cream will-change-transform"
          style={{
            transform: `translate3d(${-100 * panel1Out}%, 0, 0)`,
            boxShadow:
              panel1Out > 0 && panel1Out < 1 ? '8px 0 24px rgba(0,0,0,0.25)' : undefined,
          }}
        >
          <img
            src={discoverCourtyard.src}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <video
            src={galleryVideo.url}
            autoPlay
            loop
            muted
            playsInline
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.55) 100%)',
            }}
          />
          <ChatDemo active={pinned} userColor="text-white" aiColor="text-white/95" />
        </div>
      </div>
    </section>
  );
}

function ChatDemo({
  active,
  userColor = 'text-cream',
  aiColor = 'text-cream/95',
}: {
  active: boolean;
  userColor?: string;
  aiColor?: string;
}) {
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [composer, setComposer] = useState('');
  const [composerTyping, setComposerTyping] = useState(false);
  const [sendFlash, setSendFlash] = useState(false);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (!active || hasPlayedRef.current) return;
    hasPlayedRef.current = true;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };

    let cursor = 300;
    const gap = 500;
    const charMs = 20;
    const sendPause = 350;

    CHAT_SCRIPT.forEach((line) => {
      const startAt = cursor;
      if (line.role === 'user') {
        schedule(() => setComposerTyping(true), startAt);
        for (let i = 1; i <= line.text.length; i++) {
          schedule(() => setComposer(line.text.slice(0, i)), startAt + i * charMs);
        }
        const typedDone = startAt + line.text.length * charMs;
        schedule(() => setSendFlash(true), typedDone + sendPause);
        schedule(() => setSendFlash(false), typedDone + sendPause + 180);
        schedule(() => {
          setComposer('');
          setComposerTyping(false);
          setLines((prev) => [...prev, { role: 'user', text: line.text }]);
        }, typedDone + sendPause + 200);
        cursor = typedDone + sendPause + 200 + gap;
      } else {
        schedule(() => {
          setLines((prev) => [...prev, { role: 'ai', text: '' }]);
        }, startAt);
        for (let i = 1; i <= line.text.length; i++) {
          schedule(() => {
            setLines((prev) => {
              const next = prev.slice();
              const lastIdx = next.length - 1;
              if (lastIdx >= 0 && next[lastIdx].role === 'ai') {
                next[lastIdx] = { role: 'ai', text: line.text.slice(0, i) };
              }
              return next;
            });
          }, startAt + i * charMs);
        }
        cursor = startAt + line.text.length * charMs + gap;
      }
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [active]);

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-end px-6 pb-6 md:px-16 md:pb-10">
      <div className="mx-auto mb-6 flex w-full max-w-[820px] flex-col gap-4">
        {lines.map((line, i) => (
          <div
            key={`${line.role}-${i}`}
            className={`flex ${line.role === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{ animation: 'tsChatFadeIn 260ms ease-out both' }}
          >
            <p
              className={`max-w-[85%] font-serif text-[clamp(1.25rem,2.6vw,2rem)] leading-snug ${
                line.role === 'user' ? `text-right ${userColor}` : `text-left ${aiColor}`
              }`}
              style={{
                textShadow:
                  '0 1px 2px rgba(0,0,0,0.6), 0 2px 20px rgba(0,0,0,0.55), 0 0 40px rgba(0,0,0,0.35)',
              }}
            >
              {line.text}
            </p>
          </div>
        ))}
      </div>

      <div className="mx-auto flex w-full max-w-[640px] items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        <div
          className="min-h-[20px] flex-1 text-[13px] text-white/95 md:text-sm"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
        >
          {composerTyping || composer ? (
            <>
              {composer}
              <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse align-middle bg-current" />
            </>
          ) : (
            <span className="text-white/60">Ask about your home...</span>
          )}
        </div>

        <button
          type="button"
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm text-cream transition-transform duration-150 ${
            sendFlash ? 'scale-90 bg-[hsl(355_90%_30%)]' : 'bg-[hsl(355_90%_40%)]'
          }`}
          aria-label="Send"
        >
          ↑
        </button>
      </div>
    </div>
  );
}

function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-6 md:px-12 md:py-8">
        <span aria-hidden="true" />

        <nav className="hidden items-center gap-6 md:flex md:gap-10">
          {[
            { href: '/landing0726', label: 'Home' },
            { href: '/rooms', label: 'Rooms' },
            { href: '/discover', label: 'Discover' },
            { href: '/download', label: 'Download' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[11px] uppercase tracking-[0.22em] text-ink/70 transition-colors hover:text-rust"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div ref={menuRef} className="relative md:hidden">
          <button
            type="button"
            aria-label="Open TakeShape menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-app-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[hsl(355_90%_40%)] text-cream shadow-[0_8px_18px_rgba(20,6,6,0.28),inset_0_1px_0_hsl(355_90%_62%)] transition-[filter,transform] duration-200 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/80 active:translate-y-[1px]"
          >
            <TakeShapeMark className="h-8 w-8" />
          </button>

          <div
            id="mobile-app-menu"
            className={`absolute right-0 top-[calc(100%+12px)] w-[230px] origin-top-right rounded-[18px] border border-cream/65 bg-cream/95 p-2 shadow-[0_18px_42px_rgba(20,6,6,0.25)] backdrop-blur-md transition duration-200 ${
              isMenuOpen
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none -translate-y-2 opacity-0'
            }`}
          >
            <Link
              href="/download"
              onClick={() => setIsMenuOpen(false)}
              className="flex min-h-[56px] items-center rounded-[14px] px-4 text-[15px] font-medium text-slate-700 transition-colors hover:bg-rust/10 hover:text-rust focus:outline-none focus-visible:ring-2 focus-visible:ring-rust/70"
            >
              Download TakeShape
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-taupe/50">
      <div className="mx-auto max-w-[1500px] px-6 py-8 md:px-12 md:py-10">
        <div className="flex items-center justify-between gap-6">
          <p className="font-serif text-2xl text-rust">TakeShape</p>
          <Link
            href="/download"
            className="inline-flex min-h-[52px] min-w-[150px] self-end items-center justify-center rounded-full bg-[hsl(355_90%_40%)] px-7 font-serif text-lg font-bold text-cream shadow-[0_12px_30px_rgba(20,6,6,0.24)] transition-[filter,transform] duration-200 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-rust/60 active:translate-y-[1px]"
          >
            Download
          </Link>
        </div>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <p className="text-[11px] uppercase tracking-[0.22em] text-ink/60">
            Discover &middot; Questions &middot; Follow
          </p>
          <div className="grid gap-2 text-sm text-ink/70 md:text-right">
            <p>
              <a className="hover:text-rust" href="mailto:home@take.shape">
                home@take.shape
              </a>
            </p>
            <p className="text-[11px] uppercase tracking-[0.22em] text-ink/50">
              &copy; {new Date().getFullYear()} TakeShape
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function TakeShapeMark({ shineAngle, ...props }: MarkProps) {
  const useShine = typeof shineAngle === 'number';
  const fill = useShine ? 'url(#ts-shine-gradient)' : 'currentColor';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 251 251"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <mask id="ts-slash-cutout" maskUnits="userSpaceOnUse" x="0" y="0" width="251" height="251">
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
        {useShine && (
          <linearGradient
            id="ts-shine-gradient"
            gradientUnits="objectBoundingBox"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
            gradientTransform={`rotate(${shineAngle} 0.5 0.5)`}
          >
            <stop offset="0%" stopColor="hsl(355 90% 50%)" />
            <stop offset="20%" stopColor="hsl(355 90% 40%)" />
            <stop offset="100%" stopColor="hsl(355 90% 28%)" />
          </linearGradient>
        )}
      </defs>
      <path
        d="M149.189 211.166C167.89 206.078 184.552 194.96 196.507 179.226C197.143 178.389 197.559 177.276 197.807 176.003C199.452 167.593 192.503 159.943 183.945 160.417L170.778 161.145C160.396 161.719 151.51 153.769 150.93 143.387C150.35 133.006 160.516 125.4 170.778 120.744C197.807 108.481 206.19 87.5822 190.442 66.2595C187.843 62.7396 185.111 59.6559 182.295 57.3115C164.907 42.8346 142.927 35.5277 120.399 36.7381C71.4167 39.371 33.853 81.3071 36.6625 130.223C39.0983 172.641 71.1061 206.59 111.508 213.144C116.257 214.452 130.441 215.888 149.189 211.166Z"
        stroke={fill}
        strokeWidth={27}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        mask="url(#ts-slash-cutout)"
      />
      <path
        d="M95.5 44.5H122.5V177A64 64 0 0 1 95.5 167V44.5Z"
        fill={fill}
      />
    </svg>
  );
}
