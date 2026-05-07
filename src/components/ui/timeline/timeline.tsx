import * as React from 'react'
import { cn } from '@/lib/utils'

export type TimelineProps = React.HTMLAttributes<HTMLDivElement>

export const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col', className)} {...props}>
      {children}
    </div>
  ),
)
Timeline.displayName = 'Timeline'

export type TimelineItemProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
  title: React.ReactNode
  subtitle?: React.ReactNode
  meta?: React.ReactNode
  icon?: React.ReactNode
  isLast?: boolean
}

export const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ title, subtitle, meta, icon, isLast = false, children, className, ...props }, ref) => (
    <div ref={ref} className={cn('relative flex gap-6', className)} {...props}>
      <div className="flex flex-col items-center">
        {icon ?? (
          <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-accent ring-4 ring-background" />
        )}
        {!isLast && <div className="mt-2 min-h-[2rem] w-px flex-1 bg-border" />}
      </div>
      <div className={cn('flex-1', isLast ? 'pb-0' : 'pb-10')}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {title}
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {meta && <div className="shrink-0">{meta}</div>}
        </div>
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  ),
)
TimelineItem.displayName = 'TimelineItem'
