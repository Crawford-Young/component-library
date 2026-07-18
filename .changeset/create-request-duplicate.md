---
'@crawfordyoung/ui': minor
---

WeekCalendarView: controlled create-popover reopen + duplicate-from-event

- **`createRequest` / `onCreateRequestDismiss`** — new `WeekCalendarView` props for a controlled reopen of the create popover with an activity preselected. When `createRequest` transitions to a non-null value, the popover opens at the slot (day/time derived from the ISO bounds via local wall-clock getters), with `activityId` preselected in the picker (title/color seeded from the matching `createActivityOptions` entry, then `draft` overrides applied on top). Submit flows through the existing `onEventCreate` path; a dismiss without submit (Cancel / Escape / outside click) fires `onCreateRequestDismiss`. Absent/null leaves the uncontrolled drag-create behavior byte-for-byte unchanged. New exported types: `CreateRequest`, `EventCreateDraftSeed`.
- **`onEventDuplicate`** — new `WeekCalendarView` prop that renders a **Duplicate** action in the event popover (only when provided; no `activityId` requirement). Firing it calls back with the source event and closes the popover, taking no other action.
