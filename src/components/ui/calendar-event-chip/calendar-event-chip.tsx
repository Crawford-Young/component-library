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
  readonly location?: string
}

export const eventColorVariants = cva('overflow-hidden rounded px-1 text-[10px] font-medium', {
  variants: {
    color: {
      default: 'bg-accent text-white',
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
  readonly expanded?: boolean
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

function ClockIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-3 w-3 shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function MapPinIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-3 w-3 shrink-0"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function NoteIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-3 w-3 shrink-0"
    >
      <line x1="21" y1="10" x2="7" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="21" y1="18" x2="7" y2="18" />
    </svg>
  )
}

export function CalendarEventChip({
  event,
  style,
  expanded = false,
  onClick,
  onEdit,
  onDelete,
  renderPopover,
  className,
}: CalendarEventChipProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false)

  const heightPct = typeof style.height === 'string' ? parseFloat(style.height) : NaN
  const showTimeRange = expanded
  const showStartTime = !expanded && !isNaN(heightPct) && heightPct > 4
  const showLocation =
    (expanded && event.location !== undefined) ||
    (!expanded && !isNaN(heightPct) && heightPct > 10 && event.location !== undefined)
  const showDescription = expanded && event.description !== undefined

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
          <div className="truncate font-semibold">{event.title}</div>
          {showTimeRange && <div className="text-[9px] opacity-90">{timeRange}</div>}
          {showStartTime && (
            <div className="text-[9px] opacity-80">
              {displayHour}:{displayMin}
            </div>
          )}
          {showLocation && <div className="truncate text-[9px] opacity-80">{event.location}</div>}
          {showDescription && (
            <div className="line-clamp-2 text-[9px] opacity-70">{event.description}</div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0">
        <div className="border-b border-border px-3 pb-2 pt-3">
          <p className="text-sm font-semibold text-foreground">{event.title}</p>
        </div>
        <div className="space-y-2 px-3 py-2">
          <div className="flex items-start gap-2 text-muted-foreground">
            <ClockIcon />
            <p className="text-xs">{timeRange}</p>
          </div>
          {event.location !== undefined && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPinIcon />
              <p className="text-xs">{event.location}</p>
            </div>
          )}
          {event.description !== undefined && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <NoteIcon />
              <p className="text-xs">{event.description}</p>
            </div>
          )}
        </div>
        {renderPopover?.(event)}
        {(onEdit !== undefined || onDelete !== undefined) && (
          <div className="flex gap-2 border-t border-border px-3 py-2">
            {onEdit !== undefined && (
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
            {onDelete !== undefined && (
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
