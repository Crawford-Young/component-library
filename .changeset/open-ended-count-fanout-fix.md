---
'@crawfordyoung/ui': minor
---

Repeat-count fields are blank by default: an untouched count on a recurring save now emits `recurrenceCount: undefined` (open-ended series) from both the drag-create popover and ActivityFormDialog. NumberInput gains an opt-in `allowEmpty` prop (`value`/`onChange` widen to `number | undefined` on that arm only). Chip-popover edits no longer transiently fan the edited chip out across selected weekdays when the stored row carried no `recurrenceDays` (server-materialized consumer rows).

BREAKING: `TaskTimeFieldsProps.recurrenceCount` is now `number | undefined` and `onRecurrenceCountChange` receives `number | undefined`.
