import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cn } from '@/lib/utils'

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'group peer size-4 shrink-0 rounded-sm border border-input',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=checked]:text-accent-foreground',
      'data-[state=indeterminate]:bg-accent data-[state=indeterminate]:border-accent data-[state=indeterminate]:text-accent-foreground',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      {/* Checkmark — visible when checked */}
      <svg
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={cn(
          'size-3 hidden group-data-[state=checked]:block',
          '[stroke-dasharray:14] [stroke-dashoffset:14]',
          'animate-draw-check motion-reduce:animate-none',
        )}
      >
        <polyline points="1.5,6 4.5,9 10.5,3" />
      </svg>
      {/* Dash — visible when indeterminate */}
      <svg
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
        className={cn(
          'size-3 hidden group-data-[state=indeterminate]:block',
          '[stroke-dasharray:8] [stroke-dashoffset:8]',
          'animate-draw-check motion-reduce:animate-none',
        )}
      >
        <line x1="2" y1="6" x2="10" y2="6" />
      </svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName
