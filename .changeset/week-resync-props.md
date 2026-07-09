---
'@crawfordyoung/ui': minor
---

`WeekCalendarView` gains `onWeekChange` and `resyncToken` — both optional, backward compatible.

- `onWeekChange?: (weekStart: string) => void` — fires on week navigation only (not on mount), payload is the new week's Sunday as a local-ISO date string.
- `resyncToken?: string | number` — on identity change, re-seeds internal `localEvents` state from the `events` prop; deferred while a drag is active; never touches the currently displayed week.
