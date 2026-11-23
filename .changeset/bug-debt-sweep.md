---
'@crawfordyoung/ui': minor
---

Bug and debt sweep:

- `StackedBarChart`: a missing value (`null`, `undefined`, or any non-finite non-number) is now "no data". It draws no segment and reads `—` in the tooltip and the screen-reader table. `0` still draws and reads as 0 (#137).
- `DataTable` tree mode: every row's first cell starts with sr-only "Level N, " text, so depth is announced and not just drawn as indent (#134). Consumer tests that read that cell's `textContent` will see the prefix.
- New tone-text tokens `--success-text`, `--warning-text`, `--destructive-text` and `--info-text` (preset: `text-<tone>-text`). In the light theme they're the -700 shades, which keep 4.5:1 on white and on the `/10` alert tints; in dark they equal the base tones. `StatTile`, `Alert` and `AgentNodeCard` use them for tone text, and a toned `Alert` now draws its description in `foreground` instead of `muted-foreground`, which fell under 4.5:1 on every light tint (#153). Tailwind v4 CSS-first consumers that map tokens with `@theme inline` need `--color-<tone>-text` lines.
- `AgentNodeRing` dense: keyboard focus is now an outline, so a needs-you dot keeps its warning halo while focused. A selected dot's outline steps out on focus (#159).
