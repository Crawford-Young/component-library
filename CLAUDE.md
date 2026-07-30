# CLAUDE.md — @crawfordyoung/ui Component Library

**Domain:** web — inherits `~/code/CLAUDE.md` (universal) → `~/code/web/CLAUDE.md` (stack + Definition of Done).

This file overrides specific rules from `~/code/CLAUDE.md` for this repository. All rules not overridden below remain in effect.

## Project Overview

`@crawfordyoung/ui` is a published npm package — a production-quality React component library. It is **not a Next.js app**. The build target is a reusable library consumed by other projects.

## Package identity

- **Package name**: `@crawfordyoung/ui`
- **Current version**: tracked by Changesets
- **npm scope**: `@crawfordyoung`

## Wave status

| Wave     | Components                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Status                  |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| slot-W2  | Slot generalization W2: `FormDialog` composed shell (title/description header, scrollable form body, Cancel/Save footer via `formId`, `footer` render-prop with exported `FormDialogFooterContext` ctx) + `ColorSwatchPicker` primitive (`EVENT_COLORS`); calendar-event-chip inline edit reuses ColorSwatchPicker (BREAKING: `EventFormDialog`/`EventFormDialogProps`/`EventFormValues`/`ActivityTemplateDialog`/`ActivityTemplateDialogProps`/`ActivityTemplateValues`/`ActivityScheduleSlot` exports removed — apps own form interiors composed on FormDialog) | Merged to main (0.28.0) |
| cy-theme | CarsickYak theme preset: `src/styles/themes/carsickyak.css` scoped semantic-token override (`.theme-carsickyak` light / `.theme-carsickyak.dark`) exported as `./themes/carsickyak.css`; ember primary + pine secondary on neutral grounds; Foundation/CarsickYakTheme story + axe entries. Theme files: the dark block must redeclare every var the light block declares (base `.dark` ties light on specificity), and consuming apps put `theme-carsickyak` on `<html>` alongside next-themes' `dark`                                                           | Merged to main (0.29.0) |
| vis-W1   | `WeekCalendarView` chip affordances gate on their view-level handler (`onEventEdit`/`onEventDelete`/`onEventToggleComplete`/`onEventToggleLock`); shift+drag recurrence-select requires `onEventEdit`. A consumer wiring none of them now gets a genuinely read-only calendar instead of chips mutating local state with nowhere to send it                                                                                                                                                                                                                       | Merged to main (0.29.1) |

> Full wave history → [docs/WAVES.md](./docs/WAVES.md). Shipped versions are also in CHANGELOG.md and git.

