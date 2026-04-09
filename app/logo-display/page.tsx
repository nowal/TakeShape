import Image from 'next/image';
import {
  PRIMARY_COLOR_CSS,
  PRIMARY_COLOR_HSL,
} from '@/constants/brand-color';

export default function LogoDisplayPage() {
  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-montserrat font-bold text-black">
          Logo Display
        </h1>
        <p className="mt-2 text-base font-open-sans text-black-6">
          Primary color: {PRIMARY_COLOR_CSS} (hue{' '}
          {PRIMARY_COLOR_HSL.hue})
        </p>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="rounded-xl border border-black-08 bg-white p-6">
            <h2 className="text-lg font-semibold text-black">
              Inline SVG (from constants)
            </h2>
            <div
              className="mt-4 flex justify-center"
              style={{ color: PRIMARY_COLOR_CSS }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="320"
                height="320"
                viewBox="0 0 251 251"
                fill="none"
                role="img"
                aria-label="TakeShape logo with curved center stroke"
              >
                <defs>
                  <mask
                    id="inline-slash-cutout"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="251"
                    height="251"
                  >
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
                  d="M149.189 211.166C167.89 206.078 184.552 194.96 196.507 179.226C197.143 178.389 197.559 177.276 197.807 176.003C199.452 167.593 192.503 159.943 183.945 160.417L170.778 161.145C160.396 161.719 151.51 153.769 150.93 143.387C150.35 133.006 160.516 125.4 170.778 120.744C197.807 108.481 206.19 87.5822 190.442 66.2595C187.843 62.7396 185.111 59.6559 182.295 57.3115C164.907 42.8346 142.927 35.5277 120.399 36.7381C71.4167 39.371 33.853 81.3071 36.6625 130.223C39.0983 172.641 71.1061 206.59 111.508 213.144C116.257 214.452 130.441 215.888 149.189 211.166Z"
                  stroke={PRIMARY_COLOR_CSS}
                  strokeWidth="27"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  mask="url(#inline-slash-cutout)"
                />
                <path
                  d="M95.5 44.5H122.5V177A64 64 0 0 1 95.5 167V44.5Z"
                  fill={PRIMARY_COLOR_CSS}
                />
              </svg>
            </div>
          </section>

          <section className="rounded-xl border border-black-08 bg-white p-6">
            <h2 className="text-lg font-semibold text-black">
              File SVG
            </h2>
            <div
              className="mt-4 flex justify-center"
              style={{ color: PRIMARY_COLOR_CSS }}
            >
              <Image
                src="/logo/takeshape-logo-curved.svg"
                alt="TakeShape logo file export with curved center stroke"
                width={320}
                height={320}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
