import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import heroManor from "../assets/hero-manor.jpg";
import roomDrawing from "../assets/room-drawing.jpg";
import roomLibrary from "../assets/room-library.jpg";
import roomStair from "../assets/room-stair.jpg";
import discoverCourtyard from "../assets/discover-courtyard.jpg";
import discoverPavilion from "../assets/discover-pavilion.jpg";
import downloadDetail from "../assets/download-detail.jpg";
import { TakeShapeMark } from "../components/takeshape-mark";
import { HeroScene } from "../components/hero-scene";
import heroVideo from "../assets/hero.mp4.asset.json";
import galleryVideo from "../assets/gallery.mp4.asset.json";
import houseVideo from "../assets/house.mp4.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Take Shape — Architecture & Design Studio" },
      {
        name: "description",
        content:
          "A studio shaping interiors, buildings, and place — between modern restraint and classical elegance.",
      },
      { property: "og:title", content: "Take Shape" },
      {
        property: "og:description",
        content:
          "A studio shaping interiors, buildings, and place — between modern restraint and classical elegance.",
      },
      { property: "og:image", content: heroManor },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const heroRef = useRef<HTMLElement | null>(null);
  const lastCardRef = useRef<HTMLElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const exploreRef = useRef<HTMLDivElement | null>(null);
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
      // Map scroll across the full hero height to 0→1. Progress completes
      // exactly when the sticky controls finish pinning at the top.
      const heroHeight = hero.offsetHeight;
      const raw = Math.min(1, Math.max(0, window.scrollY / heroHeight));
      setProgress(easeInOutCubic(raw));

      // Smoothly scroll "Explore More" away the moment the third card finishes
      // stacking. We translate via transform so there's no layout thrash.
      const last = lastCardRef.current;
      if (last) {
        const isDesktop = window.matchMedia("(min-width: 768px)").matches;
        const stuckTop = isDesktop ? 216 : 184;
        const rect = last.getBoundingClientRect();
        const stacked = rect.top <= stuckTop + 0.5;
        if (stacked) {
          if (releaseY === null) releaseY = window.scrollY;
          setExploreOffset(window.scrollY - releaseY);
        } else {
          if (releaseY !== null) releaseY = null;
          setExploreOffset(0);
        }
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Shine starts at 10:30 on each element and rotates clockwise to 4:30 (180°).
  const svgAngle = 45 + progress * 180;
  const cssAngle = 135 + progress * 180;

  return (
    <>
      {/* HERO — sized so the sticky red bar lines up exactly at the bottom of the fold */}
      <section ref={heroRef} className="relative h-[calc(100svh-72px)] md:h-[calc(100svh-88px)] w-full overflow-hidden bg-cream">
        <img
          src={heroManor}
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
            event.currentTarget.style.display = "none";
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-black/10 to-black/70" />
        <div className="absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-[1500px] flex-col items-center px-6 pb-[9svh] text-center md:px-12 md:pb-[10svh]">
          <h1 className="fade-up w-screen max-w-none font-serif text-[clamp(3.9rem,11.5vw,11rem)] font-bold leading-[0.86] text-cream">
            <span className="block whitespace-nowrap">Your Home</span>
            <span className="block whitespace-nowrap">in Your Hands</span>
          </h1>
          <Link
            to="/download"
            className="fade-up mt-7 inline-flex min-h-[56px] min-w-[210px] items-center justify-center rounded-full bg-[hsl(355_90%_40%)] px-8 font-serif text-lg font-bold text-cream shadow-[0_12px_32px_rgba(20,6,6,0.35)] transition-[filter,transform] duration-200 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/80 active:translate-y-[1px] md:min-h-[60px] md:min-w-[240px] md:text-xl"
            style={{
              textShadow:
                "0 1px 0 hsl(355 90% 22%), 0 -1px 0 hsl(355 90% 62%), 0 2px 3px rgba(20, 6, 6, 0.45)",
            }}
          >
            Download TakeShape
          </Link>
        </div>
      </section>

      {/* Solid red bar — starts at the bottom of the fold, sticks to the top as you scroll */}
      <button
        type="button"
        aria-label="Download the TakeShape App"
        className="sticky top-0 z-30 block h-[72px] md:h-[88px] w-full cursor-pointer border-0 p-0 text-left transition-[filter] duration-300 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
        style={{
          background: `linear-gradient(${cssAngle}deg, hsl(355 90% 50%) 0%, hsl(355 90% 40%) 20%, hsl(355 90% 28%) 100%)`,
          boxShadow: "0 10px 24px -14px rgba(20, 12, 6, 0.45)",
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
                  "drop-shadow(0 1px 0 hsl(355 90% 22%)) drop-shadow(0 -1px 0 hsl(355 90% 62%)) drop-shadow(0 2px 3px rgba(20, 6, 6, 0.45))",
              }}
            />
          </span>
          <span
            className="font-serif text-2xl font-bold tracking-tight text-cream md:text-[28px]"
            style={{
              textShadow:
                "0 1px 0 hsl(355 90% 22%), 0 -1px 0 hsl(355 90% 62%), 0 2px 3px rgba(20, 6, 6, 0.45)",
            }}
          >
            TakeShape
          </span>
        </div>
      </button>




      {/* STATEMENT — horizontal scroll gallery */}
      <HorizontalStatement />




      {/* ROOMS TEASER */}
      <section ref={sectionRef} className="relative mx-auto max-w-[1500px] px-0 md:px-12">
        <div
          ref={exploreRef}
          className="sticky top-[72px] md:top-[88px] z-10 h-[72px] w-full border-b border-taupe/60 bg-cream md:h-[88px] will-change-transform"
          style={{ transform: `translateY(${-exploreOffset}px)` }}
        >
          <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-6 md:px-0">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-ink md:text-[28px]">
              Explore More
            </h2>
            <Link
              to="/rooms"
              className="hidden text-[11px] uppercase tracking-[0.22em] text-rust hover:underline md:inline"
            >
              View all &rarr;
            </Link>
          </div>
        </div>


        <div className="mt-6 flex flex-col gap-6 px-6 pb-[12svh] [--stack-top:156px] md:mt-10 md:grid md:grid-cols-3 md:gap-8 md:px-0 md:pb-0 md:[--stack-top:188px]">
          {[
            { src: roomDrawing, w: 1280, h: 1600, label: "The Drawing Room", place: "Wiltshire" },
            { src: roomStair, w: 1280, h: 1600, label: "The Spiral", place: "Lisbon" },
            { src: roomLibrary, w: 1600, h: 1120, label: "The Long Library", place: "Vermont" },
          ].map((r, i) => (
            <figure
              key={r.label}
              ref={i === 2 ? lastCardRef : undefined}
              className="group sticky md:static"
              style={{ top: `calc(var(--stack-top) + ${i * 14}px)` }}
            >




              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream shadow-[0_-12px_30px_-20px_rgba(20,12,6,0.45)] md:shadow-none">
                <img
                  src={r.src}
                  alt={r.label}
                  width={r.w}
                  height={r.h}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.03]"
                />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-baseline justify-between bg-gradient-to-t from-ink/70 via-ink/30 to-transparent px-5 pb-5 pt-12 md:hidden">
                  <span className="font-serif text-lg text-cream">{r.label}</span>
                  <span className="text-[11px] uppercase tracking-[0.22em] text-cream/80">
                    {r.place}
                  </span>
                </figcaption>
              </div>
              <figcaption className="mt-4 hidden items-baseline justify-between md:flex">
                <span className="font-serif text-lg text-ink">{r.label}</span>
                <span className="text-[11px] uppercase tracking-[0.22em] text-ink/55">
                  {r.place}
                </span>
              </figcaption>

            </figure>
          ))}
        </div>

        <div className="mt-8 md:hidden">
          <Link to="/rooms" className="text-[11px] uppercase tracking-[0.22em] text-rust">
            View all rooms &rarr;
          </Link>
        </div>
      </section>

      {/* DISCOVER STRIP */}
      <section className="mt-12 md:mt-16">
        <Link to="/discover" className="group block">
          <div className="relative h-[70svh] min-h-[460px] w-full overflow-hidden">
            <img
              src={discoverPavilion}
              alt="Stone pavilion at the edge of a misted meadow"
              width={1920}
              height={1080}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-ink/20" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <p className="eyebrow text-cream/90">III &mdash; Discover</p>
              <p className="mt-4 font-serif text-4xl italic text-cream md:text-6xl">
                Field notes &amp; quiet places.
              </p>
              <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-cream/80">
                Enter &rarr;
              </p>
            </div>
          </div>
        </Link>
      </section>
    </>
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
      // Pinned when the section has reached the sticky offset and is still in view
      setPinned(rect.top <= 88 && rect.bottom > inner.offsetHeight);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);


  // Two transitions: panel 1 slides off during 0→0.5, panel 2 slides off during 0.5→1.
  const p = Math.min(1, Math.max(0, progress));
  const panel1Out = Math.min(1, p / 0.5); // 0 → 1
  const panel2Out = Math.min(1, Math.max(0, (p - 0.5) / 0.5)); // 0 → 1

  return (
    <section
      ref={wrapRef}
      aria-label="A note on home"
      className="relative w-full"
      style={{ height: "calc((100svh - 72px) * 3.35)" }}
    >
      <div
        ref={stickyRef}
        className="sticky top-[72px] md:top-[88px] h-[calc(100svh-72px)] md:h-[calc(100svh-88px)] overflow-hidden bg-cream"
      >
        {/* Panel 3 (bottom of stack) — app download callout */}
        <div
          className="absolute inset-0 z-0 overflow-hidden bg-ink"
        >
          <img
            src={downloadDetail}
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
              to="/download"
              className="absolute bottom-6 left-1/2 inline-flex min-h-[60px] min-w-[220px] -translate-x-1/2 items-center justify-center rounded-full bg-[hsl(355_90%_40%)] px-9 font-serif text-xl font-bold text-cream shadow-[0_12px_32px_rgba(20,6,6,0.35)] transition-[filter,transform] duration-200 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/80 active:translate-y-[1px] md:bottom-10 md:min-h-[64px] md:min-w-[260px] md:text-2xl"
              style={{
                textShadow:
                  "0 1px 0 hsl(355 90% 22%), 0 -1px 0 hsl(355 90% 62%), 0 2px 3px rgba(20, 6, 6, 0.45)",
              }}
            >
              Download TakeShape
            </Link>
          </div>
        </div>

        {/* Panel 2 (middle of stack) — chat demo over video */}
        <div
          className="absolute inset-0 z-10 overflow-hidden bg-cream will-change-transform"
          style={{
            transform: `translate3d(${-100 * panel2Out}%, 0, 0)`,
            boxShadow: panel2Out > 0 && panel2Out < 1 ? "8px 0 24px rgba(0,0,0,0.25)" : undefined,
          }}
        >
          <img
            src={roomDrawing}
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
              event.currentTarget.style.display = "none";
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.55) 100%)",
            }}
          />
          <ChatDemo active={panel1Out > 0.5} />
        </div>


        {/* Panel 1 (top of stack) — full-bleed video */}
        <div
          className="absolute inset-0 z-20 overflow-hidden bg-cream will-change-transform"
          style={{
            transform: `translate3d(${-100 * panel1Out}%, 0, 0)`,
            boxShadow: panel1Out > 0 && panel1Out < 1 ? "8px 0 24px rgba(0,0,0,0.25)" : undefined,
          }}
        >
          <img
            src={discoverCourtyard}
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
              event.currentTarget.style.display = "none";
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.55) 100%)",
            }}
          />
          <ChatDemo active={pinned} userColor="text-white" aiColor="text-white/95" />
        </div>
      </div>

    </section>
  );
}

