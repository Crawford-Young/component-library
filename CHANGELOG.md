# @cy/ui

## 0.4.0

### Minor Changes

- b075297: Wave 4 — DataTable, PaginationControl, ErrorBoundary

  **New components:**
  - `PaginationControl` — accessible pagination with first/prev/next/last navigation, page count summary, and keyboard support
  - `DataTable` — TanStack Table v8 wrapper with column sorting, optional pagination (fixed or configurable page size with a rows-per-page selector), and an empty state
  - `ErrorBoundary` — class component that catches render errors and renders a fallback; supports custom fallback nodes or render functions
  - `ErrorPage` — presentational 404/500 error page with optional custom title, description, and action slot

  **Improvements:**
  - `DatePicker` / `Calendar` — fixed nav button z-index so previous-month arrow is clickable; corrected `space-y-3` → `flex-col gap-3` on month container to prevent margin bleed onto absolutely-positioned buttons; fixed dropdown chevron alignment (`inline-flex items-center` on `caption_label`)
  - Foundation/Colors story — expanded to cover full token set (accent scale, item-hover, feedback colors) with paired fill/foreground chip layout

- a04295f: Add `--item-hover` semantic token for list/menu item hover backgrounds. Fix Dialog entry animation (fade+zoom, no directional slide). Add `CollapsibleIndicator` with rotating chevron. Fix `TooltipProvider` delay from 700ms to 300ms. Apply `--item-hover` to Select, DropdownMenu, ContextMenu, Command item hovers. Brand audit: token usage, radii, focus rings, typography. Reorganise Storybook into semantic subcategories. Fix Combobox story to track selected value.

## 0.3.0

### Minor Changes

- bcade2f: Add wave-3a components: AlertDialog, Sheet, DropdownMenu, ContextMenu, Tabs, Accordion, Collapsible
- 30dda4d: Add wave-3b components: NavigationMenu, ScrollArea, AspectRatio, Table, Breadcrumb, Pagination, Slider
- 78dda5a: Add wave-3c components: FormField, Toggle, ToggleGroup, Command, Combobox, Toast, DatePicker

## 0.2.0

### Minor Changes

- 6b5c87c: Add Wave 2 components: Dialog, Tooltip, Popover, Alert, Progress, Checkbox, RadioGroup, Switch, Select

## 0.2.0

### Minor Changes

- 87d4016: Wave 1: foundation component library

  First release of `@cy/ui`. Includes 10 production-ready components built on Radix UI primitives with Tailwind CSS and CVA:
  - **Avatar** — with AvatarImage and AvatarFallback, sm/md/lg sizes
  - **Badge** — 4 variants: default, secondary, destructive, outline
  - **Button** — 6 variants × 4 sizes, asChild support via Radix Slot
  - **Card** — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
  - **Input** — fully accessible, forwarded ref
  - **Label** — wraps @radix-ui/react-label
  - **Separator** — horizontal and vertical orientations
  - **Skeleton** — animate-pulse loading placeholder
  - **Spinner** — sm/md/lg sizes, role="status" with aria-label
  - **Textarea** — forwarded ref, resizable

  All components: 100% test coverage, axe-clean, dark-mode-first, Storybook stories included.
