import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export type BentoGridProps = React.HTMLAttributes<HTMLDivElement>

export const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}
      {...props}
    >
      {children}
    </div>
  ),
)
BentoGrid.displayName = 'BentoGrid'

const bentoCellVariants = cva('', {
  variants: {
    span: {
      default: '',
      wide: 'md:col-span-2',
      full: 'col-span-full',
    },
  },
  defaultVariants: { span: 'default' },
})

export interface BentoCellProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof bentoCellVariants> {}

export const BentoCell = React.forwardRef<HTMLDivElement, BentoCellProps>(
  ({ className, span, children, ...props }, ref) => (
    <div ref={ref} className={cn(bentoCellVariants({ span }), className)} {...props}>
      {children}
    </div>
  ),
)
BentoCell.displayName = 'BentoCell'
