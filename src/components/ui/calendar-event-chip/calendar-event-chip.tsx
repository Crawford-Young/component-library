import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export type CalendarEventColor =
  | 'default'
  | 'blue'
  | 'violet'
  | 'green'
  | 'red'
  | 'amber'
  | 'pink'
  | 'cyan'

export interface CalendarEvent {
  readonly id: string
  readonly title: string
  readonly start: string
  readonly end: string
  readonly allDay?: boolean
  readonly color?: CalendarEventColor
  readonly description?: string
}

export const eventColorVariants = cva('overflow-hidden rounded px-1 text-[10px] font-medium', {
  variants: {
    color: {
      default: 'bg-accent text-accent-foreground',
      blue: 'bg-blue-600 text-white',
      violet: 'bg-violet-600 text-white',
      green: 'bg-green-700 text-white',
      red: 'bg-red-600 text-white',
      amber: 'bg-amber-500 text-white',
      pink: 'bg-pink-600 text-white',
      cyan: 'bg-cyan-600 text-white',
    },
  },
  defaultVariants: { color: 'default' },
})

export interface CalendarEventChipProps {
  readonly event: CalendarEvent
  readonly style: React.CSSProperties
  readonly onClick?: (event: CalendarEvent) => void
  readonly onEdit?: (event: CalendarEvent) => void
  readonly onDelete?: (event: CalendarEvent) => void
  readonly renderPopover?: (event: CalendarEvent) => React.ReactNode
  readonly className?: string
}

function formatTimeRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const sH = s.getHours()
  const eH = e.getHours()
  const sPeriod = sH < 12 ? 'AM' : 'PM'
  const ePeriod = eH < 12 ? 'AM' : 'PM'
  const fmt = (d: Date): string => {
    const h = d.getHours() % 12 || 12
    const m = d.getMinutes().toString().padStart(2, '0')
    return `${h}:${m}`
  }
  if (sPeriod === ePeriod) {
    return `${fmt(s)}–${fmt(e)} ${sPeriod}`
  }
  return `${fmt(s)} ${sPeriod}–${fmt(e)} ${ePeriod}`
}

export function CalendarEventChip({
  event,
  style,
  onClick,
  onEdit,
  onDelete,
  renderPopover,
  className,
}: CalendarEventChipProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false)

  const heightPct = typeof style.height === 'string' ? parseFloat(style.height) : NaN
  const showStartTime = !isNaN(heightPct) && heightPct > 4

  const timeRange = formatTimeRange(event.start, event.end)
  const startDate = new Date(event.start)
  const displayHour = startDate.getHours() % 12 || 12
  const displayMin = startDate.getMinutes().toString().padStart(2, '0')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            eventColorVariants({ color: event.color }),
            className,
          )}
          style={style}
          aria-label={`${event.title} ${timeRange}`}
          onClick={() => onClick?.(event)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onClick?.(event)
          }}
        >
          <div className="truncate">{event.title}</div>
          {showStartTime && (
            <div className="text-[9px] opacity-80">
              {displayHour}:{displayMin}
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <p className="text-sm font-semibold">{event.title}</p>
        <p className="text-xs text-muted-foreground">{timeRange}</p>
        {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}
        {renderPopover?.(event)}
        {(onEdit ?? onDelete) && (
          <div className="mt-2 flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOpen(false)
                  onEdit(event)
                }}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setOpen(false)
                  onDelete(event)
                }}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
