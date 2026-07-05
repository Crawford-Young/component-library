# CLAUDE.md — @crawfordyoung/ui Component Library

This file overrides specific rules from `~/code/CLAUDE.md` for this repository. All rules not overridden below remain in effect.

## Project Overview

`@crawfordyoung/ui` is a published npm package — a production-quality React component library. It is **not a Next.js app**. The build target is a reusable library consumed by other projects.

## Package identity

- **Package name**: `@crawfordyoung/ui`
- **Current version**: tracked by Changesets
- **npm scope**: `@crawfordyoung`

## Wave status

| Wave | Components                                                                                                                                                                                                                                                                                                                                            | Status                                        |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 1    | Avatar, Badge, Button, Card, Input, Label, Separator, Skeleton, Spinner, Textarea                                                                                                                                                                                                                                                                     | Merged to main                                |
| 2    | Alert, Checkbox, Dialog, Popover, Progress, RadioGroup, Select, Switch, Tooltip                                                                                                                                                                                                                                                                       | Merged to main                                |
| 3a   | AlertDialog, Sheet, DropdownMenu, ContextMenu, Tabs, Accordion, Collapsible                                                                                                                                                                                                                                                                           | Merged to main                                |
| 3b   | NavigationMenu, ScrollArea, AspectRatio, Table, Breadcrumb, Pagination, Slider                                                                                                                                                                                                                                                                        | Merged to main                                |
| 3c   | FormField, Toggle, ToggleGroup, Command, Combobox, Toast, DatePicker                                                                                                                                                                                                                                                                                  | Merged to main                                |
| 4    | DataTable, PaginationControl, ErrorBoundary + DatePicker polish, Foundation/Colors                                                                                                                                                                                                                                                                    | Merged to main                                |
| 5a   | CountUp, BentoGrid/BentoCell, Timeline/TimelineItem, WeekCalendarView                                                                                                                                                                                                                                                                                 | Merged to main                                |
| 5b   | Kbd, HoverCard, NumberInput                                                                                                                                                                                                                                                                                                                           | In PR #38                                     |
| 7    | WeekCalendarView evolution: recurrence system, expandRecurringEvents, undo, drag                                                                                                                                                                                                                                                                      | Merged to main                                |
| 8    | Motion tokens: CSS vars, MOTION/EASE/EASE_CSS/STAGGER/SPRING_MAGNETIC, preset maps                                                                                                                                                                                                                                                                    | In PR #51                                     |
| 9    | TokenChip, TokenCost                                                                                                                                                                                                                                                                                                                                  | Merged to main                                |
| 10   | Motion primitives: ScrollReveal, StaggerReveal, ProgressLine, Skeleton shimmer, Motion.mdx, framer-motion peer dep                                                                                                                                                                                                                                    | Merged to main                                |
| 11   | Activities Unification: StreakBadge, TaskTimeFields, ActivityCard, ActivityFormDialog, TimeInput size + `lib/time` helpers                                                                                                                                                                                                                            | In PR                                         |
| 12   | Loading indicators: BorderTrace, TraceBorder, BrandSplash; Spinner deprecated                                                                                                                                                                                                                                                                         | Merged to main                                |
| 13   | Precision foundation: motion-token adoption, eased trace, appearance threshold, reduced-motion still-ring, BrandSplash entrance                                                                                                                                                                                                                       | Merged to main                                |
| 14   | Splash → app handoff: startBrandHandoff, BrandSplash handoffName/exit, SidebarBrand handoffName, VT CSS defaults                                                                                                                                                                                                                                      | Merged to main                                |
| 15   | Cohesion + signatures: trace resolve vocabulary, eased shimmer, SplitText, MagneticButton, charMs/shimmer tokens                                                                                                                                                                                                                                      | Merged to main                                |
| 2.2L | Calendar time fixes: TimeGutterLabel SSR/occlusion fixes, WeekCalendarView `use24h` + `dayWindows`, drag-slop threshold fix, CalendarEvent `completed`/`completable`/`streak` + chip one-click complete circle + inline streak, SleepBand `interactive` prop removed; ActivityFormDialog rich-field parity (BREAKING: `ActivityType` drops `'habit'`) | On `feat/w2.2L-calendar-time` — In PR pending |

