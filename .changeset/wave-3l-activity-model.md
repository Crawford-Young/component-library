---
'@crawfordyoung/ui': minor
---

Wave 3L — Activity model: recurring creation/editing moves to app-side activity schedules, calendar events link to activities, and a new template + event-form dialog pair replaces the old type-morphing form.

New / changed exports:

- `CalendarEvent.activityId?: string | null` — links a calendar event to an activity.
- `CalendarEventChipProps.onEditActivity?: (event: CalendarEvent) => void` — chip popover shows an "Edit activity" action only when `event.activityId` is non-null AND the handler is provided.
- `WeekCalendarViewProps.onEventEditActivity?: (event: CalendarEvent) => void` — view-level threading for the chip's "Edit activity" bridge.
- `WeekCalendarViewProps.createActivityOptions?: readonly CreateActivityOption[]` + `CreateActivityOption` (`id`, `label`, `color?`, `defaultDurationMin?`) — feeds an activity picker (`Select`) at the top of the drag-create popover. Selecting an option seeds title/color; `defaultDurationMin` shows an inline "Use N min" snap button.
- `WeekCalendarViewProps.onCreateActivityRequest?: (slot: { start: string; end: string }) => void` — fires when the picker's "New activity…" sentinel is chosen; closes the popover.
- `EventCreateSubmitPayload.activityId?: string | null` — carried on the create-popover submit payload (`null` for "No activity").
- `ActivityTemplateDialog` (new component) + `ActivityScheduleSlot`, `ActivityTemplateValues`, `ActivityTemplateDialogProps` — standalone activity template editor: title, color, description, default location, min/max duration, weekly target sessions, and a weekday schedule builder (toggle a day to add a start-time + duration row).
- `EventFormDialog` (new component) + `EventFormValues`, `EventFormDialogProps` — event editor dialog: title, all-day, `TaskTimeFields` (date/start/end), color, location, description.
- `ActionConfirmCard.entityType` gains `'activity'` (now `'habit' | 'goal' | 'event' | 'activity'`).

Deprecated but still functional (display fan-out unchanged when present, no behavior change when absent): `CalendarEvent.recurrenceDays`, `recurrenceFrequency`, `recurrenceCount`, `seriesDays`, `streak`.

**BREAKING:**

- `WeekCalendarViewProps.onEventCreate` signature changed — payload is now the explicit `EventCreateSubmitPayload` interface (title, start, end, allDay?, color?, location?, description?, activityId?) instead of `Omit<CalendarEvent, 'id'>`. Recurrence fields (`recurrenceFrequency`, `recurrenceCount`, `recurrenceDays`) are no longer part of the create payload.
- `WeekCalendarViewProps.recurrenceEditMode` removed.
- Recurrence controls (Repeat select, repeat-count `NumberInput`, Days toggle group) removed from the drag-create popover; recurrence section removed from the chip edit popover.
- `ActivityFormDialog`, `ActivityFormDialogProps`, `ActivityFormValues`, `ActivityType`, `ActivitySocial` exports removed — replaced by `EventFormDialog` (event editing) and `ActivityTemplateDialog` (activity template editing).
- `TaskTimeFieldsProps` loses its 9 recurrence props: `recurrence`, `onRecurrenceChange`, `recurrenceCount`, `onRecurrenceCountChange`, `recurrenceDays`, `onRecurrenceDaysChange`, `showRecurrence`, `repeatMin`, `repeatMax`.

Single known consumer (cybond) — coordinate the app-side migration to `EventCreateSubmitPayload`/`EventFormDialog`/`ActivityTemplateDialog` before upgrading.
