import { createFileRoute } from "@tanstack/react-router";
import pavilion from "../assets/discover-pavilion.jpg";
import courtyard from "../assets/discover-courtyard.jpg";
import chapel from "../assets/discover-chapel.jpg";
import library from "../assets/room-library.jpg";
import stair from "../assets/room-stair.jpg";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — Take Shape" },
      {
        name: "description",
        content:
          "Field notes, places, and small studies from the studio at Take Shape.",
      },
      { property: "og:title", content: "Discover — Take Shape" },
      {
        property: "og:description",
        content:
          "Field notes, places, and small studies from the studio at Take Shape.",
      },
      { property: "og:image", content: pavilion },
      { property: "og:url", content: "/discover" },
    ],
    links: [{ rel: "canonical", href: "/discover" }],
  }),
  component: Discover,
});

const entries = [
  {
    src: courtyard, w: 1600, h: 1120,
    title: "On the courtyard, and the patience of water",
    dek: "Notes from a stone court in Provence — how cypress, sun, and a small reflecting pool order a room without walls.",
    date: "May MMXXIV",
  },
  {
    src: chapel, w: 1280, h: 1600,
    title: "A single shaft of light",
    dek: "What a small Umbrian chapel teaches about restraint, scale, and the proper weight of stone.",
    date: "March MMXXIV",
  },
  {
    src: library, w: 1600, h: 1120,
    title: "The library as room, not storage",
    dek: "On long tables, low lamps, and the quiet authority of oak.",
    date: "January MMXXIV",
  },
  {
    src: stair, w: 1280, h: 1600,
    title: "A stair is a sentence",
    dek: "The curve, the rail, the soft turn at the top &mdash; how a stair sets the tempo of a house.",
    date: "November MMXXIII",
  },
];

function Discover() {
  const [featured, ...rest] = entries;
  return (
    <section className="mx-auto max-w-[1500px] px-6 pb-24 pt-36 md:px-12 md:pt-44">
      <header className="mb-16 md:mb-24">
        <p className="eyebrow">Index III</p>
        <h1 className="mt-4 font-serif text-5xl leading-[1.02] text-ink md:text-7xl">
          Discover.
        </h1>
      </header>

      {/* Featured */}
      <article className="grid gap-8 border-b border-taupe/50 pb-20 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-7">
          <img
            src={featured.src}
            alt={featured.title}
            width={featured.w}
            height={featured.h}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-2xl object-cover"
          />
        </div>
        <div className="flex flex-col justify-center md:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-rust">
            Featured &middot; {featured.date}
          </p>
          <h2 className="mt-5 font-serif text-3xl leading-[1.1] text-ink md:text-5xl">
            {featured.title}
          </h2>
          <p
            className="mt-6 font-serif text-lg italic text-ink/75 md:text-xl"
            dangerouslySetInnerHTML={{ __html: featured.dek }}
          />
          <p className="mt-8 text-[11px] uppercase tracking-[0.22em] text-ink/55">
            Read the note &rarr;
          </p>
        </div>
      </article>

      {/* List */}
      <ul className="mt-4 divide-y divide-taupe/50">
        {rest.map((e) => (
          <li key={e.title}>
            <a className="group grid items-center gap-6 py-10 md:grid-cols-12 md:gap-10 md:py-14" href="#">
              <div className="md:col-span-4">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                  <img
                    src={e.src}
                    alt={e.title}
                    width={e.w}
                    height={e.h}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                  />
                </div>
              </div>
              <div className="md:col-span-7">
                <h3 className="font-serif text-2xl leading-snug text-ink group-hover:text-rust md:text-4xl">
                  {e.title}
                </h3>
                <p
                  className="mt-3 text-base text-ink/70 md:text-lg"
                  dangerouslySetInnerHTML={{ __html: e.dek }}
                />
              </div>
              <div className="md:col-span-1 md:text-right">
                <p className="text-[11px] uppercase tracking-[0.22em] text-ink/55">
                  {e.date}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
