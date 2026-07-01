export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-taupe/50">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6 px-6 py-10 md:flex-row md:items-end md:justify-between md:px-12 md:py-14">
        <div>
          <p className="font-serif text-2xl text-rust">TakeShape</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-ink/60">
            Discover &middot; Questions &middot; Follow
          </p>
        </div>
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
    </footer>
  );
}
