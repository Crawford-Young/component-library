---
'@crawfordyoung/ui': minor
---

Repeat-count fields are blank by default: an untouched count on a recurring save now emits `recurrenceCount: undefined` (open-ended series) from both the drag-create popover and ActivityFormDialog. NumberInput gains an opt-in `allowEmpty` prop (`value`/`onChange` widen to `number | undefined` on that arm only). `WeekCalendarView` gains an opt-in `recurrenceEditMode` prop: `'server'` preserves a stored row's empty `recurrenceDays` on chip-popover edits instead of transiently fanning the edited chip out across selected weekdays (for consumers whose rows are server-materialized); default `'local'` keeps the pre-wave behavior of adopting the emitted days unconditionally.

BREAKING: `TaskTimeFieldsProps.recurrenceCount` is now `number | undefined` and `onRecurrenceCountChange` receives `number | undefined`.
