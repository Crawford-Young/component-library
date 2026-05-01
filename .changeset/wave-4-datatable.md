---
'@crawfordyoung/ui': minor
---

Wave 4 — DataTable, PaginationControl, ErrorBoundary

**New components:**

- `PaginationControl` — accessible pagination with first/prev/next/last navigation, page count summary, and keyboard support
- `DataTable` — TanStack Table v8 wrapper with column sorting, optional pagination (fixed or configurable page size with a rows-per-page selector), and an empty state
- `ErrorBoundary` — class component that catches render errors and renders a fallback; supports custom fallback nodes or render functions
- `ErrorPage` — presentational 404/500 error page with optional custom title, description, and action slot

**Improvements:**

- `DatePicker` / `Calendar` — fixed nav button z-index so previous-month arrow is clickable; corrected `space-y-3` → `flex-col gap-3` on month container to prevent margin bleed onto absolutely-positioned buttons; fixed dropdown chevron alignment (`inline-flex items-center` on `caption_label`)
- Foundation/Colors story — expanded to cover full token set (accent scale, item-hover, feedback colors) with paired fill/foreground chip layout
