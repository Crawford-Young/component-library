---
'@crawfordyoung/ui': minor
---

Add `DataTable` tree rows (`getSubRows`, `expanded` / `onExpandedChange` / `defaultExpanded`, `getRowLabel`, optional `getRowId` so expanded state survives live inserts, expand-all / collapse-all) and keyboard-operable column sorting (header `<button>` + `aria-sort`), the `StackedBarChart` component, and the `DayTimeline` component (per-day spans on a 24 h axis; `kinds` prop of `{ key, label, lane? }` sets the legend, lane and cycled `--chart-n` color), plus the `--chart-1..6` color tokens (light and dark, with `bg-chart-n` utilities in the Tailwind preset).
