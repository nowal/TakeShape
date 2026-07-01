type Props = React.SVGProps<SVGSVGElement> & {
  /** When provided, paints the mark with a rotating shine gradient. Angle in degrees. */
  shineAngle?: number;
};

export function TakeShapeMark({ shineAngle, ...props }: Props) {
  const useShine = typeof shineAngle === "number";
  const fill = useShine ? "url(#ts-shine-gradient)" : "currentColor";
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
