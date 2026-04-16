import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const progressVariants = cva('relative w-full overflow-hidden rounded-full bg-muted', {
  variants: {
    size: {
      sm: 'h-0.5',
      default: 'h-1',
      lg: 'h-2',
    },
  },
  defaultVariants: { size: 'default' },
})

export type ProgressProps = React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> &
  VariantProps<typeof progressVariants>

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, size, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(progressVariants({ size }), className)}
    value={value}
    {...props}
  >
    <ProgressPrimitive.Indicator
      data-radix-progress-indicator=""
      className={cn(
        'h-full w-full rounded-full bg-accent',
        value === undefined || value === null
          ? 'animate-progress-indeterminate motion-reduce:animate-none'
          : 'transition-all duration-500 ease-out',
      )}
      style={
        value !== undefined && value !== null
          ? { transform: `translateX(-${100 - value}%)` }
          : undefined
      }
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName
