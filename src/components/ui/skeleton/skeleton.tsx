import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/* Loading Pattern 1 (docs/brand/motion.md §5): shimmer is the brand default —
   opacity-only pulse is on the "Never" list; the pulse variant is a legacy escape hatch. */
const skeletonVariants = cva('rounded', {
  variants: {
    variant: {
      shimmer:
        'relative overflow-hidden bg-surface after:absolute after:inset-0 after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-accent-subtle/60 after:to-transparent motion-reduce:after:hidden',
      pulse: 'animate-pulse bg-muted motion-reduce:animate-none',
    },
  },
  defaultVariants: {
    variant: 'shimmer',
  },
})

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {}

export function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return <div className={cn(skeletonVariants({ variant }), className)} {...props} />
}
