---
'@crawfordyoung/ui': minor
---

WeekCalendarView: `use24h` prop switches the gutter labels, current-time label, event chip times, and the drag-create popover to 24-hour format; new `dayWindows` prop (7 entries, Sun-first) drives per-day wake/sleep windows — windowed mode spans the union window with per-day off-hour shading, full-day mode shades per-day wrap zones, and drag-create is blocked outside each day's window. The current-time indicator is now client-only (fixes an SSR hydration mismatch on minute ticks) and renders as an opaque chip that no longer overlaps hour labels. `CalendarEventChip` gains the same `use24h` prop. `DayWindow` type exported. Playwright config honors `SB_PORT` for worktree e2e runs.
