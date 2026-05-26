import * as React from 'react'
import { cn } from '@/lib/utils'
import { eventColorVariants, type CalendarEventColor } from '@/components/ui/calendar-event-chip'

export interface GhostEventProps {
  readonly startSlot: number
  readonly endSlot: number
  readonly hourStart: number
  readonly hourCount: number
  readonly hourHeight?: number
  readonly color?: CalendarEventColor
}

export function GhostEvent({
  startSlot,
  endSlot,
  hourStart,
  hourCount,
  color,
}: GhostEventProps): React.JSX.Element {
  const top = ((startSlot / 4 - hourStart) / hourCount) * 100
  const height = Math.max(((endSlot - startSlot) / 4 / hourCount) * 100, (0.25 / hourCount) * 100)
  return (
    <div
      data-testid="ghost-event"
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-x-0 rounded border-2 border-dashed opacity-60',
        eventColorVariants({ color }),
      )}
      style={{ top: `${top}%`, height: `${height}%` }}
    />
  )
}
