# @crawfordyoung/ui

Production-quality React component library built on [Radix UI](https://radix-ui.com) primitives with [Tailwind CSS](https://tailwindcss.com) and [CVA](https://cva.style). Dark-mode-first, fully accessible, 100% test coverage.

![npm version](https://img.shields.io/npm/v/@crawfordyoung/ui)
![license](https://img.shields.io/npm/l/@crawfordyoung/ui)

## Components

### Display

| Component      | Notes                                                                                                                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ActivityCard` | Presentational card for tasks / goals / habits — compact spacing, optional actions                                                                                                                         |
| `Avatar`       | `AvatarImage`, `AvatarFallback` — sm / md / lg                                                                                                                                                             |
| `Badge`        | default, secondary, destructive, outline                                                                                                                                                                   |
| `Card`         | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`                                                                                                                          |
| `Separator`    | Horizontal and vertical orientations                                                                                                                                                                       |
| `BorderTrace`  | Standalone pending indicator — CSS border-stroke trace, `size` xs/sm/md/lg, `shape` rect/circle, `appearDelayMs` (default 150, `0` disables); `resolved` + `onResolveComplete` play the completion gesture |
| `BrandSplash`  | App intro / first-paint animation — wordmark split + signal, optional quote, `onComplete`; `handoffName` + `exit="external"` for the splash → app morph                                                    |
| `Skeleton`     | Loading placeholder — `variant` prop: `shimmer` (default) or `pulse` escape hatch                                                                                                                          |
| `Spinner`      | **Deprecated** — use `BorderTrace` / `TraceBorder`. sm / md / lg, `role="status"` + `aria-label`                                                                                                           |
| `SplitText`    | Staggered per-character text reveal — brand cadence (`STAGGER.charMs`), `delayMs` offset, reduced-motion renders plain text                                                                                |
| `StreakBadge`  | Inline streak pill (flame icon + count), built on `Badge`                                                                                                                                                  |
| `TraceBorder`  | Wraps a control (e.g. `Button`) to trace its border while `active` — pending state for actions, `appearDelayMs` (default 150, `0` disables); `resolved` + `onResolveComplete` play the completion gesture  |

### Inputs

| Component        | Notes                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`         | 6 variants × 4 sizes, `asChild` via Radix Slot                                                                                                              |
| `Checkbox`       | Controlled and uncontrolled                                                                                                                                 |
| `DatePicker`     | Popover + react-day-picker v9                                                                                                                               |
| `Input`          | Forwarded ref, fully accessible                                                                                                                             |
| `MagneticButton` | `Button` with magnetic cursor pull (≤8px, `SPRING_MAGNETIC`) — hero CTAs on cinematic surfaces only; falls back to plain `Button` on touch / reduced motion |
| `RadioGroup`     | `RadioGroup`, `RadioGroupItem`                                                                                                                              |
| `Select`         | `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`                                                                                     |
| `Slider`         | Single value, forwarded ref                                                                                                                                 |
| `Switch`         | Controlled and uncontrolled                                                                                                                                 |
| `TaskTimeFields` | Date + start/end time + recurrence group; `use24h` toggles 12h/24h display                                                                                  |
| `TimeInput`      | Scroll-spinner time field — `size` (`sm` / `md`), `use24h` AM/PM toggle                                                                                     |
| `Textarea`       | Forwarded ref, resizable                                                                                                                                    |
| `Toggle`         | default / outline × sm / md / lg                                                                                                                            |
| `ToggleGroup`    | single / multiple                                                                                                                                           |

### Form

| Component   | Notes                                                            |
| ----------- | ---------------------------------------------------------------- |
| `FormField` | Compound: `FormField`, `FormLabel`, `FormControl`, `FormMessage` |
| `Label`     | Wraps `@radix-ui/react-label`                                    |

### Overlays

| Component            | Notes                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------- |
| `ActivityFormDialog` | Type-morphing create/edit dialog for tasks / goals / habits; forwards `use24h` to time fields |
| `AlertDialog`        | `AlertDialog`, `AlertDialogContent`, `AlertDialogAction`, `AlertDialogCancel`                 |
| `Dialog`             | `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription` |
| `Popover`            | `Popover`, `PopoverContent`, `PopoverTrigger`                                                 |
| `Sheet`              | `Sheet`, `SheetContent` — side: top / right / bottom / left                                   |
| `Toast`              | Sonner wrapper themed to design tokens                                                        |
| `Tooltip`            | `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger`                              |

### Navigation

| Component        | Notes                                                                      |
| ---------------- | -------------------------------------------------------------------------- |
| `Breadcrumb`     | `Breadcrumb`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbSeparator`    |
| `NavigationMenu` | Full Radix NavigationMenu with link/dropdown items                         |
| `Pagination`     | Semantic nav with `PaginationLink`, `PaginationPrevious`, `PaginationNext` |
| `Tabs`           | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`                           |

### Disclosure

| Component     | Notes                                                     |
| ------------- | --------------------------------------------------------- |
| `Accordion`   | single / multiple, animated                               |
| `Collapsible` | `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` |

### Menus

| Component      | Notes                                                                   |
| -------------- | ----------------------------------------------------------------------- |
| `Command`      | `Command`, `CommandInput`, `CommandList`, `CommandItem`, `CommandGroup` |
| `Combobox`     | Popover + Command pattern                                               |
| `ContextMenu`  | Full Radix ContextMenu                                                  |
| `DropdownMenu` | Full Radix DropdownMenu                                                 |

### Data

| Component | Notes                                                                     |
| --------- | ------------------------------------------------------------------------- |
| `Table`   | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` |

### Calendar

| Component           | Notes                                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `WeekCalendarView`  | Full week grid — recurring events, drag move/resize/create (slop threshold), undo, `use24h`, `dayWindows` per-day visible windows with sleep-zone shading, complete-toggle passthrough     |
| `CalendarEventChip` | Event chip — edit/delete popover, drag handles, `use24h` time display, inline streak count (`streak`), one-click complete circle (`completable` + `onToggleComplete`), `completed` styling |

### Layout

| Component      | Notes                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------- |
| `AspectRatio`  | Wraps `@radix-ui/react-aspect-ratio`                                                     |
| `ScrollArea`   | `ScrollArea`, `ScrollBar`                                                                |
| `Sidebar`      | Collapsible app sidebar shell — `header` slot, context-driven collapse                   |
| `SidebarBrand` | Logo + title header for `Sidebar`; `handoffName` receives the splash → app morph landing |

### Motion

| Component       | Notes                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------- |
| `ProgressLine`  | Cinematic progress bar (Loading Pattern 2) — CSS-transition driven, brand easing            |
| `ScrollReveal`  | Scroll choreography Layer 1 — IntersectionObserver + framer-motion, respects reduced-motion |
| `StaggerReveal` | Staggered arrival Pattern 5 — wraps children in sequenced entrance animations               |

### Feedback

| Component  | Notes                                                             |
| ---------- | ----------------------------------------------------------------- |
| `Alert`    | `Alert`, `AlertTitle`, `AlertDescription` — default / destructive |
| `Progress` | Animated progress bar                                             |

### AI / Tokens

| Component   | Notes                                          |
| ----------- | ---------------------------------------------- |
| `TokenChip` | Token balance chip with normal/low/zero states |
| `TokenCost` | Inline AI cost estimate chip                   |

## Installation

```bash
pnpm add @crawfordyoung/ui
```

Peer dependencies:

```bash
pnpm add react react-dom tailwindcss
```

Some components require additional peer deps:

| Component                                                      | Extra peer dep              |
| -------------------------------------------------------------- | --------------------------- |
| `DatePicker`                                                   | `react-day-picker date-fns` |
| `Toast`                                                        | `sonner`                    |
| `Command`, `Combobox`                                          | `cmdk`                      |
| `ScrollReveal`, `StaggerReveal`, `SplitText`, `MagneticButton` | `framer-motion`             |

## Setup

### 1. Import styles

In your root layout or global CSS entry point:

```ts
import '@crawfordyoung/ui/styles.css'
```

### 2. Add the Tailwind preset

```ts
// tailwind.config.ts
import { cyUIPreset } from '@crawfordyoung/ui/tailwind'
import type { Config } from 'tailwindcss'

export default {
  presets: [cyUIPreset],
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/@crawfordyoung/ui/src/**/*.{ts,tsx}', // required — Tailwind scans source at build time
  ],
} satisfies Config
```

### 3. Use components

```tsx
import {
  Button,
  Badge,
  Spinner,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@crawfordyoung/ui'

export default function Page() {
  return (
    <div>
      <Button variant="default" size="lg">
        Get started
      </Button>
      <Badge variant="secondary">Beta</Badge>
      <Spinner size="md" aria-label="Loading…" />
    </div>
  )
}
```

## Design tokens

All colors are CSS custom properties mapped to Tailwind utilities via the preset. Override them in your global CSS:

```css
:root {
  --accent: 16 185 129; /* your brand accent (R G B) */
  --background: 255 255 255;
}

.dark {
  --background: 9 9 11;
}
```

See [`src/styles/tokens.css`](src/styles/tokens.css) for the full token list.

## Motion tokens

Motion design tokens are exported as typed constants from `@crawfordyoung/ui` and mirrored as CSS vars in `styles.css`.

### JS / Framer Motion constants

```ts
import {
  MOTION,            // durations in ms: instant(100) fast(150) base(250) slow(400) hero(600)
  EASE,              // Framer Motion cubic-bezier arrays — spread required: ease: [...EASE.out]
  EASE_CSS,          // CSS cubic-bezier strings for raw style props
  STAGGER,           // stagger timing: wordMs(30) cardMs(40) charMs(28) capItems(5)
  SPRING_MAGNETIC,   // spring config: stiffness(300) damping(25)
  SHIMMER_PERIOD_MS, // Skeleton shimmer period (1500)
} from '@crawfordyoung/ui'

// Framer Motion example — spread EASE arrays because Framer rejects readonly tuples
<motion.div
  animate={{ opacity: 1 }}
  transition={{ duration: MOTION.base / 1000, ease: [...EASE.out] }}
/>
```

### Tailwind utilities (via `cyUIPreset`)

The Tailwind preset maps the CSS vars to utility classes:

| Utility class      | Token              | Value                                   |
| ------------------ | ------------------ | --------------------------------------- |
| `duration-instant` | `--motion-instant` | 100 ms                                  |
| `duration-fast`    | `--motion-fast`    | 150 ms                                  |
| `duration-base`    | `--motion-base`    | 250 ms                                  |
| `duration-slow`    | `--motion-slow`    | 400 ms                                  |
| `duration-hero`    | `--motion-hero`    | 600 ms                                  |
| `ease-out`         | `--ease-out`       | brand curve (shadows Tailwind built-in) |
| `ease-in-out`      | `--ease-in-out`    | brand curve (shadows Tailwind built-in) |
| `ease-exit`        | `--ease-exit`      | brand exit curve                        |

```tsx
<div className="transition-all duration-base ease-out">Animated element</div>
```

### Motion primitives

The motion primitives (`ScrollReveal`, `StaggerReveal`, `ProgressLine`) consume these tokens internally and require `framer-motion` as a peer dependency:

```bash
pnpm add framer-motion
```

The `useReducedMotionSafe` hook and pure motion variant builders are also exported from `@crawfordyoung/ui` for composing custom animations against the same token system.

## Splash → app handoff

`startBrandHandoff` morphs the `BrandSplash` wordmark into its landing slot (e.g. `SidebarBrand`) using the native View Transitions API. Browsers without the API — and reduced-motion users — fall back to an instant swap; the splash's own exit fade covers everything else.

The consumer contract:

1. Same `handoffName` on `BrandSplash` and `SidebarBrand`
2. `exit="external"` on the splash — `startBrandHandoff` owns the exit
3. Name the sidebar side ONLY once the splash is gone (same state update, inside `flushSync`) — two mounted elements sharing a `view-transition-name` make the browser skip the morph

```tsx
import { flushSync } from 'react-dom'
import { BrandSplash, SidebarBrand, startBrandHandoff } from '@crawfordyoung/ui'

const HANDOFF_NAME = 'brand-wordmark'

function App() {
  const [playing, setPlaying] = useState(true)

  const handleComplete = () => {
    // defer past BrandSplash's effect so flushSync is legal
    queueMicrotask(() => {
      void startBrandHandoff(() => {
        flushSync(() => setPlaying(false))
      })
    })
  }

  return (
    <>
      <SidebarBrand
        logo={<Logo />}
        title="Cybond"
        handoffName={playing ? undefined : HANDOFF_NAME}
      />
      {playing && (
        <BrandSplash
          wordmark="Cybond"
          splitIndex={2}
          handoffName={HANDOFF_NAME}
          exit="external"
          onComplete={handleComplete}
        />
      )}
    </>
  )
}
```

Transition timing defaults live in `styles.css` (`::view-transition-*` rules on the `--motion-hero` / `--ease-in-out` tokens) and apply in any browser that supports `view-transition-name`.

## Trace resolve gesture

`BorderTrace` and `TraceBorder` close the loop on success instead of vanishing mid-lap: set `resolved` when the pending work finishes, await `onResolveComplete`, then tear the trace down.

```tsx
const [state, setState] = useState<'idle' | 'pending' | 'resolved'>('idle')

<TraceBorder
  active={state !== 'idle'}
  resolved={state === 'resolved'}
  onResolveComplete={() => setState('idle')}
>
  <Button onClick={async () => {
    setState('pending')
    await save()
    setState('resolved') // trace completes the ring, settles, departs, then fires onResolveComplete
  }}>
    Save
  </Button>
</TraceBorder>
```

Reduced-motion users get a designed still-state equivalent (full ring, brief settle) instead of the animated gesture.

## Dark mode

All components are designed dark-mode-first. Wrap your app with a `ThemeProvider` (e.g. `next-themes`) and add `class="dark"` to `<html>`. The Tailwind preset uses `darkMode: 'class'`.

## Development

```bash
pnpm install          # install dependencies
just dev              # start Storybook at localhost:6006
just test             # run Vitest (100% coverage enforced)
just e2e              # run Playwright axe accessibility tests
just check            # full CI suite (lint + typecheck + test + e2e)
just build            # build ESM + CJS + .d.ts via tsup
just changeset        # create a new changeset before releasing
```

## Releases

Releases are managed with [Changesets](https://github.com/changesets/changesets).

1. Make your changes on a feature branch
2. Run `just changeset` and describe the change
3. Open a PR — CI must pass
4. On merge to `main`, the release workflow opens a **Version Packages** PR automatically
5. Merging that PR publishes to npm

## CI

GitHub Actions runs on every push to `main` and every PR:

- Lint (ESLint + Prettier)
- Typecheck (`tsc --noEmit`)
- Unit tests with 100% coverage (Vitest + v8)
- Storybook build
- Playwright axe accessibility E2E
- Security audit (`pnpm audit --audit-level=high`)

## License

MIT — Crawford Young
