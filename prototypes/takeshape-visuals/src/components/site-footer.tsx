import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-taupe/50">
      <div className="mx-auto max-w-[1500px] px-6 py-8 md:px-12 md:py-10">
        <div className="flex items-center justify-between gap-6">
          <p className="font-serif text-2xl text-rust">TakeShape</p>
          <Link
            to="/download"
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
