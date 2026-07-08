# @cy/ui

## 0.19.0

### Minor Changes

- 0b134f5: `CalendarEventChip`'s top-right adornment cluster is reworked into an absolutely-positioned sibling of the trigger button (never nested — an interactive control must never sit inside another interactive control): quick edit (pencil) and quick delete (x) reveal on hover/focus-within via `motion-safe:` opacity, the complete-toggle checkbox renders when `completable` + `onToggleComplete` are both set, and a new lock toggle renders whenever `onToggleLock` is wired (filled `Lock` when `locked`, `LockOpen` at reduced opacity when unlocked). The chip title is now flush left (the old fixed left indent is gone) with dynamic right padding that reserves space for whichever icons are idle-visible.

  `CalendarEvent` gains `locked?: boolean` and `CalendarEventChipProps`/`WeekCalendarView` gain `onToggleLock`. A locked event blocks `onMoveStart`/`onResizeStart` and hides the resize strips — the popover, quick edit/delete, and complete-toggle all keep working regardless of lock state.

  **Breaking, semantics-correcting:** all chip/popover time display, `buildIso`, and `toTimeSlot` now use LOCAL wall-clock semantics instead of the previous UTC-parts reading. `buildIso`/`toTimeSlot` (from `lib/time`) build/read the typed `HH:MM` against the LOCAL calendar day, not the ISO string's own written (UTC or offset) digits — consumers who relied on the old UTC-digit behavior will see different clock values for events whose stored instant carries a non-UTC offset. `WeekCalendarView`'s day-membership (recurrence fan-out, overnight-event splitting) now derives from parsed `Date` objects' local getters (`getFullYear`/`getMonth`/`getDate`), never from slicing the ISO string's own date substring — an event that only crosses midnight in UTC but not in the viewer's local timezone now correctly renders as a single chip instead of incorrectly splitting across days.

## 0.18.0

### Minor Changes

- 99b2792: Recurrence UI across the calendar and activity components: `WeekCalendarView`'s drag-to-create popover (`EventCreateForm`) gains a repeat-count `NumberInput` that appears once a non-None `Repeat` frequency is chosen, emitted as `recurrenceCount` on the create payload. `ActivityFormDialog`/`TaskTimeFields` gain a weekday toggle-group picker (`recurrenceDays`) that renders when recurrence is set to Weekly. `CalendarEvent` gains `seriesDays`, letting `CalendarEventChip`'s edit popover seed its Days picker from a wider recurring series (taking precedence over `recurrenceDays`) without `WeekCalendarView` fanning that chip's display across those days — saving still writes the picked days back under `recurrenceDays`.

## 0.17.0

### Minor Changes

- 5242d14: WeekCalendarView: `use24h` prop switches the gutter labels, current-time label, event chip times, and the drag-create popover to 24-hour format; new `dayWindows` prop (7 entries, Sun-first, fractional hours supported) drives per-day wake/sleep windows — windowed mode spans the union window with per-day off-hour shading, full-day mode shades per-day wrap zones, and drag-create is blocked outside each day's window. The current-time indicator is now client-only (fixes an SSR hydration mismatch on minute ticks) and renders as an opaque chip that no longer overlaps hour labels. `CalendarEventChip` gains the same `use24h` prop. `DayWindow` type exported. Playwright config honors `SB_PORT` for worktree e2e runs.

  ActivityFormDialog: rich-field parity (color, location, description, all-day), solo/group radio social section with visibility-gated joinability, compact viewport-fitting layout (pinned header/footer, scrollable body, 85vh cap). BREAKING for the exported types: `ActivityType` union drops `'habit'` (now `'task' | 'goal'`) and `ActivityFormValues` gains the rich fields — pre-1.0 minor per repo convention.

  WeekCalendarView: drag-create/move now only engages after the pointer crosses a slop threshold, so a stationary press (click) no longer misfires as a drag.

  CalendarEvent gains an optional `completed` field; `CalendarEventChip` gains an `onToggleComplete` prop that renders a "Mark complete" / "Mark incomplete" popover action and strikes through the title when completed. `WeekCalendarView` gains a matching `onEventToggleComplete` prop — toggling a recurrence instance toggles the original event. `SleepBand`'s `interactive` prop is removed: off-hour shading is now always `pointer-events-none`, so event chips inside sleep zones stay clickable while drag-create is still blocked by the existing slot-level window guard.

  CalendarEvent gains `streak` and `completable`: completable events render a one-click complete circle on the chip itself (sibling checkbox button — no nested-interactive), and streaks show as an inline flame+count on the chip's time line.

## 0.16.0

### Minor Changes

- 7a06685: Cohesion + signatures: `resolved`/`onResolveComplete` resolve gesture on `BorderTrace`/`TraceBorder` (the anti-spinner closes the loop), brand-eased `Skeleton` shimmer on a scale-derived period, new `SplitText` staggered char reveal, new `MagneticButton` hero CTA, `STAGGER.charMs` + `SHIMMER_PERIOD_MS` tokens, TraceBorder reduced-motion still-ring fix.

## 0.15.0

### Minor Changes

