import { createFileRoute } from "@tanstack/react-router";
import detail from "../assets/download-detail.jpg";

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Download — Take Shape" },
      {
        name: "description",
        content: "Press kit, portfolio, and selected drawings from Take Shape.",
      },
      { property: "og:title", content: "Download — Take Shape" },
      {
        property: "og:description",
        content: "Press kit, portfolio, and selected drawings from Take Shape.",
      },
      { property: "og:image", content: detail },
      { property: "og:url", content: "/download" },
    ],
    links: [{ rel: "canonical", href: "/download" }],
  }),
  component: Download,
});

const files = [
  { label: "Studio Portfolio", note: "PDF · 24 plates · 38 MB" },
  { label: "Press Kit", note: "ZIP · Logos, photography, bios · 56 MB" },
  { label: "Selected Drawings", note: "PDF · 12 sheets · 14 MB" },
];

function Download() {
  return (
    <section className="mx-auto max-w-3xl px-6 pb-24 pt-36 md:pt-44">
      <header className="text-center">
        <p className="eyebrow">Index IV</p>
        <h1 className="mt-4 font-serif text-5xl leading-[1.02] text-ink md:text-7xl">
          Download.
        </h1>
        <p className="mx-auto mt-6 max-w-lg font-serif text-lg italic text-ink/70 md:text-xl">
          A small set of documents for editors, collaborators, and curious
          friends.
        </p>
      </header>

      <div className="mt-16">
        <img
          src={detail}
          alt="Terracotta roof tiles against a cream plaster wall"
          width={1600}
          height={1120}
          loading="lazy"
          className="aspect-[16/9] w-full rounded-2xl object-cover"
        />
      </div>

      <ul className="mt-16 divide-y divide-taupe/60 border-y border-taupe/60">
        {files.map((f) => (
          <li key={f.label}>
            <a
              href="#"
              className="group flex items-baseline justify-between gap-6 py-7 transition-colors hover:text-rust"
            >
              <div>
                <p className="font-serif text-2xl text-ink group-hover:text-rust md:text-3xl">
                  {f.label}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-ink/55">
                  {f.note}
                </p>
              </div>
              <span className="shrink-0 text-[11px] uppercase tracking-[0.22em] text-rust">
                Download &darr;
              </span>
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-20 text-center">
        <p className="eyebrow">Correspondence</p>
        <p className="mt-4 font-serif text-2xl italic text-ink md:text-3xl">
          For new work and considered enquiries
        </p>
        <a
          href="mailto:studio@takeshape.co"
          className="mt-4 inline-block font-serif text-2xl text-rust hover:underline md:text-3xl"
        >
          studio@takeshape.co
        </a>
      </div>
    </section>
  );
}