Every repo-doc edit lands in the wave branch BEFORE merge — reflect runs pre-PR (after final task + user QA) and its proposals ship in the wave PR. The wave's own status row is written in the wave branch as the post-merge truth ("Merged to main (vX)") — it becomes true at merge; verify the version at publish (`npm view`) and correct in the next wave's branch if a concurrent wave stole the number. (Reordered 2026-07-16 — the old post-merge-flip convention forced micro docs PRs #96 et al.)

## Key differences from the root CLAUDE.md

- **Bundler**: tsup (not Next.js build) — outputs ESM + CJS + `.d.ts`
- **No app router, no server components, no server actions** — this is a pure component library
- **No database, auth, or backend concerns**
- **Storybook is the dev environment** — `just dev` starts Storybook, not a Next.js dev server
- **Releases via Changesets** — always run `just changeset` before opening a PR for a new component wave
- **Additional dependency**: `@tanstack/react-table` — used by DataTable; install with `pnpm add @tanstack/react-table`
- **Additional dependency**: `framer-motion` (>=12) — peer dep for motion primitives (ScrollReveal, StaggerReveal); install with `pnpm add framer-motion`

## Search indexing — `ui.crawfordyoung.dev` is noindex-by-HEADER (adsense-w1, 2026-07-28)

The deployed Storybook host must stay out of search results: it is a component gallery with no publisher content, and an AdSense review of the `crawfordyoung.dev` property should never reach it.

- **The exclusion is `vercel.json`'s `X-Robots-Tag: noindex, nofollow` on `/(.*)`. `public/robots.txt` deliberately says `Allow: /`.**
- **Do not "fix" that Allow into a `Disallow: /`.** The two are not additive — a Disallow destroys the header's precondition. Googlebot never fetches a disallowed URL, so it would never receive the noindex, and this host has been serving 200 long enough to plausibly be indexed already: disallowing would freeze whatever is in the index, permanently, because recrawl can never discover the noindex. The result reads as "definitely deindexed" and guarantees the opposite. `robots.txt` carries a comment block saying so; this entry is the second copy, because the file-local comment only helps someone already editing that file.
- If this host ever gains real content and should be indexed, drop the header block from `vercel.json` — `robots.txt` needs no change either way.

## Extension conventions (slot generalization, 2026-07-21)

Every component maps to one class; its extension mechanism is fixed by the class:

| Component class                                             | Extension mechanism                                                                                                                 |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Primitive** (button, input, badge, dialog parts…)         | `asChild` + `className` + full prop passthrough.                                                                                    |
| **Composed shell** (panels, cards, headers, app-shell)      | Named `ReactNode` slots (`header`, `actions`, `footer`) or compound parts. All `title`-class props are `ReactNode`, never `string`. |
| **Stateful interior** (calendar, forms, drag/optimistic UI) | Headless hook owns state; typed render-prop slots receive ctx; the lib ships presets composed from the same parts + ctx apps get.   |

**Hard rules:**

1. **No new domain-typed props on shells.** A prop encoding app domain (streak, locked, activityId) goes through a slot or app-side composition. This anti-pattern produced 6 calendar waves of typed-prop additions while the existing `renderEventPopover` slot sat unused.
2. **Slot ctx objects are versioned API.** Every ctx interface is exported and documented. Presets consume the exact same ctx as apps — if a preset can be built from the parts, the ctx is sufficient; if not, the ctx is wrong, not the preset.

> Gate and story-authoring gotchas → `cl-gates` skill (load before running gates or writing a story).

## Time semantics (calendar components)

- **Invariant (2026-07-07):** typed/displayed times (`TimeInput`, chip time labels, edit-popover Start/End) are always the viewer's LOCAL wall-clock. Stored `CalendarEvent.start`/`.end` ISO strings are real instants (`Date.toISOString()`), not a local-clock encoding — the same instant reads as a different clock time in a different viewer timezone, by design. Day membership (which grid day an event/chip belongs to, whether an event spans midnight) is always derived from a parsed `Date`'s local getters (`getFullYear`/`getMonth`/`getDate`/`getHours`), never from slicing the ISO string's own written digits (`.substring()`, `.slice()`) — that substring reflects whichever offset the string happens to carry (an explicit offset, or UTC for a bare `Z`), not the viewer's local calendar day, and is the root cause class of the wave-2.4L UTC-display bugs (`buildIso`/`toTimeSlot`, chip/popover time display, `WeekCalendarView` overnight-splitting all had this bug independently before the fix).
- **This retires any earlier "UTC parts intentional" assumption.** If you find code or a comment asserting that reading UTC digits off an ISO string is deliberate, it predates this invariant and is a bug, not a design choice — fix it to parse-then-read-local instead.
- `lib/time`'s `buildIso(date, time)` / `toTimeSlot(iso)` are the canonical local-wall-clock helpers: `buildIso` builds a real instant from an `HH:MM` local time on `date`'s local day; `toTimeSlot` extracts the local `HH:MM` back out of an instant. Prefer them over hand-rolled `Date` arithmetic in new calendar-adjacent code.

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

## Changeset rules

- Run `just changeset` before opening a PR for any wave with new components or behavior changes — choose `minor` for new components, `patch` for fixes.
- **The changeset CLI is interactive** — in non-interactive sessions, write `.changeset/<kebab-name>.md` directly (frontmatter: `'@crawfordyoung/ui': minor`).
- **Backtick-wrap `*` globs in changeset summaries** (e.g. `` `--motion-*` ``) — pre-commit Prettier rewrites bare `*...*` as `_..._` emphasis, silently corrupting the CHANGELOG text.
- **devDependency upgrades belong in a separate housekeeping PR** — not bundled into feature or coverage PRs. Mixing them can break the release workflow (the changesets action may create a malformed "Version Packages" PR).
- Test-only changes and internal refactors do not need a changeset.
- **Planned version numbers are provisional.** A checklist's "→ 0.X.0" is a plan-time guess — a concurrent wave merging first takes the number (2026-07-16: wave 16 took 0.22.0 mid-wave-3L; 3L shipped as 0.23.0). Changesets computes the real version at `chore: version packages` time. Before quoting a number in a PR body, release report, or consumer gate: `npm view @crawfordyoung/ui version` + check origin/main's `package.json`.
- **After resolving a merge/rebase conflict in a prettier-formatted MD file (this file's wave table especially), run `pnpm prettier --write <file>` BEFORE `git rebase --continue`** — hand-edited table rows won't match prettier's column widths and fail the lint gate a full gate-cycle later (2026-07-16: awk-inserted 3L row cost one `just check` rerun).

## MD file update rule

After every completed task or merged wave, update:

- **This file** — wave status table, any new conventions
- **`README.md`** — component table, any new install/usage instructions
- **`~/code/docs/component-library/`** — planning docs if a plan was in use
