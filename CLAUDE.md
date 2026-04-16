# CLAUDE.md — @crawfordyoung/ui Component Library

This file overrides specific rules from `~/code/CLAUDE.md` for this repository. All rules not overridden below remain in effect.

## Project Overview

`@crawfordyoung/ui` is a published npm package — a production-quality React component library. It is **not a Next.js app**. The build target is a reusable library consumed by other projects.

## Package identity

- **Package name**: `@crawfordyoung/ui`
- **Current version**: tracked by Changesets
- **npm scope**: `@crawfordyoung`

## Wave status

| Wave | Components                                                                        | Status         |
| ---- | --------------------------------------------------------------------------------- | -------------- |
| 1    | Avatar, Badge, Button, Card, Input, Label, Separator, Skeleton, Spinner, Textarea | Merged to main |
| 2    | Alert, Checkbox, Dialog, Popover, Progress, RadioGroup, Select, Switch, Tooltip   | In progress    |

Update this table whenever a wave PR is merged.

## Key differences from the root CLAUDE.md

- **Bundler**: tsup (not Next.js build) — outputs ESM + CJS + `.d.ts`
- **No app router, no server components, no server actions** — this is a pure component library
- **No database, auth, or backend concerns**
- **Storybook is the dev environment** — `just dev` starts Storybook, not a Next.js dev server
- **Releases via Changesets** — always run `just changeset` before opening a PR for a new component wave

## Component requirements (Definition of Done)

Every component must have, before merging:

- [ ] Implementation in `src/components/ui/<name>/<name>.tsx`
- [ ] Barrel export in `src/components/ui/<name>/index.ts`
- [ ] Re-exported from `src/index.ts`
- [ ] Vitest unit tests at 100% coverage in `src/components/ui/<name>/<name>.test.tsx`
- [ ] Storybook story in `stories/ui/<name>.stories.tsx`
- [ ] Axe-clean (covered by Playwright E2E in `tests/e2e/accessibility.spec.ts`)
- [ ] Dark-mode-first styling using design token utilities only (no hardcoded colors)
- [ ] Forwarded ref if it wraps a DOM element

## File structure

```
src/
  components/ui/<name>/
    <name>.tsx         # component implementation
    <name>.test.tsx    # Vitest unit tests
    index.ts           # barrel export
  lib/
    utils.ts           # cn() utility
    utils.test.ts
  styles/
    tokens.css         # CSS custom property design tokens
    base.css           # base resets
    index.css          # entry — imports tokens + base
  tailwind/
    preset.ts          # cyUIPreset — Tailwind config preset
    index.ts           # barrel export
  index.ts             # library entry — re-exports all components
stories/
  foundation/          # MDX docs (Colors, Typography)
  ui/                  # one .stories.tsx per component
tests/
  e2e/
    accessibility.spec.ts   # Playwright axe tests for all components
  mocks/
    handlers.ts
    server.ts
  setup.ts
```

## Justfile commands

```
just dev              # Storybook at localhost:6006
just test             # Vitest with 100% coverage
just e2e              # Playwright axe E2E (requires built Storybook)
just check            # lint + typecheck + test + e2e
just build            # tsup + css build script
just storybook-build  # build Storybook static output
just changeset        # create a new changeset
just version          # apply changesets (bump versions)
just publish          # publish to npm (CI handles this)
```

## Release workflow

1. Implement components on `feat/wave-N`
2. Run `just changeset` — choose `minor` for new components, `patch` for fixes
3. Open PR → CI must fully pass
4. On merge to `main`, the release workflow opens a **Version Packages** PR
5. Merging that PR publishes to npm automatically

## MD file update rule

After every completed task or merged wave, update:

- **This file** — wave status table, any new conventions
- **`README.md`** — component table, any new install/usage instructions
- **`~/code/docs/component-library/`** — planning docs if a plan was in use
