import * as React from 'react'
import { cn } from '@/lib/utils'
import { buildOverlapLayout } from './overlap'
import {
  CalendarEventChip,
  eventColorVariants,
  type CalendarEvent,
} from '@/components/ui/calendar-event-chip'
import { CalendarNavBar, type CalendarNavSource } from '@/components/ui/calendar-nav-bar'
import { useDragState } from './drag'
import { GhostEvent } from './ghost-event'
import { SleepBand } from './sleep-band'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { EventCreateForm } from './event-create-form'

export type {
  CalendarEvent,
  CalendarEventColor,
  DayOfWeek,
  RecurrenceFrequency,
} from '@/components/ui/calendar-event-chip'

export interface WeekCalendarViewProps {
  readonly defaultWeekStart?: string
  readonly events: readonly CalendarEvent[]
  readonly hourStart?: number
  readonly hourCount?: number
  readonly hourHeight?: number
  readonly onEventClick?: (event: CalendarEvent) => void
  readonly onEventEdit?: (event: CalendarEvent) => void
  readonly onEventDelete?: (event: CalendarEvent) => void
  readonly onEventCreate?: (event: Omit<CalendarEvent, 'id'>) => void
  readonly onEventMove?: (event: CalendarEvent) => void
  readonly onEventResize?: (event: CalendarEvent) => void
  readonly onEventRestore?: (event: CalendarEvent) => void
  readonly sleepEnabled?: boolean
  readonly sleepStart?: number
  readonly sleepEnd?: number
  readonly renderEventPopover?: (event: CalendarEvent) => React.ReactNode
  readonly className?: string
}

