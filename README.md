# @crawfordyoung/ui

Production-quality React component library built on [Radix UI](https://radix-ui.com) primitives with [Tailwind CSS](https://tailwindcss.com) and [CVA](https://cva.style). Dark-mode-first, fully accessible, 100% test coverage.

![npm version](https://img.shields.io/npm/v/@crawfordyoung/ui)
![license](https://img.shields.io/npm/l/@crawfordyoung/ui)

## Components

### Display

| Component   | Notes                                                                             |
| ----------- | --------------------------------------------------------------------------------- |
| `Avatar`    | `AvatarImage`, `AvatarFallback` — sm / md / lg                                    |
| `Badge`     | default, secondary, destructive, outline                                          |
| `Card`      | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| `Separator` | Horizontal and vertical orientations                                              |
| `Skeleton`  | `animate-pulse` loading placeholder                                               |
| `Spinner`   | sm / md / lg, `role="status"` + `aria-label`                                      |

### Inputs

| Component     | Notes                                                                   |
| ------------- | ----------------------------------------------------------------------- |
| `Button`      | 6 variants × 4 sizes, `asChild` via Radix Slot                          |
| `Checkbox`    | Controlled and uncontrolled                                             |
| `DatePicker`  | Popover + react-day-picker v9                                           |
| `Input`       | Forwarded ref, fully accessible                                         |
| `RadioGroup`  | `RadioGroup`, `RadioGroupItem`                                          |
| `Select`      | `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` |
| `Slider`      | Single value, forwarded ref                                             |
| `Switch`      | Controlled and uncontrolled                                             |
| `Textarea`    | Forwarded ref, resizable                                                |
| `Toggle`      | default / outline × sm / md / lg                                        |
| `ToggleGroup` | single / multiple                                                       |

### Form

| Component   | Notes                                                            |
| ----------- | ---------------------------------------------------------------- |
| `FormField` | Compound: `FormField`, `FormLabel`, `FormControl`, `FormMessage` |
| `Label`     | Wraps `@radix-ui/react-label`                                    |

### Overlays

| Component     | Notes                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------- |
| `AlertDialog` | `AlertDialog`, `AlertDialogContent`, `AlertDialogAction`, `AlertDialogCancel`                 |
| `Dialog`      | `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription` |
| `Popover`     | `Popover`, `PopoverContent`, `PopoverTrigger`                                                 |
| `Sheet`       | `Sheet`, `SheetContent` — side: top / right / bottom / left                                   |
| `Toast`       | Sonner wrapper themed to design tokens                                                        |
| `Tooltip`     | `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger`                              |

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

### Layout

| Component     | Notes                                |
| ------------- | ------------------------------------ |
| `AspectRatio` | Wraps `@radix-ui/react-aspect-ratio` |
| `ScrollArea`  | `ScrollArea`, `ScrollBar`            |

### Feedback

| Component  | Notes                                                             |
| ---------- | ----------------------------------------------------------------- |
| `Alert`    | `Alert`, `AlertTitle`, `AlertDescription` — default / destructive |
| `Progress` | Animated progress bar                                             |

## Installation

```bash
pnpm add @crawfordyoung/ui
```

Peer dependencies:

```bash
pnpm add react react-dom tailwindcss
```

Some components require additional peer deps:

| Component             | Extra peer dep              |
| --------------------- | --------------------------- |
| `DatePicker`          | `react-day-picker date-fns` |
| `Toast`               | `sonner`                    |
| `Command`, `Combobox` | `cmdk`                      |

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
