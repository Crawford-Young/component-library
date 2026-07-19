---
'@crawfordyoung/ui': patch
---

SSR-safe `usePrefersReducedMotion`/MagneticButton hover check via `useSyncExternalStore`; fixes `window is not defined` 500 when SSR-rendering SplitText/MagneticButton/ProgressLine/CountUp/BrandSplash.
