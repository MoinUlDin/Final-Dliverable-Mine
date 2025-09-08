import React from "react";

type Props = {
  /** bounce height in pixels (positive number). Default: 12 */
  height?: number;
  /** animation duration in milliseconds. Default: 900 */
  duration?: number;
  /** dot diameter in pixels. Default: 12 */
  dotSize?: number;
  /** dot color. Default: white */
  color?: string;
  /** gap between dots in px. Default: 12 */
  gap?: number;
};

export default function ThreeDotLoader({
  height = 12,
  duration = 900,
  dotSize = 12,
  color = "#ffffff",
  gap = 12,
}: Props) {
  // delays for the three dots (ms)
  const delays = [0, 120, 240];

  // inline CSS variables (TSX typing uses CSSProperties; using `as any` for custom vars)
  const rootStyle = {
    // positive value used and multiplied by -1 in keyframes
    ["--bounce-height" as any]: `${height}px`,
    ["--bounce-duration" as any]: `${duration}ms`,
    ["--dot-size" as any]: `${dotSize}px`,
    ["--dot-color" as any]: `${color}`,
    ["--dot-gap" as any]: `${gap}px`,
  } as React.CSSProperties;

  return (
    <>
      <div
        aria-live="polite"
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
        style={rootStyle}
      >
        <div
          className="flex items-center"
          style={{ gap: `${gap}px` }}
          aria-hidden="true"
        >
          {delays.map((d, i) => (
            <span
              key={i}
              className={`dot d${i + 1}`}
              // set per-dot delay using CSS var --delay
              style={{ ["--delay" as any]: `${d}ms` } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      <style>{`
        .dot {
          display: inline-block;
          width: var(--dot-size);
          height: var(--dot-size);
          background: var(--dot-color);
          border-radius: 9999px;
          will-change: transform;
          transform: translateZ(0);
          /* animation uses CSS vars for duration; delay per-dot uses --delay */
          animation: bounceLinear var(--bounce-duration) linear infinite;
          animation-delay: var(--delay, 0ms);
        }

        /* per-dot classes (keeps them available if you want custom rules) */
        .d1 { /* no-op, delay handled via inline var */ }
        .d2 { /* no-op */ }
        .d3 { /* no-op */ }

        /* Linear vertical bounce: constant-speed up then down using calc and --bounce-height */
        @keyframes bounceLinear {
          0%   { transform: translate3d(0, 0, 0); }
          50%  { transform: translate3d(0, calc(var(--bounce-height) * -1), 0); }
          100% { transform: translate3d(0, 0, 0); }
        }

        /* accessibility: respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .dot {
            animation: none !important;
            transform: translate3d(0,0,0) !important;
          }
        }
      `}</style>
    </>
  );
}
