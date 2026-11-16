---
'@crawfordyoung/ui': minor
---

`Button`, `Toggle` and `ToggleGroup` gain `size="touch"` for touchscreens: 96px tall (and at least 96px wide), larger type and 32px icons. `Button` keeps its icon-beside-label row (stack it with `className="flex-col"`); `Toggle` stacks the icon over its label. A `ToggleGroup` passes its `size` down to its items, and `orientation="vertical"` stacks the items as an equal-width rail.

The `link` variant of `Button` now meets AA contrast in the light theme (it uses `text-accent-subtle-foreground` there; dark is unchanged).