- 0a5a70b: Splash → app handoff: `startBrandHandoff` view-transition helper, `handoffName`/`exit` on `BrandSplash`, `handoffName` on `SidebarBrand`, tokenized view-transition CSS defaults. Browsers without the View Transitions API (and reduced-motion users) get the existing exit fade.

## 0.14.0

### Minor Changes

- 693e12c: Elevate the loading components onto the brand motion tokens: eased trace loop, appearance threshold (`appearDelayMs`, no sub-150ms flash), static full-ring reduced-motion state, and a deliberate `BrandSplash` entrance.

## 0.13.1

### Patch Changes

- 30170b4: Fix `Sidebar` crashing during SSR. The collapsed-state `useState` initializer
  read `localStorage` in the render phase, throwing `localStorage is not defined`
  when rendered on the server (and `SecurityError` in some privacy modes). The
  read is now wrapped in a `try/catch` that defaults to expanded, making
  `Sidebar` SSR-safe.

## 0.13.0

### Minor Changes

- 38e017b: Add `BorderTrace` + `TraceBorder` pending indicators and `BrandSplash` intro component. Deprecate `Spinner`.

## 0.12.1

### Patch Changes

- 0134c68: `TaskTimeFields` now accepts optional `repeatMin` (default `1`) and `repeatMax` (default unbounded) props, forwarded to the repeat-count input so consumers can constrain the recurrence count to their own range.

## 0.12.0

### Minor Changes

- 170cd90: Add the Activities Unification component set:
  - `StreakBadge` — inline streak indicator pill (icon + count), sized off `Badge`.
  - `TaskTimeFields` — shared scheduling field group (date, start/end time, recurrence, repeat count). Uses the scroll-spinner `TimeInput` for start/end and exposes a `use24h` prop to display times as 24-hour (`HH:MM`) instead of a 12-hour AM/PM toggle.
  - `ActivityCard` — presentational card for tasks, goals, and habits with balanced compact spacing.
  - `ActivityFormDialog` — type-morphing create/edit dialog for activities; forwards `use24h` to its time fields.

  Also:
  - `TimeInput` gains a `size` prop (`'sm' | 'md'`) so it can match form-field height; default stays `'sm'`.
  - New `lib/time` helpers (`buildIso`, `toTimeSlot`) for UTC time/slot conversion.

## 0.11.0

### Minor Changes

- f2f4f3a: Add core motion primitives: `ScrollReveal` (scroll choreography Layer 1), `StaggerReveal` (arrival Pattern 5), `ProgressLine` (cinematic progress, Pattern 2), `useReducedMotionSafe`, and pure motion variant builders. `Skeleton` gains a `variant` prop — shimmer is the new default, `pulse` remains as an escape hatch. Tailwind preset animation easings now use brand curves, and a `shimmer` keyframe is added. `framer-motion` (>=12) is now a peer dependency.

## 0.10.0

### Minor Changes

- 79b5c3e: Add TokenChip (balance display with normal/low/zero states) and TokenCost (inline AI cost estimate chip) for token-gated AI UIs.

## 0.9.0

### Minor Changes

- 42747f7: Add motion design tokens: CSS vars (`--motion-*`, `--ease-*`), MOTION/EASE/EASE_CSS/STAGGER/SPRING_MAGNETIC constants, and Tailwind preset duration/easing mappings.

## 0.8.0

### Minor Changes

- cd3f499: Add collapsible Sidebar and SidebarItem components with localStorage-persisted collapse state. Export AppShell, ChatPanel, EmptyState, HeroCard, PageHeader, and ChatFab from the library index.

## 0.7.0

### Minor Changes

- e1fe659: feat(calendar): drag rewrite — multi-day create, cross-day move, shift+duplicate, two-handle resize, time labels, escape cancel, sleep block, grab cursors, full create form, Today button position fix

## 0.6.0

### Minor Changes

- afb7dde: Add 15 wave 6 shell and gamification components: AppShell, Sidebar, SidebarItem, TopBar, ChatPanel, ChatFab, HeroCard, StatChip, PageHeader, FilterChip, EmptyState, XpBar, PointBadge, LeaderboardTable, ScoreHistory
- e3c320d: Add CalendarEventChip with Radix Popover (title, time range, description, edit/delete actions, custom renderPopover slot) and CalendarNavBar with week-navigation arrows and day/month/year dropdowns. WeekCalendarView now manages week state internally (defaultWeekStart replaces required weekStart) and renders both new components.

## 0.5.0

### Minor Changes

- 22fcbdf: Wave 5 — Transfers

  New components:
  - `CountUp` — animated number counter, viewport-triggered, respects prefers-reduced-motion
  - `BentoGrid` / `BentoCell` — responsive bento-style grid layout primitives with span variants
  - `Timeline` / `TimelineItem` — vertical timeline with dot connectors and generic slot API
  - `WeekCalendarView` — 7-day week calendar grid with hour-slot event positioning, configurable hour range

- c2d2a61: Wave 5 — Standard gap components

  New components:
  - `Kbd` — styled keyboard key display; single key via children, key combos via keys prop
  - `HoverCard` / `HoverCardTrigger` / `HoverCardContent` — Radix hover-triggered detail card with 300ms open delay
  - `NumberInput` — controlled number input with decrement/increment buttons, min/max/step, forwarded ref

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
