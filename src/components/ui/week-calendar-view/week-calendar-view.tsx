import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export interface CalendarEvent {
  readonly id: string
  readonly title: string
  readonly start: string
  readonly end: string
  readonly allDay?: boolean
  readonly color?: CalendarEventColor
}

export type CalendarEventColor =
  | 'default'
  | 'blue'
  | 'violet'
  | 'green'
  | 'red'
  | 'amber'
  | 'pink'
  | 'cyan'

export interface WeekCalendarViewProps {
  readonly weekStart: string
  readonly events: CalendarEvent[]
  readonly hourStart?: number
  readonly hourCount?: number
  readonly hourHeight?: number
  readonly onEventClick?: (event: CalendarEvent) => void
  readonly renderEvent?: (event: CalendarEvent) => React.ReactNode
  readonly className?: string
}

const eventColorVariants = cva('overflow-hidden rounded px-1 text-[10px] font-medium', {
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

interface EventChipProps {
  readonly event: CalendarEvent
  readonly hourStart: number
  readonly hourCount: number
  readonly column: number
  readonly totalColumns: number
  readonly onEventClick?: (event: CalendarEvent) => void
  readonly renderEvent?: (event: CalendarEvent) => React.ReactNode
}

interface TimeIndicatorProps {
  readonly hourStart: number
  readonly hourCount: number
}

function TimeIndicator({ hourStart, hourCount }: TimeIndicatorProps): React.ReactElement | null {
  const [now, setNow] = React.useState(() => new Date())

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const top = ((now.getHours() - hourStart + now.getMinutes() / 60) / hourCount) * 100
  if (top < 0 || top > 100) return null

  return (
    <div
      data-testid="time-indicator"
      role="presentation"
      className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
      style={{ top: `${top}%` }}
    >
      <div className="h-2 w-2 rounded-full bg-primary" />
      <div className="h-px flex-1 bg-primary" />
    </div>
  )
}

function EventChip({
  event,
  hourStart,
  hourCount,
  column,
  totalColumns,
  onEventClick,
  renderEvent,
}: EventChipProps): React.ReactElement {
  const start = new Date(event.start)
  const end = new Date(event.end)
  const top = ((start.getHours() - hourStart + start.getMinutes() / 60) / hourCount) * 100
  const height = Math.max(
    ((end.getTime() - start.getTime()) / (hourCount * 3_600_000)) * 100,
    (0.5 / hourCount) * 100,
  )
  const left = (column / totalColumns) * 100
  const width = (1 / totalColumns) * 100

  const style: React.CSSProperties = {
    position: 'absolute',
    top: `${top}%`,
    height: `${height}%`,
    left: `calc(${left}% + 1px)`,
    width: `calc(${width}% - 2px)`,
  }

  if (renderEvent) {
    return (
      <div style={style} aria-label={event.title}>
        {renderEvent(event)}
      </div>
    )
  }

  if (onEventClick) {
    return (
      <div
        className={cn(eventColorVariants({ color: event.color }))}
        style={style}
        aria-label={event.title}
        role="button"
        tabIndex={0}
        onClick={() => onEventClick(event)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onEventClick(event)
        }}
      >
        {event.title}
      </div>
    )
  }

  return (
    <div
      className={cn(eventColorVariants({ color: event.color }))}
      style={style}
      aria-label={event.title}
    >
      {event.title}
    </div>
  )
}

interface AllDayRowProps {
  readonly days: Date[]
  readonly events: CalendarEvent[]
  readonly gridTemplateColumns: string
}

function AllDayRow({ days, events, gridTemplateColumns }: AllDayRowProps): React.ReactElement {
  return (
    <div className="grid border-b" style={{ gridTemplateColumns }}>
      <div className="border-r px-1 py-1 text-[10px] text-muted-foreground">All day</div>
      {days.map((day, i) => {
        const dayEvents = events.filter((e) => isSameDay(new Date(e.start), day))
        return (
          <div key={i} className="border-r px-0.5 py-0.5 last:border-r-0">
            {dayEvents.map((evt) => (
              <div
                key={evt.id}
                className={cn('mb-0.5 truncate', eventColorVariants({ color: evt.color }))}
                aria-label={evt.title}
              >
                {evt.title}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekDays(weekStart: string): Date[] {
  // Append time to force local-time parsing (date-only strings parse as UTC midnight)
  const start = new Date(`${weekStart}T00:00:00`)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatHour(hour: number): string {
  const h = hour % 12 || 12
  return `${h}${hour < 12 ? 'am' : 'pm'}`
}

export function WeekCalendarView({
  weekStart,
  events,
  hourStart = 8,
  hourCount = 14,
  hourHeight = 56,
  onEventClick,
  renderEvent,
  className,
}: WeekCalendarViewProps): React.JSX.Element {
  const days = React.useMemo(() => getWeekDays(weekStart), [weekStart])
  const today = React.useMemo(() => new Date(), [])
  const allDayEvents = React.useMemo(() => events.filter((e) => e.allDay), [events])
  const timedEvents = React.useMemo(() => events.filter((e) => !e.allDay), [events])

  const gridTemplateColumns = `3rem repeat(7, 1fr)`

  return (
    <div
      className={cn('overflow-auto rounded-md border bg-card text-card-foreground', className)}
      role="region"
      aria-label="Week calendar"
    >
      {/* Day headers */}
      <div className="grid border-b" style={{ gridTemplateColumns }}>
        <div className="border-r" aria-hidden />
        {days.map((day, i) => {
          const dayIsToday = isSameDay(day, today)
          return (
            <button
              key={i}
              type="button"
              className={cn(
                'border-r py-2 text-center text-xs font-medium last:border-r-0',
                dayIsToday && 'bg-primary/5',
              )}
              aria-label={`${DAY_LABELS[i]} ${day.getDate()}`}
            >
              <div aria-hidden>{DAY_LABELS[i]}</div>
              <div className="text-muted-foreground" aria-hidden>
                {day.getDate()}
              </div>
            </button>
          )
        })}
      </div>

      {/* All-day row */}
      {allDayEvents.length > 0 && (
        <AllDayRow days={days} events={allDayEvents} gridTemplateColumns={gridTemplateColumns} />
      )}

      {/* Hour grid */}
      <div className="relative grid" style={{ gridTemplateColumns }}>
        {/* Time labels */}
        <div className="flex flex-col">
          {Array.from({ length: hourCount }, (_, i) => (
            <div
              key={i}
              className="flex items-start justify-end border-b border-r pr-1 text-[10px] text-muted-foreground"
              style={{ height: hourHeight }}
              aria-hidden
            >
              {formatHour(hourStart + i)}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day, dayIdx) => {
          const dayIsToday = isSameDay(day, today)
          const dayTimedEvents = timedEvents.filter((e) => isSameDay(new Date(e.start), day))
          return (
            <div key={dayIdx} className="relative border-r last:border-r-0">
              {Array.from({ length: hourCount }, (_, i) => (
                <div key={i} className="border-b" style={{ height: hourHeight }} />
              ))}
              {dayIsToday && <TimeIndicator hourStart={hourStart} hourCount={hourCount} />}
              {dayTimedEvents.map((evt) => (
                <EventChip
                  key={evt.id}
                  event={evt}
                  hourStart={hourStart}
                  hourCount={hourCount}
                  column={0}
                  totalColumns={1}
                  onEventClick={onEventClick}
                  renderEvent={renderEvent}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
