---
'@crawfordyoung/ui': minor
---

Form shell wave (slot-W2): apps own form interiors.

Added:

- `FormDialog` — composed form-dialog shell: title/description header, scrollable form body (children), Cancel/Save footer wired via `formId`; `footer` render-prop receives the exported `FormDialogFooterContext` ctx (`formId`, `isPending`, `close`); `isPending`, `submitDisabled`, `submitLabel`, `pendingLabel`, `size` props.
- `ColorSwatchPicker` — color swatch grid for `CalendarEventColor` with `aria-pressed` group semantics, `size` (`sm` / `md`); full palette exported as `EVENT_COLORS`. The calendar-event-chip inline edit form now reuses it.

BREAKING (0.x — ships as minor): `EventFormDialog`, `EventFormDialogProps`, `EventFormValues`, `ActivityTemplateDialog`, `ActivityTemplateDialogProps`, `ActivityTemplateValues`, and `ActivityScheduleSlot` are removed from the public export surface. Migration: compose the form interior app-side on `FormDialog` — the field building blocks (`TaskTimeFields`, `TimeInput`, `NumberInput`, `buildIso`, `toTimeSlot`, `eventColorVariants`, `CalendarEventColor`) remain exported.
