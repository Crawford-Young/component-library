---
'@crawfordyoung/ui': patch
---

The create-popover activity picker's "New activity…" `SelectItem` now renders only when `onCreateActivityRequest` is provided, instead of unconditionally whenever `createActivityOptions` was passed. `WeekCalendarView` also fixes its view-level wiring so a missing `onCreateActivityRequest` prop passes `undefined` through to `EventCreateForm` rather than an always-defined wrapper that made the leaf-level gate inert. Apps relying on the entry appearing with no handler behind it (none known) will see it hidden.
