---
'@crawfordyoung/ui': patch
---

`WeekCalendarView` chip affordances now gate on their corresponding view-level `onEvent*` prop, matching the gating idiom already used for resize/edit-activity/duplicate:

- The chip's Edit action (popover button + quick-edit icon) gates on `onEventEdit`.
- The chip's Delete action (popover button + quick-delete icon) gates on `onEventDelete`.
- The chip's complete-toggle (checkbox + "Mark complete"/"Mark incomplete" popover button) gates on `onEventToggleComplete`.
- The chip's Lock/Unlock button gates on `onEventToggleLock`.
- Shift+drag recurrence-select (which lands its release in the `onEventEdit` handler) now requires `onEventEdit` to engage at all — without it, a shift+drag on an event with `onEventMove` wired falls through to a plain (non-shift) move instead of silently doing nothing.

A consumer that renders `WeekCalendarView` with zero (or a subset of) these handlers now gets a genuinely read-only calendar for the ungated affordances, instead of a chip that mutates local state with nowhere for the change to go. Consumers passing all four handlers see no behavior change.

Shift+drag recurrence-select itself remains a deprecated-recurrence-era leftover (recurrence creation/editing UI was removed from the library in wave 3L) and is a removal candidate in a future wave.
