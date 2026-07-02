import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { TakeShapeMark } from "./takeshape-mark";

const nav = [
  { to: "/", label: "Home" },
  { to: "/rooms", label: "Rooms" },
  { to: "/discover", label: "Discover" },
  { to: "/download", label: "Download" },
] as const;

export function SiteHeader() {
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
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-6 md:px-12 md:py-8">
        <span aria-hidden="true" />


        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex md:gap-10">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-[11px] uppercase tracking-[0.22em] text-ink/70 transition-colors hover:text-rust"
              activeProps={{ className: "text-rust" }}
              activeOptions={{ exact: true }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile app menu */}
        <div ref={menuRef} className="relative md:hidden">
          <button
            type="button"
            aria-label="Open TakeShape menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-app-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[hsl(355_90%_40%)] text-cream shadow-[0_8px_18px_rgba(20,6,6,0.28),inset_0_1px_0_hsl(355_90%_62%)] transition-[filter,transform] duration-200 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/80 active:translate-y-[1px]"
          >
            <TakeShapeMark
              className="h-8 w-8"
              style={{
                filter:
                  "drop-shadow(0 1px 0 hsl(355 90% 62% / 0.35)) drop-shadow(0 1px 2px rgba(20, 6, 6, 0.18))",
              }}
            />
          </button>

          <div
            id="mobile-app-menu"
            className={`absolute right-0 top-[calc(100%+12px)] w-[230px] origin-top-right rounded-[18px] border border-cream/65 bg-cream/95 p-2 shadow-[0_18px_42px_rgba(20,6,6,0.25)] backdrop-blur-md transition duration-200 ${
              isMenuOpen
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-2 opacity-0"
            }`}
          >
            <Link
              to="/download"
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
