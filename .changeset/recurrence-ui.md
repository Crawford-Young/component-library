---
'@crawfordyoung/ui': minor
---

Recurrence UI across the calendar and activity components: `WeekCalendarView`'s drag-to-create popover (`EventCreateForm`) gains a repeat-count `NumberInput` that appears once a non-None `Repeat` frequency is chosen, emitted as `recurrenceCount` on the create payload. `ActivityFormDialog`/`TaskTimeFields` gain a weekday toggle-group picker (`recurrenceDays`) that renders when recurrence is set to Weekly. `CalendarEvent` gains `seriesDays`, letting `CalendarEventChip`'s edit popover seed its Days picker from a wider recurring series (taking precedence over `recurrenceDays`) without `WeekCalendarView` fanning that chip's display across those days — saving still writes the picked days back under `recurrenceDays`.
