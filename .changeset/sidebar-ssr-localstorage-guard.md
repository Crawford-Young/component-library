---
'@crawfordyoung/ui': patch
---

Fix `Sidebar` crashing during SSR. The collapsed-state `useState` initializer
read `localStorage` in the render phase, throwing `localStorage is not defined`
when rendered on the server (and `SecurityError` in some privacy modes). The
read is now wrapped in a `try/catch` that defaults to expanded, making
`Sidebar` SSR-safe.
