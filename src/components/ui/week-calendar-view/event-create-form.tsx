import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { eventColorVariants, type CalendarEventColor } from '@/components/ui/calendar-event-chip'
import { TimeInput } from '@/components/ui/time-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

/** Sentinel `Select` item value for the "No activity" default choice. Radix `Select.Item`
 * forbids an empty-string value (reserved to mean "clear the selection"), so a distinct
 * sentinel stands in for it; the submit payload still maps this to `activityId: null`. */
const NO_ACTIVITY_VALUE = '__none__'

/** Sentinel `Select` item value for the "New activity…" escape hatch. */
const NEW_ACTIVITY_VALUE = '__new__'

const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24

/**
 * Adds `minutes` to a local `HH:MM` wall-clock time string, wrapping past midnight.
 * Pure string/number arithmetic — no `Date`/ISO parsing, so there is no UTC-offset
 * conversion to get wrong (per the repo's local-wall-clock invariant).
 */
function addMinutesToTimeString(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const minutesPerDay = HOURS_PER_DAY * MINUTES_PER_HOUR
  const total = ((h * MINUTES_PER_HOUR + m + minutes) % minutesPerDay) + minutesPerDay
  const wrapped = total % minutesPerDay
  const hh = String(Math.floor(wrapped / MINUTES_PER_HOUR)).padStart(2, '0')
  const mm = String(wrapped % MINUTES_PER_HOUR).padStart(2, '0')
  return `${hh}:${mm}`
}

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
  /**
   * Present only when the create form rendered an activity picker
   * (`createActivityOptions` was provided): `null` for "No activity",
   * otherwise the selected `CreateActivityOption.id`.
   */
  readonly activityId?: string | null
}

/** One selectable activity in the create form's activity picker. */
export interface CreateActivityOption {
  readonly id: string
  readonly label: string
  readonly color?: CalendarEventColor
  readonly defaultDurationMin?: number
}

/**
 * Optional field seeding applied on top of activity-option seeding when the form is
 * opened via a controlled create request (reopen / duplicate). Each present key wins
 * over the value derived from the preselected activity option.
 */
export interface EventCreateDraftSeed {
  readonly title?: string
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
  /**
   * When provided, renders an activity picker at the top of the form:
   * "No activity" (default) · one item per option · "New activity…".
   * Selecting an option seeds `title`/`color` once per selection change;
   * user edits made after seeding are never overwritten by a re-render.
   */
  readonly createActivityOptions?: readonly CreateActivityOption[]
  /**
   * Fires when "New activity…" is selected, with the drawn slot's ISO
   * bounds. The caller is expected to close this popover in response.
   */
  readonly onCreateActivityRequest?: (slot: {
    readonly start: string
    readonly end: string
  }) => void
  /**
   * Preselects this activity in the picker on first mount (controlled reopen /
   * duplicate). `null`/absent leaves "No activity" selected. Title and color seed
   * from the matching `createActivityOptions` entry unless overridden by `initialDraft`.
   */
  readonly initialActivityId?: string | null
  /**
   * Seeds the form's editable fields on first mount. Each present key wins over the
   * value derived from the `initialActivityId` option.
   */
  readonly initialDraft?: EventCreateDraftSeed
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
  createActivityOptions,
  onCreateActivityRequest,
  initialActivityId,
  initialDraft,
  onSubmit,
  onCancel,
}: EventCreateFormProps): React.JSX.Element {
  const minDayIdx = Math.min(startDayIdx, currentDayIdx)
  const maxDayIdx = Math.max(startDayIdx, currentDayIdx)
  const coveredDays = days.slice(minDayIdx, maxDayIdx + 1)

  // Seed once from the controlled create request: activity-option values first,
  // then `initialDraft` overrides on top (spec precedence: option < draft).
  const [draft, setDraft] = React.useState<CreateDraft>(() => {
    const seedOption = createActivityOptions?.find((o) => o.id === initialActivityId)
    return {
      title: initialDraft?.title ?? seedOption?.label ?? '',
      color: initialDraft?.color ?? seedOption?.color ?? 'default',
      location: initialDraft?.location ?? '',
      description: initialDraft?.description ?? '',
      startTime: slotToTimeString(startSlot),
      endTime: slotToTimeString(endSlot),
      allDay: false,
    }
  })
  const [activitySelection, setActivitySelection] = React.useState<string>(
    initialActivityId != null ? initialActivityId : NO_ACTIVITY_VALUE,
  )

  const selectedActivity = createActivityOptions?.find((o) => o.id === activitySelection)
  const snapMinutes = selectedActivity?.defaultDurationMin

  function computeSlotIso(): { start: string; end: string } {
    const isOvernight = !draft.allDay && draft.endTime < draft.startTime
    const endDate = isOvernight ? nextDayISO(date) : date
    return {
      start: `${date}T${draft.startTime}:00`,
      end: `${endDate}T${draft.endTime}:00`,
    }
  }

  function handleActivitySelect(value: string): void {
    if (value === NEW_ACTIVITY_VALUE) {
      onCreateActivityRequest?.(computeSlotIso())
      return
    }
    setActivitySelection(value)
    const option = createActivityOptions?.find((o) => o.id === value)
    if (option !== undefined) {
      setDraft((d) => ({
        ...d,
        title: option.label,
        color: option.color ?? d.color,
      }))
    }
  }

  function handleSnapDuration(minutes: number): void {
    setDraft((d) => ({ ...d, endTime: addMinutesToTimeString(d.startTime, minutes) }))
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    const { start, end } = computeSlotIso()
    const payload: EventCreateSubmitPayload = {
      title: draft.title,
      start,
      end,
      allDay: draft.allDay || undefined,
      color: draft.color !== 'default' ? draft.color : undefined,
      location: draft.location !== '' ? draft.location : undefined,
      description: draft.description !== '' ? draft.description : undefined,
      ...(createActivityOptions !== undefined
        ? {
            activityId: activitySelection === NO_ACTIVITY_VALUE ? null : activitySelection,
          }
        : {}),
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5 px-3 py-3">
      {createActivityOptions !== undefined && (
        <div>
          <label htmlFor="create-event-activity" className={labelCls}>
            Activity
          </label>
          <Select value={activitySelection} onValueChange={handleActivitySelect}>
            <SelectTrigger id="create-event-activity" aria-label="Activity" className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_ACTIVITY_VALUE}>No activity</SelectItem>
              {createActivityOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
              <SelectItem value={NEW_ACTIVITY_VALUE}>New activity…</SelectItem>
            </SelectContent>
          </Select>
          {snapMinutes !== undefined && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-1.5 h-6 px-2 text-[11px]"
              onClick={() => handleSnapDuration(snapMinutes)}
            >
              Use {snapMinutes} min
            </Button>
          )}
        </div>
      )}

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
