---
'@crawfordyoung/ui': minor
---

Add `RouteErrorFallback` — shared fallback UI for Next.js `error.tsx` boundaries. Composes `ErrorPage` + retry `Button`, renders optional `error.digest` reference line. Framework-agnostic (`reset` callback only; no `next/*`/`@sentry/*` imports).
