# @cy/ui

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
