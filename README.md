# @crawfordyoung/ui

Production-quality React component library built on [Radix UI](https://radix-ui.com) primitives with [Tailwind CSS](https://tailwindcss.com) and [CVA](https://cva.style). Dark-mode-first, fully accessible, 100% test coverage.

## Wave 1 — Components

| Component   | Variants / Notes                                                                  |
| ----------- | --------------------------------------------------------------------------------- |
| `Avatar`    | `AvatarImage`, `AvatarFallback` — sm / md / lg                                    |
| `Badge`     | default, secondary, destructive, outline                                          |
| `Button`    | 6 variants × 4 sizes, `asChild` via Radix Slot                                    |
| `Card`      | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| `Input`     | Forwarded ref, fully accessible                                                   |
| `Label`     | Wraps `@radix-ui/react-label`                                                     |
| `Separator` | Horizontal and vertical orientations                                              |
| `Skeleton`  | `animate-pulse` loading placeholder                                               |
| `Spinner`   | sm / md / lg, `role="status"` + `aria-label`                                      |
| `Textarea`  | Forwarded ref, resizable                                                          |

## Installation

```bash
pnpm add @crawfordyoung/ui
```

Peer dependencies:

```bash
pnpm add react react-dom tailwindcss
```

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
import { Button, Badge, Spinner } from '@crawfordyoung/ui'

export default function Page() {
  return (
    <div>
      <Button variant="default" size="lg">
        Get started
      </Button>
      <Button variant="outline" asChild>
        <a href="/docs">Read docs</a>
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
  --background: 255 255 255;
  --foreground: 15 15 15;
  /* … */
}

.dark {
  --background: 10 10 10;
  --foreground: 250 250 250;
  /* … */
}
```

See [`src/styles/tokens.css`](src/styles/tokens.css) for the full token list.

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

## License

MIT — Crawford Young
