---
'@crawfordyoung/ui': patch
---

Narrow the `@tanstack/react-table` peer range from `>=8` to `^8` (v9 dropped `useReactTable`, so the barrel import threw under Bun). Add `StatusDot` (working / needs-you / idle / done) and a Badge `warning` variant; `AgentNodeCard` now renders its dot through `StatusDot`.