Update this table whenever a wave PR is merged. **Post-merge status flips** (the only repo-doc edit that can't land pre-merge): micro `docs/` branch + PR, bundled with any reflect-surfaced repo edits — everything else in this file still lands in the wave branch BEFORE merge.

## Key differences from the root CLAUDE.md

- **Bundler**: tsup (not Next.js build) — outputs ESM + CJS + `.d.ts`
- **No app router, no server components, no server actions** — this is a pure component library
- **No database, auth, or backend concerns**
- **Storybook is the dev environment** — `just dev` starts Storybook, not a Next.js dev server
- **Releases via Changesets** — always run `just changeset` before opening a PR for a new component wave
- **Additional dependency**: `@tanstack/react-table` — used by DataTable; install with `pnpm add @tanstack/react-table`
- **Additional dependency**: `framer-motion` (>=12) — peer dep for motion primitives (ScrollReveal, StaggerReveal); install with `pnpm add framer-motion`

## E2E / axe notes

- Playwright's `webServer` starts `pnpm storybook` (the **dev** server) on `http://localhost:6006` with `reuseExistingServer: !CI`. CI sets `CI=true` so it always boots fresh; locally it reuses whatever is already on 6006.
- **Stale-server trap (2026-06-17):** `reuseExistingServer` silently reuses a leftover storybook on 6006 — e.g. one left running by a Playwright-MCP visual session, or a `serve storybook-static` from a prior `just serve-storybook`. If that server can't serve `/index.json` (SPA static serve), **every** e2e fails with `Error fetching \`/index.json\``. Kill stray :6006 listeners (`netstat -ano | grep :6006`→`taskkill //PID <n> //F`) before `just e2e`.
- **Parallel axe flake (2026-06-17):** `Axe is already running. Use \`await axe.run()\`...`comes from the Storybook a11y addon's auto-run colliding with`AxeBuilder` under parallel workers — nondeterministic, lands on whichever stories race (seen on ScrollReveal/Timeline). It is **not** a real violation. Confirm real violations by re-running serially (`pnpm playwright test --workers=1`); CI `retries: 2` masks it on green runs.
- **axe story-id selection (2026-06-17):** the entry's story id must render **visible** content — a default story that renders `null` (e.g. StreakBadge `Hidden` at streak 0) times out `waitForSelector('#storybook-root:not([hidden]) > *')`. Pick a non-empty variant (used `display-streakbadge--short`).
- `aria-hidden="true"` does **not** suppress axe `color-contrast` checks. axe 4.11+ evaluates visual elements regardless of aria semantics. Fix decorative text by raising its actual contrast, not by hiding it from the accessibility tree.
- **axe samples animated elements mid-transition and false-fails contrast (2026-07-01).** A fading-in element caught at ~0.6 opacity reports a _blended_ fg color (e.g. muted-foreground #a1a1aa over #09090b measured as #66666d = 3.49:1) even though its settled color passes. Fix: `playwright.config.ts` `use.contextOptions.reducedMotion: 'reduce'` **and** gate the component's fade with `motion-safe:transition-*` — the transition then no-ops in e2e and the element settles instantly. This Playwright version has no top-level `reducedMotion` key; it lives under `contextOptions`.
- **SVG components can pass every gate while rendering nothing (2026-07-01).** SVG geometry attributes (`<rect width/height>`, `<circle r>`, `x`/`cx`/…) silently reject CSS `calc()` — jsdom has no SVG layout and axe checks only a11y, so 100% coverage + axe + tsc are all green on an invisible trace. Use `%`/numeric geometry (`width="100%"`, `r="50%"` on an `overflow-visible` svg), assert in a unit test that geometry attrs aren't `calc()`, and always eyeball SVG components in Storybook. (TraceBorder trace was invisible on a wrapped button.)
- **Playwright roundtrip latency overshoots sub-second animation windows (2026-07-01).** Chained `waitForTimeout` calls accumulate 200–400ms of tool-roundtrip drift — screenshots land after a 600ms animation already finished. Verify animations by hooking the API before it fires (e.g. wrap `document.startViewTransition` to set a flag) and burst-capture from a single `t0 = Date.now()` anchor with delta waits, not sequential timeouts. (Splash-handoff spike QA.)
- **Playwright-MCP `run_code_unsafe` session gotchas (2026-07-02).** `page.addInitScript` accumulates across `run_code_unsafe` calls for the page's lifetime — a counter registered twice increments 2× per event, so assert counter DELTAS, never exact counts. The snippet sandbox has no `require` and no `setTimeout` at top level — sleep via `page.evaluate((until) => new Promise(...), t0 + delta)` on the browser clock (also eliminates cross-process clock drift). `waitForFunction` options go in the THIRD argument (`fn, arg, { timeout })` — passing `{ timeout }` second silently becomes the fn's arg and the default 30s applies. (Splash-handoff 2b QA.)
- **SVG animation probes must select the specific shape, not the first match (2026-07-02).** Trace components render TWO rects/circles — a static track (`stroke-border`, no animation) before the animated trace (`stroke-accent`, `motion-safe:animate-trace`). `querySelector('svg rect')` grabs the track and reports `animationName: "none"`, `dasharray: "none"` — a working loop looks broken. Probe with `querySelectorAll` + filter by class/stroke, or a class-qualified selector. (Wave-15 sweep false alarm.)

## Storybook authoring notes

- **MDX GFM tables (2026-06-12):** Storybook 8's essentials passthrough does **not** apply `mdxPluginOptions` — pipe tables render as raw `| ... |` text. Register `@storybook/addon-docs` directly in `.storybook/main.ts` with `mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } }`. The essentials boolean-filter passthrough was verified broken.
- **Scroll-triggered story demos need ≥100vh of scroll range (2026-06-12):** framer `whileInView` fires immediately if the target is already in the viewport. A `gap-[60vh]` spacer is shorter than the viewport → no visible reveal. Use `gap-[100vh]` so the element starts off-screen.

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
    motion.ts          # motion design token constants (MOTION, EASE, EASE_CSS, STAGGER, SPRING_MAGNETIC)
    motion.test.ts
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
just e2e              # Playwright axe E2E (runs against the dev server on :6006, not a built bundle)
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

> **Changeset is required before reflect.** Run `just changeset` before running `claude-md-management:reflect` at wave end — reflect is the last step, not changeset.

## Vitest coverage gotchas

These issues bite repeatedly — know them before writing tests:

- **`/* v8 ignore next */` fails inside nested arrow functions.** Pragmas don't suppress coverage when the ignored line is inside a callback, `useEffect`, or JSX handler. Fix: remove the dead guard (`!` assertion or delete unreachable branch) rather than relying on the pragma.
- **`fakeTimers.toFake` global config leaks into `vi.useFakeTimers()`.** If `vitest.config.ts` sets `fakeTimers: { toFake: ['Date'] }`, then calling `vi.useFakeTimers()` without arguments only fakes `Date` — `setInterval` and `setTimeout` remain real and won't advance. Always pass explicit config: `vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'] })`. Also call `vi.useRealTimers()` first to reset before re-entering fake mode.
- **`getBoundingClientRect()` always returns zeros in happy-dom.** Elements that rely on DOM geometry (column rects, grid positions) will never hit geometry-dependent branches naturally. Use a prototype-level mock: `vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function(this: Element) { return this === targetEl ? mockRect : zeroRect })`.
- **vitest v4 `--coverage` per-file table lists ONLY files below 100%.** An absent row means fully covered, not unmeasured — don't chase "missing" rows; read the global summary. (2026-07-01: several wasted greps hunting a border-trace row that was absent because it was at 100%.)
- **vitest never typechecks.** A test file can be committed with a latent `tsc` error that only surfaces at `just check` or pre-push. Run `pnpm tsc --noEmit` after writing any test that touches library types. Known case: Tailwind preset `theme.extend.animation` is `ResolvableTo<KeyValuePair>` (map-or-function union) — property access needs a `typeof x === 'function'` narrow first. (2026-07-01: preset.test.ts committed green in Task 1, failed the gate in Task 6.)

## Changeset rules

- Run `just changeset` before opening a PR for any wave with new components or behavior changes — choose `minor` for new components, `patch` for fixes.
- **The changeset CLI is interactive** — in non-interactive sessions, write `.changeset/<kebab-name>.md` directly (frontmatter: `'@crawfordyoung/ui': minor`).
- **Backtick-wrap `*` globs in changeset summaries** (e.g. `` `--motion-*` ``) — pre-commit Prettier rewrites bare `*...*` as `_..._` emphasis, silently corrupting the CHANGELOG text.
- **devDependency upgrades belong in a separate housekeeping PR** — not bundled into feature or coverage PRs. Mixing them can break the release workflow (the changesets action may create a malformed "Version Packages" PR).
- Test-only changes and internal refactors do not need a changeset.

## MD file update rule

After every completed task or merged wave, update:

- **This file** — wave status table, any new conventions
- **`README.md`** — component table, any new install/usage instructions
- **`~/code/docs/component-library/`** — planning docs if a plan was in use
