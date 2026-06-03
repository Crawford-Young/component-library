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
  readonly label?: string
}

function formatSlotTime(slot: number): string {
  const totalMins = slot * 15
  const h = Math.floor(totalMins / 60) % 12 || 12
  const m = String(totalMins % 60).padStart(2, '0')
  return `${h}:${m}`
}

export function GhostEvent({
  startSlot,
  endSlot,
  hourStart,
  hourCount,
  color,
  label,
}: GhostEventProps): React.JSX.Element {
  const top = ((startSlot / 4 - hourStart) / hourCount) * 100
  const height = Math.max(((endSlot - startSlot) / 4 / hourCount) * 100, (0.25 / hourCount) * 100)
  const showTimeLabel = endSlot - startSlot >= 2
  return (
    <div
      data-testid="ghost-event"
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-x-0 rounded border-2 border-dashed opacity-60',
        eventColorVariants({ color }),
      )}
      style={{ top: `${top}%`, height: `${height}%` }}
    >
      {label !== undefined && (
        <span
          aria-hidden="true"
          className="pointer-events-none px-1 text-[9px] font-medium leading-tight opacity-80"
        >
          {label}
        </span>
      )}
      {label === undefined && showTimeLabel && (
        <span
          aria-hidden="true"
          className="pointer-events-none px-1 text-[9px] font-medium leading-tight opacity-80"
        >
          {formatSlotTime(startSlot)} – {formatSlotTime(endSlot)}
        </span>
      )}
    </div>
  )
}
