---
'@crawfordyoung/ui': minor
---

Add the Activities Unification component set:

- `StreakBadge` — inline streak indicator pill (icon + count), sized off `Badge`.
- `TaskTimeFields` — shared scheduling field group (date, start/end time, recurrence, repeat count). Uses the scroll-spinner `TimeInput` for start/end and exposes a `use24h` prop to display times as 24-hour (`HH:MM`) instead of a 12-hour AM/PM toggle.
- `ActivityCard` — presentational card for tasks, goals, and habits with balanced compact spacing.
- `ActivityFormDialog` — type-morphing create/edit dialog for activities; forwards `use24h` to its time fields.

Also:

- `TimeInput` gains a `size` prop (`'sm' | 'md'`) so it can match form-field height; default stays `'sm'`.
- New `lib/time` helpers (`buildIso`, `toTimeSlot`) for UTC time/slot conversion.
