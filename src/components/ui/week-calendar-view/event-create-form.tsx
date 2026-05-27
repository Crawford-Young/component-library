import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  eventColorVariants,
  type CalendarEvent,
  type CalendarEventColor,
  type DayOfWeek,
  type RecurrenceFrequency,
} from '@/components/ui/calendar-event-chip'

const ALL_COLORS: readonly CalendarEventColor[] = [
  'default',
  'blue',
  'violet',
  'indigo',
  'teal',
  'cyan',
  'sky',
  'green',
  'lime',
  'amber',
  'orange',
  'red',
  'rose',
  'pink',
  'fuchsia',
]

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

const inputCls =
  'w-full rounded border border-input bg-background px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

const labelCls = 'mb-0.5 block text-[11px] font-medium text-muted-foreground'

function slotToTimeString(slot: number): string {
  const totalMins = slot * 15
  const h = String(Math.floor(totalMins / 60)).padStart(2, '0')
  const m = String(totalMins % 60).padStart(2, '0')
  return `${h}:${m}`
}

interface CreateDraft {
  title: string
  color: CalendarEventColor
  location: string
  description: string
  startTime: string
  endTime: string
  allDay: boolean
  recurrenceDays: readonly DayOfWeek[]
  recurrenceFrequency: RecurrenceFrequency | 'none'
}

export interface EventCreateFormProps {
  readonly startSlot: number
  readonly endSlot: number
  readonly date: string
  readonly dayCount: number
  readonly days: Date[]
  readonly startDayIdx: number
  readonly currentDayIdx: number
  readonly onSubmit: (draft: Omit<CalendarEvent, 'id'>) => void
  readonly onCancel: () => void
}

export function EventCreateForm({
  startSlot,
  endSlot,
  date,
  dayCount,
  days,
  startDayIdx,
  currentDayIdx,
  onSubmit,
  onCancel,
}: EventCreateFormProps): React.JSX.Element {
  const [draft, setDraft] = React.useState<CreateDraft>({
    title: '',
    color: 'default',
    location: '',
    description: '',
    startTime: slotToTimeString(startSlot),
    endTime: slotToTimeString(endSlot),
    allDay: false,
    recurrenceDays: [],
    recurrenceFrequency: 'none',
  })

  const minDayIdx = Math.min(startDayIdx, currentDayIdx)
  const maxDayIdx = Math.max(startDayIdx, currentDayIdx)
  const coveredDays = days.slice(minDayIdx, maxDayIdx + 1)

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    onSubmit({
      title: draft.title,
      start: `${date}T${draft.startTime}:00`,
      end: `${date}T${draft.endTime}:00`,
      allDay: draft.allDay || undefined,
      color: draft.color !== 'default' ? draft.color : undefined,
      location: draft.location !== '' ? draft.location : undefined,
      description: draft.description !== '' ? draft.description : undefined,
      recurrenceDays: draft.recurrenceDays.length > 0 ? draft.recurrenceDays : undefined,
      recurrenceFrequency:
        draft.recurrenceFrequency !== 'none' ? draft.recurrenceFrequency : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5 px-3 py-3">
      <div>
        <label htmlFor="create-event-title" className={labelCls}>
          Event title
        </label>
        <input
          id="create-event-title"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          className={inputCls}
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
        />
      </div>

      <div>
        <p className={labelCls} aria-hidden="true">
          Color
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5" role="group" aria-label="Color">
          {ALL_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color: ${c}`}
              aria-pressed={draft.color === c}
              onClick={() => setDraft((d) => ({ ...d, color: c }))}
              className={cn(
                eventColorVariants({ color: c }),
                'h-5 w-5 cursor-pointer overflow-visible rounded-full p-0',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                draft.color === c && 'ring-2 ring-ring ring-offset-1',
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="create-event-allday"
          type="checkbox"
          checked={draft.allDay}
          onChange={(e) => setDraft((d) => ({ ...d, allDay: e.target.checked }))}
          className="h-3.5 w-3.5"
        />
        <label htmlFor="create-event-allday" className={cn(labelCls, 'mb-0')}>
          All day
        </label>
      </div>

      {!draft.allDay && (
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="create-event-start" className={labelCls}>
              Start
            </label>
            <input
              id="create-event-start"
              type="time"
              className={inputCls}
              value={draft.startTime}
              onChange={(e) => setDraft((d) => ({ ...d, startTime: e.target.value }))}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="create-event-end" className={labelCls}>
              End
            </label>
            <input
              id="create-event-end"
              type="time"
              className={inputCls}
              value={draft.endTime}
              onChange={(e) => setDraft((d) => ({ ...d, endTime: e.target.value }))}
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="create-event-location" className={labelCls}>
          Location
        </label>
        <input
          id="create-event-location"
          className={inputCls}
          value={draft.location}
          onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
        />
      </div>

      <div>
        <label htmlFor="create-event-desc" className={labelCls}>
          Description
        </label>
        <textarea
          id="create-event-desc"
          rows={2}
          className={cn(inputCls, 'resize-none')}
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
        />
      </div>

      <div>
        <p className={labelCls} aria-hidden="true">
          Repeat
        </p>
        <select
          aria-label="Repeat"
          className={cn(inputCls, 'mt-1')}
          value={draft.recurrenceFrequency}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              recurrenceFrequency: e.target.value as RecurrenceFrequency | 'none',
            }))
          }
        >
          <option value="none">None</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div>
        <p className={labelCls} aria-hidden="true">
          Days
        </p>
        <div className="mt-1 flex gap-1" role="group" aria-label="Recurrence days">
          {(DAY_ABBR as readonly DayOfWeek[]).map((d) => {
            const active = draft.recurrenceDays.includes(d)
            return (
              <button
                key={d}
                type="button"
                aria-label={`Day: ${d}`}
                aria-pressed={active}
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    recurrenceDays: active
                      ? prev.recurrenceDays.filter((x) => x !== d)
                      : [...prev.recurrenceDays, d],
                  }))
                }
                className={cn(
                  'h-6 w-6 rounded-full text-[9px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
                )}
              >
                {d[0]}
              </button>
            )
          })}
        </div>
      </div>

      {dayCount > 1 && (
        <p className="text-[10px] text-muted-foreground">
          Creates {dayCount} events:{' '}
          {coveredDays.map((day) => `${DAY_ABBR[day.getDay()]} ${day.getDate()}`).join(', ')}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm">
          Create
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
