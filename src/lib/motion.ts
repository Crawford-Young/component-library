/* src/lib/motion.ts
   Motion design tokens — TS mirror of the motion CSS vars in styles/tokens.css.
   Durations in ms. EASE arrays are Framer Motion cubic-bezier points;
   EASE_CSS are the equivalent CSS strings. See docs/brand/motion.md.
   Framer Motion's ease prop rejects readonly tuples — spread: ease: [...EASE.out]. */

export const MOTION = {
  instant: 100,
  fast: 150,
  base: 250,
  slow: 400,
  hero: 600,
} as const

type BezierCurve = readonly [number, number, number, number]

export const EASE = {
  out: [0.25, 1, 0.5, 1],
  inOut: [0.65, 0, 0.35, 1],
  exit: [0.5, 0, 0.75, 0],
} as const satisfies Record<string, BezierCurve>

const toCubicBezier = (curve: BezierCurve): string => `cubic-bezier(${curve.join(', ')})`

export const EASE_CSS = {
  out: toCubicBezier(EASE.out),
  inOut: toCubicBezier(EASE.inOut),
  exit: toCubicBezier(EASE.exit),
} as const

export const STAGGER = {
  wordMs: 30,
  cardMs: 40,
  charMs: 28,
  capItems: 5,
} as const

/** Skeleton shimmer sweep period — a choreography loop (like BrandSplash's
    signal hold), defined on the scale rather than as a bare literal. */
export const SHIMMER_PERIOD_MS = MOTION.hero * 2.5 // 1500

export const SPRING_MAGNETIC = {
  stiffness: 300,
  damping: 25,
} as const
