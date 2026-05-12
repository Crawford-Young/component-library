import * as React from 'react'
import { cn } from '@/lib/utils'
import { buildOverlapLayout } from './overlap'
import {
  CalendarEventChip,
  eventColorVariants,
  type CalendarEvent,
} from '@/components/ui/calendar-event-chip'
import { CalendarNavBar } from '@/components/ui/calendar-nav-bar'

export type { CalendarEvent, CalendarEventColor } from '@/components/ui/calendar-event-chip'

export interface WeekCalendarViewProps {
  readonly defaultWeekStart?: string
  readonly events: readonly CalendarEvent[]
  readonly hourStart?: number
  readonly hourCount?: number
  readonly hourHeight?: number
  readonly onEventClick?: (event: CalendarEvent) => void
  readonly onEventEdit?: (event: CalendarEvent) => void
  readonly onEventDelete?: (event: CalendarEvent) => void
  readonly renderEventPopover?: (event: CalendarEvent) => React.ReactNode
  readonly renderEvent?: (event: CalendarEvent) => React.ReactNode
  readonly className?: string
}

function getMondayISO(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function getEventStyle(
  column: number,
  totalColumns: number,
  hourStart: number,
  hourCount: number,
  event: CalendarEvent,
): React.CSSProperties {
  const start = new Date(event.start)
  const end = new Date(event.end)
  const top = ((start.getHours() - hourStart + start.getMinutes() / 60) / hourCount) * 100
  const height = Math.max(
    ((end.getTime() - start.getTime()) / (hourCount * 3_600_000)) * 100,
    (0.5 / hourCount) * 100,
  )
  const left = (column / totalColumns) * 100
  const width = (1 / totalColumns) * 100
  return {
    position: 'absolute',
    top: `${top}%`,
    height: `${height}%`,
    left: `calc(${left}% + 1px)`,
    width: `calc(${width}% - 2px)`,
  }
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
  defaultWeekStart,
  events,
  hourStart = 8,
  hourCount = 14,
  hourHeight = 56,
  onEventClick,
  onEventEdit,
  onEventDelete,
  renderEventPopover,
  renderEvent,
  className,
}: WeekCalendarViewProps): React.JSX.Element {
  const [currentWeek, setCurrentWeek] = React.useState<string>(
    () => defaultWeekStart ?? getMondayISO(new Date()),
  )

  function handleDateChange(date: Date): void {
    setCurrentWeek(getMondayISO(date))
  }

  const days = React.useMemo(() => getWeekDays(currentWeek), [currentWeek])
  const [today, setToday] = React.useState(() => new Date())
  React.useEffect(() => {
    const msUntilMidnight = () => {
      const now = new Date()
      return (
        new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()
      )
    }
    const id = setTimeout(() => setToday(new Date()), msUntilMidnight())
    return () => clearTimeout(id)
  }, [today])

  const allDayEvents = React.useMemo(() => events.filter((e) => e.allDay), [events])
  const timedEvents = React.useMemo(() => events.filter((e) => !e.allDay), [events])
  const [expandedDayIndex, setExpandedDayIndex] = React.useState<number | null>(null)

  const gridTemplateColumns = React.useMemo(() => {
    const cols = Array.from({ length: 7 }, (_, i) => (i === expandedDayIndex ? '3fr' : '1fr')).join(
      ' ',
    )
    return `3rem ${cols}`
  }, [expandedDayIndex])

  return (
    <div
      className={cn(
        'flex flex-col overflow-auto rounded-md border bg-card text-card-foreground',
        className,
      )}
      role="region"
      aria-label="Week calendar"
    >
      <CalendarNavBar
        currentDate={new Date(`${currentWeek}T00:00:00`)}
        onDateChange={handleDateChange}
      />

      {/* Day headers */}
      <div className="grid border-b" style={{ gridTemplateColumns }}>
        <div className="border-r" aria-hidden />
        {days.map((day, i) => {
          const dayIsToday = isSameDay(day, today)
          const isExpanded = expandedDayIndex === i
          return (
            <button
              key={i}
              type="button"
              aria-pressed={isExpanded}
              className={cn(
                'border-r py-2 text-center text-xs font-medium last:border-r-0',
                dayIsToday && 'bg-item-hover',
                isExpanded && 'bg-primary/10 ring-1 ring-inset ring-primary/20',
              )}
              aria-label={`${DAY_LABELS[i]} ${day.getDate()}`}
              onClick={() => setExpandedDayIndex((prev) => (prev === i ? null : i))}
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

        {days.map((day, dayIdx) => {
          const dayIsToday = isSameDay(day, today)
          const dayTimedEvents = timedEvents.filter((e) => isSameDay(new Date(e.start), day))
          const positioned = buildOverlapLayout(dayTimedEvents)
          return (
            <div key={dayIdx} className="relative border-r last:border-r-0">
              {Array.from({ length: hourCount }, (_, i) => (
                <div key={i} className="border-b" style={{ height: hourHeight }} />
              ))}
              {dayIsToday && <TimeIndicator hourStart={hourStart} hourCount={hourCount} />}
              {positioned.map(({ event: evt, column, totalColumns }) => {
                const evtStyle = getEventStyle(column, totalColumns, hourStart, hourCount, evt)
                if (renderEvent) {
                  return (
                    <div key={evt.id} style={evtStyle} aria-label={evt.title}>
                      {renderEvent(evt)}
                    </div>
                  )
                }
                return (
                  <CalendarEventChip
                    key={evt.id}
                    event={evt}
                    style={evtStyle}
                    onClick={onEventClick}
                    onEdit={onEventEdit}
                    onDelete={onEventDelete}
                    renderPopover={renderEventPopover}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
