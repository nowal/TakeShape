import { createFileRoute } from "@tanstack/react-router";
import roomDrawing from "../assets/room-drawing.jpg";
import roomStair from "../assets/room-stair.jpg";
import roomLibrary from "../assets/room-library.jpg";
import roomCourtyard from "../assets/discover-courtyard.jpg";
import roomChapel from "../assets/discover-chapel.jpg";
import roomManor from "../assets/hero-manor.jpg";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Rooms — Take Shape" },
      {
        name: "description",
        content: "A curated index of rooms and interiors shaped by Take Shape.",
      },
      { property: "og:title", content: "Rooms — Take Shape" },
      {
        property: "og:description",
        content: "A curated index of rooms and interiors shaped by Take Shape.",
      },
      { property: "og:image", content: roomDrawing },
      { property: "og:url", content: "/rooms" },
    ],
    links: [{ rel: "canonical", href: "/rooms" }],
  }),
  component: Rooms,
});

const rooms = [
  { src: roomDrawing, w: 1280, h: 1600, name: "The Drawing Room", place: "Wiltshire, UK", year: "MMXX" },
  { src: roomLibrary, w: 1600, h: 1120, name: "The Long Library", place: "Vermont, US", year: "MMXXI", wide: true },
  { src: roomStair, w: 1280, h: 1600, name: "The Spiral", place: "Lisbon, PT", year: "MMXXII" },
  { src: roomCourtyard, w: 1600, h: 1120, name: "Courtyard with Cypress", place: "Provence, FR", year: "MMXXII", wide: true },
  { src: roomChapel, w: 1280, h: 1600, name: "The Chapel", place: "Umbria, IT", year: "MMXXIII" },
  { src: roomManor, w: 1920, h: 1280, name: "The House on the Hill", place: "County Cork, IE", year: "MMXXIV", wide: true },
];

function Rooms() {
  return (
    <section className="mx-auto max-w-[1500px] px-6 pb-24 pt-36 md:px-12 md:pt-44">
      <header className="mb-16 grid gap-6 md:mb-24 md:grid-cols-12">
        <p className="eyebrow md:col-span-2">Index II</p>
        <h1 className="font-serif text-5xl leading-[1.02] text-ink md:col-span-8 md:text-7xl">
          Rooms.
        </h1>
        <p className="font-serif text-lg italic text-ink/70 md:col-span-7 md:col-start-3 md:text-xl">
          A small selection, arranged like plates in a monograph &mdash; a drawing
          room, a stair, a chapel.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-x-8 gap-y-20 md:grid-cols-12">
        {rooms.map((r, i) => {
          const wide = r.wide;
          const offset = i % 2 === 0 ? "md:col-start-1" : "md:col-start-7";
          return (
            <figure
              key={r.name}
              className={
                wide
                  ? "md:col-span-10 md:col-start-2"
                  : `md:col-span-5 ${offset}`
              }
            >
              <div className={wide ? "aspect-[16/9] overflow-hidden rounded-2xl" : "aspect-[4/5] overflow-hidden rounded-2xl"}>
                <img
                  src={r.src}
                  alt={r.name}
                  width={r.w}
                  height={r.h}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="mt-5 flex items-baseline justify-between border-t border-taupe/50 pt-4">
                <div>
                  <p className="font-serif text-xl text-ink">{r.name}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-ink/55">
                    {r.place}
                  </p>
                </div>
                <p className="font-serif text-sm italic text-rust">{r.year}</p>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