function getSundayISO(date: Date): string {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
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
  const dayStart = new Date(start)
  dayStart.setHours(hourStart, 0, 0, 0)
  const dayEnd = new Date(start)
  dayEnd.setHours(hourStart + hourCount, 0, 0, 0)
  const clampedStart = start < dayStart ? dayStart : start
  const clampedEnd = end > dayEnd ? dayEnd : end
  const totalMs = hourCount * MS_PER_HOUR
  const top = ((clampedStart.getTime() - dayStart.getTime()) / totalMs) * 100
  const minHeight = (0.5 / hourCount) * 100
  const rawHeight = ((clampedEnd.getTime() - clampedStart.getTime()) / totalMs) * 100
  const height = Math.max(rawHeight, minHeight)
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

interface TimeGutterLabelProps {
  readonly hourStart: number
  readonly hourCount: number
}

function TimeGutterLabel({
  hourStart,
  hourCount,
}: TimeGutterLabelProps): React.ReactElement | null {
  const [now, setNow] = React.useState(() => new Date())
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  const top = ((now.getHours() - hourStart + now.getMinutes() / 60) / hourCount) * 100
  if (top < 0 || top > 100) return null
  const h = now.getHours() % 12 || 12
  const m = String(now.getMinutes()).padStart(2, '0')
  const period = now.getHours() < 12 ? 'AM' : 'PM'
  return (
    <div
      data-testid="time-gutter-label"
      aria-hidden="true"
      className="pointer-events-none absolute right-1 z-10 text-[9px] font-medium text-primary"
      style={{ top: `${top}%`, transform: 'translateY(-50%)' }}
    >
      {h}:{m} {period}
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

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

function isRecurrenceInstance(id: string): boolean {
  return id.includes(':recur:')
}

function expandRecurringEvents(events: readonly CalendarEvent[], days: Date[]): CalendarEvent[] {
  const result: CalendarEvent[] = []
  for (const event of events) {
    result.push(event)
    if (!event.recurrenceDays || event.recurrenceDays.length === 0 || event.allDay) continue
    const originalDateStr = event.start.substring(0, 10)
    const timePart = event.start.substring(10)
    const endTimePart = event.end.substring(10)
    for (const day of days) {
      const dayAbbr = DAY_ABBR[day.getDay()]
      if (!event.recurrenceDays.includes(dayAbbr)) continue
      const dateStr = formatDateISO(day)
      if (dateStr === originalDateStr) continue
      result.push({
        ...event,
        id: `${event.id}:recur:${dateStr}`,
        start: `${dateStr}${timePart}`,
        end: `${dateStr}${endTimePart}`,
      })
    }
  }
  return result
}

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

const MS_PER_HOUR = 3_600_000
const SLOTS_PER_HOUR = 4
const SLOT_MINS = 15

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function timeToSlot(iso: string): number {
  const d = new Date(iso)
  return d.getHours() * SLOTS_PER_HOUR + Math.floor(d.getMinutes() / SLOT_MINS)
}

function slotToTime(slot: number, datePart: string): string {
  const h = Math.floor(slot / SLOTS_PER_HOUR)
  const m = (slot % SLOTS_PER_HOUR) * SLOT_MINS
  return `${datePart}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

interface PendingCreate {
  startDayIdx: number
  currentDayIdx: number
  date: string
  startSlot: number
  endSlot: number
}

function formatDateISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
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
  onEventCreate,
  onEventMove,
  onEventResize,
  onEventRestore,
  sleepEnabled,
  sleepStart,
  sleepEnd,
  renderEventPopover,
  className,
}: WeekCalendarViewProps): React.JSX.Element {
  const [currentWeek, setCurrentWeek] = React.useState<string>(() =>
    defaultWeekStart
      ? getSundayISO(new Date(`${defaultWeekStart}T00:00:00`))
      : getSundayISO(new Date()),
  )
  const [navDate, setNavDate] = React.useState<Date>(() =>
    defaultWeekStart ? new Date(`${defaultWeekStart}T00:00:00`) : new Date(),
  )

  function handleDateChange(date: Date, source?: CalendarNavSource): void {
    setNavDate(date)
    setCurrentWeek(getSundayISO(date))
    if (source === 'select') {
      setExpandedDayIndex(date.getDay())
    } else {
      setExpandedDayIndex(null)
    }
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

  const [localEvents, setLocalEvents] = React.useState<readonly CalendarEvent[]>(() => events)

  const allDayEvents = React.useMemo(() => localEvents.filter((e) => e.allDay), [localEvents])
  const timedEvents = React.useMemo(
    () =>
      expandRecurringEvents(
        localEvents.filter((e) => !e.allDay),
        days,
      ),
    [localEvents, days],
  )
  const todayInWeek = React.useMemo(() => days.some((d) => isSameDay(d, today)), [days, today])
  const [expandedDayIndex, setExpandedDayIndex] = React.useState<number | null>(null)

  const gridTemplateColumns = React.useMemo(() => {
    const cols = Array.from({ length: 7 }, (_, i) => (i === expandedDayIndex ? '3fr' : '1fr')).join(
      ' ',
    )
    return `3rem ${cols}`
  }, [expandedDayIndex])

  const [dragMode, dragActions] = useDragState()
  const gridRef = React.useRef<HTMLDivElement>(null)
  const dayColRefs = React.useRef<Array<HTMLDivElement | null>>([])
  const [pendingCreate, setPendingCreate] = React.useState<PendingCreate | null>(null)

  function handleEventCreate(event: Omit<CalendarEvent, 'id'>): void {
    setLocalEvents((prev) => [...prev, { ...event, id: generateId() }])
    onEventCreate?.(event)
  }

  function handleEventEdit(event: CalendarEvent): void {
    setLocalEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)))
    onEventEdit?.(event)
  }

  const deletedHistoryRef = React.useRef<CalendarEvent[]>([])

  function handleEventDelete(event: CalendarEvent): void {
    deletedHistoryRef.current = [...deletedHistoryRef.current, event]
    setLocalEvents((prev) => prev.filter((e) => e.id !== event.id))
    onEventDelete?.(event)
  }

  function handleEventMove(event: CalendarEvent): void {
    setLocalEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)))
    onEventMove?.(event)
  }

  function handleEventResize(event: CalendarEvent): void {
    setLocalEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)))
    onEventResize?.(event)
  }

  React.useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        dragActions.reset()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        const history = deletedHistoryRef.current
        if (history.length > 0) {
          const last = history[history.length - 1]
          deletedHistoryRef.current = history.slice(0, -1)
          setLocalEvents((prev) => [...prev, last])
          onEventRestore?.(last)
          e.preventDefault()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dragActions, onEventRestore])

  const effectiveHourStart = sleepEnabled ? 0 : hourStart
  const effectiveHourCount = sleepEnabled ? 24 : hourCount

  function pointerToSlot(clientY: number): number {
    const rect = gridRef.current?.getBoundingClientRect()
    /* c8 ignore next */
    if (!rect) return effectiveHourStart * SLOTS_PER_HOUR
    const relY = clientY - rect.top
    const slotHeight = hourHeight / SLOTS_PER_HOUR
    const raw = Math.floor(relY / slotHeight) + effectiveHourStart * SLOTS_PER_HOUR
    return Math.max(
      effectiveHourStart * SLOTS_PER_HOUR,
      Math.min((effectiveHourStart + effectiveHourCount) * SLOTS_PER_HOUR - 1, raw),
    )
  }

  function getPointerDayIdx(clientX: number): number {
    for (let i = 0; i < dayColRefs.current.length; i++) {
      const rect = dayColRefs.current[i]?.getBoundingClientRect()
      /* c8 ignore next */
      if (rect && clientX >= rect.left && clientX < rect.right) return i
    }
    return 0
  }

  function handleGridPointerMove(e: React.PointerEvent): void {
    if (dragMode.type === 'idle') return
    const slot = pointerToSlot(e.clientY)
    const dayIdx = getPointerDayIdx(e.clientX)
    dragActions.updateSlot(dayIdx, slot)
  }

  function handleGridPointerUp(_e: React.PointerEvent): void {
    if (dragMode.type === 'creating') {
      const startSlot = Math.min(dragMode.startSlot, dragMode.currentSlot)
      const endSlot = Math.max(dragMode.startSlot, dragMode.currentSlot) + 1
      const minDayIdx = Math.min(dragMode.startDayIdx, dragMode.currentDayIdx)

      if (sleepEnabled && sleepStart !== undefined && sleepEnd !== undefined) {
        const startHour = Math.floor(startSlot / SLOTS_PER_HOUR)
        if (startHour < sleepEnd || startHour >= sleepStart) {
          dragActions.reset()
          return
        }
      }

      setPendingCreate({
        startDayIdx: Math.min(dragMode.startDayIdx, dragMode.currentDayIdx),
        currentDayIdx: Math.max(dragMode.startDayIdx, dragMode.currentDayIdx),
        date: formatDateISO(days[minDayIdx]),
        startSlot,
        endSlot,
      })
    } else if (dragMode.type === 'moving') {
      const slotStart = dragMode.currentSlot - dragMode.slotOffset
      const durationSlots = timeToSlot(dragMode.event.end) - timeToSlot(dragMode.event.start)
      const dateStr = formatDateISO(days[dragMode.dayIdx])
      handleEventMove({
        ...dragMode.event,
        start: slotToTime(slotStart, dateStr),
        end: slotToTime(slotStart + durationSlots, dateStr),
      })
    } else if (dragMode.type === 'resizing-end') {
      const dateStr = formatDateISO(days[dragMode.dayIdx])
      handleEventResize({ ...dragMode.event, end: slotToTime(dragMode.currentSlot + 1, dateStr) })
    } else if (dragMode.type === 'resizing-start') {
      const dateStr = formatDateISO(days[dragMode.dayIdx])
      handleEventResize({ ...dragMode.event, start: slotToTime(dragMode.currentSlot, dateStr) })
    } else if (dragMode.type === 'recurrence-select') {
      const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
      const minDay = Math.min(dragMode.startDayIdx, dragMode.currentDayIdx)
      const maxDay = Math.max(dragMode.startDayIdx, dragMode.currentDayIdx)
      const recurrenceDays = Array.from(
        { length: maxDay - minDay + 1 },
        (_, i) => DAY_ABBR[days[minDay + i].getDay()],
      )
      handleEventEdit({ ...dragMode.event, recurrenceDays })
    }
    dragActions.reset()
  }

  return (
    <div
      className={cn(
        'flex flex-col overflow-auto rounded-md border bg-card text-card-foreground',
        className,
      )}
      role="region"
      aria-label="Week calendar"
    >
      <CalendarNavBar currentDate={navDate} onDateChange={handleDateChange} />

      {/* Day headers */}
      <div className="grid border-b" style={{ gridTemplateColumns }}>
        <div className="border-r" aria-hidden />
        {days.map((day, i) => {
          const dayIsToday = isSameDay(day, today)
          const isExpanded = expandedDayIndex === i
          const isRecurrenceTarget =
            dragMode.type === 'recurrence-select' &&
            i >= Math.min(dragMode.startDayIdx, dragMode.currentDayIdx) &&
            i <= Math.max(dragMode.startDayIdx, dragMode.currentDayIdx)
          return (
            <button
              key={i}
              type="button"
              aria-pressed={isExpanded}
              className={cn(
                'border-r py-2 text-center text-xs font-medium last:border-r-0',
                dayIsToday && 'bg-item-hover',
                isExpanded && 'bg-primary/10 ring-1 ring-inset ring-primary/20',
                isRecurrenceTarget && 'bg-primary/10 ring-1 ring-inset ring-primary/30',
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
      <div
        ref={gridRef}
        className={cn('relative grid', dragMode.type !== 'idle' && 'select-none cursor-grabbing')}
        style={{ gridTemplateColumns }}
        onPointerMove={handleGridPointerMove}
        onPointerUp={handleGridPointerUp}
      >
        <div className="relative flex flex-col">
          {todayInWeek && (
            <TimeGutterLabel hourStart={effectiveHourStart} hourCount={effectiveHourCount} />
          )}
          {Array.from({ length: effectiveHourCount }, (_, i) => (
            <div
              key={i}
              className="flex items-start justify-end border-b border-r pr-1 text-[10px] text-muted-foreground"
              style={{ height: hourHeight }}
              aria-hidden
            >
              {formatHour(effectiveHourStart + i)}
            </div>
          ))}
        </div>

        {days.map((day, dayIdx) => {
          const dayIsToday = isSameDay(day, today)
          const dayTimedEvents = timedEvents.filter((e) => isSameDay(new Date(e.start), day))
          const positioned = buildOverlapLayout(dayTimedEvents)
          return (
            <div
              key={dayIdx}
              ref={(el: HTMLDivElement | null) => {
                dayColRefs.current[dayIdx] = el
              }}
              className="relative border-r last:border-r-0"
            >
              {Array.from({ length: effectiveHourCount }, (_, i) => (
                <div
                  key={i}
                  data-drag-cell="true"
                  className={cn(
                    'border-b',
                    onEventCreate !== undefined && dragMode.type === 'idle' && 'cursor-crosshair',
                  )}
                  style={{ height: hourHeight }}
                  onPointerDown={
                    onEventCreate
                      ? (e) => {
                          const slot =
                            (effectiveHourStart + i) * SLOTS_PER_HOUR +
                            Math.floor((e.nativeEvent.offsetY / hourHeight) * SLOTS_PER_HOUR)
                          dragActions.startCreate(dayIdx, slot)
                          e.currentTarget.setPointerCapture(e.pointerId)
                        }
                      : undefined
                  }
                />
              ))}
              {dayIsToday && (
                <TimeIndicator hourStart={effectiveHourStart} hourCount={effectiveHourCount} />
              )}
              {positioned.map(({ event: evt, column, totalColumns }) => {
                const evtStyle = getEventStyle(
                  column,
                  totalColumns,
                  effectiveHourStart,
                  effectiveHourCount,
                  evt,
                )
                const isRecur = isRecurrenceInstance(evt.id)
                return (
                  <CalendarEventChip
                    key={evt.id}
                    event={evt}
                    style={evtStyle}
                    expanded={dayIdx === expandedDayIndex}
                    onClick={onEventClick}
                    onEdit={isRecur ? undefined : handleEventEdit}
                    onDelete={isRecur ? undefined : handleEventDelete}
                    renderPopover={isRecur ? undefined : renderEventPopover}
                    onMoveStart={
                      isRecur
                        ? undefined
                        : (ev, clientY, _clientX, shiftKey) => {
                            if (shiftKey) {
                              dragActions.startRecurrenceSelect(ev, dayIdx)
                            } else if (onEventMove !== undefined) {
                              const slot = pointerToSlot(clientY)
                              const slotOffset = Math.max(0, slot - timeToSlot(ev.start))
                              dragActions.startMove(ev, dayIdx, slotOffset, slot)
                            }
                          }
                    }
                    onResizeStart={
                      isRecur || onEventResize === undefined
                        ? undefined
                        : (ev, edge) => {
                            if (edge === 'end') {
                              dragActions.startResizeEnd(ev, dayIdx, timeToSlot(ev.end) - 1)
                            } else {
                              dragActions.startResizeStart(ev, dayIdx, timeToSlot(ev.start))
                            }
                          }
                    }
                  />
                )
              })}
              {/* Ghost: create (spans multiple columns) */}
              {dragMode.type === 'creating' &&
                dayIdx >= Math.min(dragMode.startDayIdx, dragMode.currentDayIdx) &&
                dayIdx <= Math.max(dragMode.startDayIdx, dragMode.currentDayIdx) && (
                  <GhostEvent
                    startSlot={Math.min(dragMode.startSlot, dragMode.currentSlot)}
                    endSlot={Math.max(dragMode.startSlot, dragMode.currentSlot) + 1}
                    hourStart={effectiveHourStart}
                    hourCount={effectiveHourCount}
                  />
                )}
              {/* Ghost: move */}
              {dragMode.type === 'moving' && dragMode.dayIdx === dayIdx && (
                <GhostEvent
                  startSlot={dragMode.currentSlot - dragMode.slotOffset}
                  endSlot={
                    dragMode.currentSlot -
                    dragMode.slotOffset +
                    (timeToSlot(dragMode.event.end) - timeToSlot(dragMode.event.start))
                  }
                  hourStart={effectiveHourStart}
                  hourCount={effectiveHourCount}
                  color={dragMode.event.color}
                />
              )}
              {/* Ghost: resize end */}
              {dragMode.type === 'resizing-end' && dragMode.dayIdx === dayIdx && (
                <GhostEvent
                  startSlot={timeToSlot(dragMode.event.start)}
                  endSlot={dragMode.currentSlot + 1}
                  hourStart={effectiveHourStart}
                  hourCount={effectiveHourCount}
                  color={dragMode.event.color}
                />
              )}
              {/* Ghost: resize start */}
              {dragMode.type === 'resizing-start' && dragMode.dayIdx === dayIdx && (
                <GhostEvent
                  startSlot={dragMode.currentSlot}
                  endSlot={timeToSlot(dragMode.event.end)}
                  hourStart={effectiveHourStart}
                  hourCount={effectiveHourCount}
                  color={dragMode.event.color}
                />
              )}
              {/* Ghost: recurrence-select */}
              {dragMode.type === 'recurrence-select' &&
                dayIdx >= Math.min(dragMode.startDayIdx, dragMode.currentDayIdx) &&
                dayIdx <= Math.max(dragMode.startDayIdx, dragMode.currentDayIdx) && (
                  <GhostEvent
                    startSlot={timeToSlot(dragMode.event.start)}
                    endSlot={timeToSlot(dragMode.event.end)}
                    hourStart={effectiveHourStart}
                    hourCount={effectiveHourCount}
                    color={dragMode.event.color}
                    label="Recur"
                  />
                )}
              {sleepStart !== undefined && sleepEnd !== undefined && (
                <SleepBand
                  sleepStart={sleepStart}
                  sleepEnd={sleepEnd}
                  hourStart={effectiveHourStart}
                  hourCount={effectiveHourCount}
                  hourHeight={hourHeight}
                  interactive={!!sleepEnabled}
                />
              )}
              {pendingCreate?.startDayIdx === dayIdx && (
                <Popover
                  open
                  onOpenChange={(open) => {
                    if (!open) setPendingCreate(null)
                  }}
                >
                  <PopoverTrigger asChild>
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        top: `${((pendingCreate.startSlot / SLOTS_PER_HOUR - effectiveHourStart) / effectiveHourCount) * 100}%`,
                        height: 0,
                        left: 0,
                        right: 0,
                      }}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0" side="bottom">
                    <EventCreateForm
                      startSlot={pendingCreate.startSlot}
                      endSlot={pendingCreate.endSlot}
                      date={pendingCreate.date}
                      dayCount={pendingCreate.currentDayIdx - pendingCreate.startDayIdx + 1}
                      days={days}
                      startDayIdx={pendingCreate.startDayIdx}
                      currentDayIdx={pendingCreate.currentDayIdx}
                      onSubmit={(event) => {
                        const timePart = event.start.substring(10)
                        const endTimePart = event.end.substring(10)
                        for (
                          let i = pendingCreate.startDayIdx;
                          i <= pendingCreate.currentDayIdx;
                          i++
                        ) {
                          const dateStr = formatDateISO(days[i])
                          handleEventCreate({
                            ...event,
                            start: `${dateStr}${timePart}`,
                            end: `${dateStr}${endTimePart}`,
                          })
                        }
                        setPendingCreate(null)
                      }}
                      onCancel={() => setPendingCreate(null)}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