type ChatLine = { role: "user" | "ai"; text: string };

const CHAT_SCRIPT: ChatLine[] = [
  { role: "user", text: "What should I do to make my living room feel more cozy?" },
  {
    role: "ai",
    text:
      "Great question! Here are some color palettes to choose from that can bring a cozy atmosphere: sage green, oak brown, canvas cream.",
  },
  { role: "user", text: "I like sage green for the walls." },
  {
    role: "ai",
    text:
      "Sounds good, let's take a scan of the room, and I'll give some suggestions on where to start!",
  },
];

function ChatDemo({
  active,
  userColor = "text-cream",
  aiColor = "text-cream/95",
}: {
  active: boolean;
  userColor?: string;
  aiColor?: string;
}) {
  const [lines, setLines] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [composer, setComposer] = useState("");
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
      if (line.role === "user") {
        // Type into the composer
        schedule(() => setComposerTyping(true), startAt);
        for (let i = 1; i <= line.text.length; i++) {
          schedule(() => setComposer(line.text.slice(0, i)), startAt + i * charMs);
        }
        const typedDone = startAt + line.text.length * charMs;
        // Flash the send button
        schedule(() => setSendFlash(true), typedDone + sendPause);
        schedule(() => setSendFlash(false), typedDone + sendPause + 180);
        // Clear composer and add message to transcript
        schedule(() => {
          setComposer("");
          setComposerTyping(false);
          setLines((prev) => [...prev, { role: "user", text: line.text }]);
        }, typedDone + sendPause + 200);
        cursor = typedDone + sendPause + 200 + gap;
      } else {
        // AI streams as overlay text
        const idxAtStart = startAt;
        schedule(() => {
          setLines((prev) => [...prev, { role: "ai", text: "" }]);
        }, idxAtStart);
        for (let i = 1; i <= line.text.length; i++) {
          schedule(() => {
            setLines((prev) => {
              const next = prev.slice();
              const lastIdx = next.length - 1;
              if (lastIdx >= 0 && next[lastIdx].role === "ai") {
                next[lastIdx] = { role: "ai", text: line.text.slice(0, i) };
              }
              return next;
            });
          }, idxAtStart + i * charMs);
        }
        cursor = idxAtStart + line.text.length * charMs + gap;
      }
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [active]);

  return (
    <div className="absolute inset-0 flex flex-col justify-end px-6 pb-6 md:px-16 md:pb-10 pointer-events-none">
      {/* Transcript overlay */}
      <div className="mx-auto w-full max-w-[820px] flex flex-col gap-4 mb-6">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`flex ${line.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            <p
              className={`max-w-[85%] font-serif text-[clamp(1.25rem,2.6vw,2rem)] leading-snug ${
                line.role === "user" ? `text-right ${userColor}` : `text-left ${aiColor}`
              }`}
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6), 0 2px 20px rgba(0,0,0,0.55), 0 0 40px rgba(0,0,0,0.35)" }}
            >
              {line.text}
            </p>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="mx-auto w-full max-w-[640px] flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/30 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
        <div className="flex-1 text-[13px] md:text-sm text-white/95 min-h-[20px]" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>
          {composerTyping || composer ? (
            <>
              {composer}
              <span className="inline-block w-[1px] h-3.5 ml-0.5 bg-current animate-pulse align-middle" />
            </>
          ) : (
            <span className="text-white/60">Ask about your home…</span>
          )}
        </div>

        <button
          type="button"
          className={`flex h-8 w-8 items-center justify-center rounded-full text-cream text-sm transition-transform duration-150 ${
            sendFlash ? "scale-90 bg-[hsl(355_90%_30%)]" : "bg-[hsl(355_90%_40%)]"
          }`}
          aria-label="Send"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
