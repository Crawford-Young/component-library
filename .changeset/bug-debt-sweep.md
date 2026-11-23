---
'@crawfordyoung/ui': minor
---

Bug and debt sweep:

- `StackedBarChart`: a missing value (`null`, `undefined`, or any non-finite non-number) is now "no data". It draws no segment and reads `—` in the tooltip and the screen-reader table. `0` still draws and reads as 0 (#137).
- `DataTable` tree mode: every row's first cell starts with sr-only "Level N, " text, so depth is announced and not just drawn as indent (#134). Consumer tests that read that cell's `textContent` will see the prefix.
- New `--success-text` / `--warning-text` tokens (`text-success-text`, `text-warning-text` in the preset). In the light theme they're green-700 / amber-700, which keep 4.5:1 on white and on the alert tints; in dark they equal the base tones. `StatTile`, `Alert` and `AgentNodeCard` now use them for tone text (#153). Tailwind v4 CSS-first consumers that map tokens with `@theme inline` need `--color-success-text` / `--color-warning-text` lines.
- `AgentNodeRing` dense: keyboard focus is now an outline, so a needs-you dot keeps its warning halo while focused. A selected dot's outline steps out on focus (#159).
