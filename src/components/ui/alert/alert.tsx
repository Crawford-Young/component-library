import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva('relative w-full border-l-[3px] rounded-r-lg p-4', {
  variants: {
    variant: {
      default: 'bg-surface border-border text-foreground',
      success: 'bg-success/10 border-success text-success',
      warning: 'bg-warning/10 border-warning text-warning',
      destructive: 'bg-destructive/10 border-destructive text-destructive',
      info: 'bg-info/10 border-info text-info',
    },
  },
  defaultVariants: { variant: 'default' },
})

export type AlertProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
  ),
)
Alert.displayName = 'Alert'

export const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 text-sm font-semibold leading-none tracking-tight', className)}
    {...props}
  >
    {children}
  </h5>
))
AlertTitle.displayName = 'AlertTitle'

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
))
AlertDescription.displayName = 'AlertDescription'
