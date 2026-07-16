import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { eventColorVariants, type CalendarEventColor } from '@/components/ui/calendar-event-chip'
import { TimeInput } from '@/components/ui/time-input'

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

function nextDayISO(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`)
  d.setDate(d.getDate() + 1)
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

interface CreateDraft {
  title: string
  color: CalendarEventColor
  location: string
  description: string
  startTime: string
  endTime: string
  allDay: boolean
}

/**
 * Shape emitted to `onSubmit`. An explicit interface (no longer `Omit<CalendarEvent, 'id'>`):
 * recurring creation moved app-side, so the create surface no longer emits any recurrence
 * fields. Multi-day drag-create display fan-out is synthesized by `WeekCalendarView` from the
 * drawn slot span, not carried on this payload.
 */
export interface EventCreateSubmitPayload {
  readonly title: string
  readonly start: string
  readonly end: string
  readonly allDay?: boolean
  readonly color?: CalendarEventColor
  readonly location?: string
  readonly description?: string
}

export interface EventCreateFormProps {
  readonly startSlot: number
  readonly endSlot: number
  readonly date: string
  readonly dayCount: number
  readonly days: Date[]
  readonly startDayIdx: number
  readonly currentDayIdx: number
  readonly use24h?: boolean
  readonly onSubmit: (draft: EventCreateSubmitPayload) => void
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
  use24h = false,
  onSubmit,
  onCancel,
}: EventCreateFormProps): React.JSX.Element {
  const minDayIdx = Math.min(startDayIdx, currentDayIdx)
  const maxDayIdx = Math.max(startDayIdx, currentDayIdx)
  const coveredDays = days.slice(minDayIdx, maxDayIdx + 1)

  const [draft, setDraft] = React.useState<CreateDraft>({
    title: '',
    color: 'default',
    location: '',
    description: '',
    startTime: slotToTimeString(startSlot),
    endTime: slotToTimeString(endSlot),
    allDay: false,
  })

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    const isOvernight = !draft.allDay && draft.endTime < draft.startTime
    const endDate = isOvernight ? nextDayISO(date) : date
    const payload: EventCreateSubmitPayload = {
      title: draft.title,
      start: `${date}T${draft.startTime}:00`,
      end: `${endDate}T${draft.endTime}:00`,
      allDay: draft.allDay || undefined,
      color: draft.color !== 'default' ? draft.color : undefined,
      location: draft.location !== '' ? draft.location : undefined,
      description: draft.description !== '' ? draft.description : undefined,
    }
    onSubmit(payload)
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
          required
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
        <div className="flex flex-col gap-2">
          <div>
            <label htmlFor="create-event-start" className={labelCls}>
              Start
            </label>
            <TimeInput
              id="create-event-start"
              label="Start"
              value={draft.startTime}
              onChange={(v) => setDraft((d) => ({ ...d, startTime: v }))}
              use24h={use24h}
            />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <label htmlFor="create-event-end" className={labelCls}>
                End
              </label>
              {draft.endTime < draft.startTime && (
                <span className="text-[10px] text-muted-foreground">+1 day</span>
              )}
            </div>
            <TimeInput
              id="create-event-end"
              label="End"
              value={draft.endTime}
              onChange={(v) => setDraft((d) => ({ ...d, endTime: v }))}
              use24h={use24h}
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
