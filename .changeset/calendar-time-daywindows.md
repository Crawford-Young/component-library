---
'@crawfordyoung/ui': minor
---

WeekCalendarView: `use24h` prop switches the gutter labels, current-time label, event chip times, and the drag-create popover to 24-hour format; new `dayWindows` prop (7 entries, Sun-first, fractional hours supported) drives per-day wake/sleep windows — windowed mode spans the union window with per-day off-hour shading, full-day mode shades per-day wrap zones, and drag-create is blocked outside each day's window. The current-time indicator is now client-only (fixes an SSR hydration mismatch on minute ticks) and renders as an opaque chip that no longer overlaps hour labels. `CalendarEventChip` gains the same `use24h` prop. `DayWindow` type exported. Playwright config honors `SB_PORT` for worktree e2e runs.

ActivityFormDialog: rich-field parity (color, location, description, all-day), solo/group radio social section with visibility-gated joinability, compact viewport-fitting layout (pinned header/footer, scrollable body, 85vh cap). BREAKING for the exported types: `ActivityType` union drops `'habit'` (now `'task' | 'goal'`) and `ActivityFormValues` gains the rich fields — pre-1.0 minor per repo convention.

WeekCalendarView: drag-create/move now only engages after the pointer crosses a slop threshold, so a stationary press (click) no longer misfires as a drag.

CalendarEvent gains an optional `completed` field; `CalendarEventChip` gains an `onToggleComplete` prop that renders a "Mark complete" / "Mark incomplete" popover action and strikes through the title when completed. `WeekCalendarView` gains a matching `onEventToggleComplete` prop — toggling a recurrence instance toggles the original event. `SleepBand`'s `interactive` prop is removed: off-hour shading is now always `pointer-events-none`, so event chips inside sleep zones stay clickable while drag-create is still blocked by the existing slot-level window guard.
