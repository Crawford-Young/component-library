---
'@crawfordyoung/ui': minor
---

Add core motion primitives: `ScrollReveal` (scroll choreography Layer 1), `StaggerReveal` (arrival Pattern 5), `ProgressLine` (cinematic progress, Pattern 2), `useReducedMotionSafe`, and pure motion variant builders. `Skeleton` gains a `variant` prop — shimmer is the new default, `pulse` remains as an escape hatch. Tailwind preset animation easings now use brand curves, and a `shimmer` keyframe is added. `framer-motion` (>=12) is now a peer dependency.
