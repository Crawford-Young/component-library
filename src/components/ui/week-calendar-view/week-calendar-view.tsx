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

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekDays(weekStart: string): Date[] {
  const start = new Date(weekStart)
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
  className,
}: WeekCalendarViewProps): React.JSX.Element {
  const days = React.useMemo(() => getWeekDays(weekStart), [weekStart])

  return (
    <div
      className={cn('overflow-auto rounded-md border bg-card text-card-foreground', className)}
      role="region"
      aria-label="Week calendar"
    >
      {/* Day headers */}
      <div
        className="grid border-b"
        style={{ gridTemplateColumns: '3rem repeat(7, 1fr)' }}
        aria-hidden
      >
        <div className="border-r" />
        {days.map((day, i) => (
          <div key={i} className="border-r py-2 text-center text-xs font-medium last:border-r-0">
            <div>{DAY_LABELS[i]}</div>
            <div className="text-muted-foreground">{day.getDate()}</div>
          </div>
        ))}
      </div>

      {/* Hour grid */}
      <div className="relative grid" style={{ gridTemplateColumns: '3rem repeat(7, 1fr)' }}>
        {/* Time labels */}
        <div className="flex flex-col">
          {Array.from({ length: hourCount }, (_, i) => (
            <div
              key={i}
              className="flex h-14 items-start justify-end border-b border-r pr-1 text-[10px] text-muted-foreground"
              aria-hidden
            >
              {formatHour(hourStart + i)}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day, dayIdx) => {
          const dayEvents = events.filter((e) => isSameDay(new Date(e.start), day))
          return (
            <div key={dayIdx} className="relative border-r last:border-r-0">
              {Array.from({ length: hourCount }, (_, i) => (
                <div key={i} className="h-14 border-b" />
              ))}
              {dayEvents.map((evt) => {
                const start = new Date(evt.start)
                const end = new Date(evt.end)
                const top =
                  ((start.getHours() - hourStart + start.getMinutes() / 60) / hourCount) * 100
                const height = Math.max(
                  ((end.getTime() - start.getTime()) / (hourCount * 3_600_000)) * 100,
                  2,
                )
                return (
                  <div
                    key={evt.id}
                    className={cn(
                      'absolute inset-x-0 mx-0.5',
                      eventColorVariants({ color: evt.color }),
                    )}
                    style={{ top: `${top}%`, height: `${height}%` }}
                    aria-label={evt.title}
                  >
                    {evt.title}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
