import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { NumberInput } from '@/components/ui/number-input'
import { TimeInput } from '@/components/ui/time-input'
import { eventColorVariants, type CalendarEventColor } from '@/components/ui/calendar-event-chip'

// ─── Public types ─────────────────────────────────────────────────────────────

/** A single weekly scheduled session for an activity template. */
export interface ActivityScheduleSlot {
  /** Weekday index, Sunday-first (0 = Sunday … 6 = Saturday). */
  readonly day: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** Start offset in minutes since local midnight (wall-clock). */
  readonly startMinutes: number
  /** Session length in minutes. */
  readonly durationMin: number
}

/** The full set of values emitted when an activity template is saved. */
export interface ActivityTemplateValues {
  readonly title: string
  readonly color?: string | null
  readonly description?: string | null
  readonly defaultLocation?: string | null
  readonly minDurationMin: number
  readonly maxDurationMin: number
  readonly weeklyTargetSessions: number
  readonly schedule: readonly ActivityScheduleSlot[]
}

export interface ActivityTemplateDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: ActivityTemplateValues) => void
  readonly initialValues?: Partial<ActivityTemplateValues>
  readonly isPending?: boolean
  /** Display schedule start times as 24-hour instead of 12-hour with AM/PM. */
  readonly use24h?: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

type DayNumber = ActivityScheduleSlot['day']

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

const DAY_ABBR = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const
const DAY_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const
const WEEKDAYS: readonly DayNumber[] = [0, 1, 2, 3, 4, 5, 6]

const DEFAULT_COLOR: CalendarEventColor = 'default'
const DEFAULT_MIN_DURATION = 15
const DEFAULT_MAX_DURATION = 60
const DEFAULT_WEEKLY_TARGET = 1
const DEFAULT_SLOT_START_MINUTES = 9 * 60
const DEFAULT_SLOT_DURATION = 30
const MIN_WEEKLY_TARGET = 1
const MIN_DURATION_FLOOR = 1
const MINUTES_PER_HOUR = 60

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert minutes-since-midnight to a local `HH:MM` wall-clock string. */
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / MINUTES_PER_HOUR)
  const m = minutes % MINUTES_PER_HOUR
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Convert a local `HH:MM` wall-clock string to minutes-since-midnight. */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * MINUTES_PER_HOUR + m
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ActivityTemplateDialog({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
  isPending = false,
  use24h = false,
}: ActivityTemplateDialogProps): React.JSX.Element {
  const [title, setTitle] = React.useState(initialValues?.title ?? '')
  const [color, setColor] = React.useState<CalendarEventColor>(
    (initialValues?.color as CalendarEventColor | undefined) ?? DEFAULT_COLOR,
  )
  const [description, setDescription] = React.useState(initialValues?.description ?? '')
  const [defaultLocation, setDefaultLocation] = React.useState(initialValues?.defaultLocation ?? '')
  const [minDurationMin, setMinDurationMin] = React.useState(
    initialValues?.minDurationMin ?? DEFAULT_MIN_DURATION,
  )
  const [maxDurationMin, setMaxDurationMin] = React.useState(
    initialValues?.maxDurationMin ?? DEFAULT_MAX_DURATION,
  )
  const [weeklyTargetSessions, setWeeklyTargetSessions] = React.useState(
    initialValues?.weeklyTargetSessions ?? DEFAULT_WEEKLY_TARGET,
  )
  const [schedule, setSchedule] = React.useState<readonly ActivityScheduleSlot[]>(
    initialValues?.schedule ?? [],
  )
  const [showErrors, setShowErrors] = React.useState(false)

  const titleId = React.useId()
  const descriptionId = React.useId()
  const locationId = React.useId()
  const minId = React.useId()
  const maxId = React.useId()
  const weeklyId = React.useId()
  const formId = React.useId()

  // ── validation ────────────────────────────────────────────────────────────
  const titleError = title.trim() === '' ? 'Title is required.' : null
  const durationRangeError =
    minDurationMin > maxDurationMin
      ? 'Minimum duration must be less than or equal to maximum duration.'
      : null
  const weeklyTargetError =
    weeklyTargetSessions < MIN_WEEKLY_TARGET
      ? `Weekly target must be at least ${MIN_WEEKLY_TARGET}.`
      : null
  const slotDurationError = schedule.some(
    (s) => s.durationMin < minDurationMin || s.durationMin > maxDurationMin,
  )
    ? "Each scheduled session's duration must be within the min and max."
    : null
  const hasErrors =
    titleError !== null ||
    durationRangeError !== null ||
    weeklyTargetError !== null ||
    slotDurationError !== null

  // ── schedule mutation ─────────────────────────────────────────────────────
  function toggleDay(day: DayNumber): void {
    setSchedule((prev) => {
      if (prev.some((s) => s.day === day)) {
        return prev.filter((s) => s.day !== day)
      }
      const slot: ActivityScheduleSlot = {
        day,
        startMinutes: DEFAULT_SLOT_START_MINUTES,
        durationMin: DEFAULT_SLOT_DURATION,
      }
      return [...prev, slot].sort((a, b) => a.day - b.day)
    })
  }

  function updateSlot(day: DayNumber, patch: Partial<ActivityScheduleSlot>): void {
    setSchedule((prev) => prev.map((s) => (s.day === day ? { ...s, ...patch } : s)))
  }

  // ── submit ────────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    if (hasErrors) {
      setShowErrors(true)
      return
    }
    onSubmit({
      title: title.trim(),
      color: color === DEFAULT_COLOR ? null : color,
      description: description.trim() || null,
      defaultLocation: defaultLocation.trim() || null,
      minDurationMin,
      maxDurationMin,
      weeklyTargetSessions,
      schedule,
    })
  }

  const dialogTitle = initialValues ? 'Edit activity template' : 'New activity template'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Define a reusable activity with duration bounds and a weekly schedule.
          </DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          noValidate
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-4"
        >
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={titleId}>Title</Label>
            <Input
              id={titleId}
              aria-label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Activity title"
            />
            {showErrors && titleError !== null && (
              <p role="alert" className="text-xs text-destructive">
                {titleError}
              </p>
            )}
          </div>

          {/* Color */}
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium leading-none" aria-hidden="true">
              Color
            </p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Color">
              {ALL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Color: ${c}`}
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
                  className={cn(
                    eventColorVariants({ color: c }),
                    'h-6 w-6 cursor-pointer overflow-visible rounded-full p-0',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                    color === c && 'ring-2 ring-ring ring-offset-1',
                  )}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={descriptionId}>Description</Label>
            <Textarea
              id={descriptionId}
              aria-label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="min-h-16"
            />
          </div>

          {/* Default location */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={locationId}>Default location</Label>
            <Input
              id={locationId}
              aria-label="Default location"
              value={defaultLocation}
              onChange={(e) => setDefaultLocation(e.target.value)}
              placeholder="Location (optional)"
            />
          </div>

          {/* Duration bounds + weekly target */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={minId}>Min duration</Label>
              <NumberInput
                id={minId}
                aria-label="Min duration"
                value={minDurationMin}
                onChange={setMinDurationMin}
                min={MIN_DURATION_FLOOR}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={maxId}>Max duration</Label>
              <NumberInput
                id={maxId}
                aria-label="Max duration"
                value={maxDurationMin}
                onChange={setMaxDurationMin}
                min={MIN_DURATION_FLOOR}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={weeklyId}>Weekly target</Label>
              <NumberInput
                id={weeklyId}
                aria-label="Weekly target"
                value={weeklyTargetSessions}
                onChange={setWeeklyTargetSessions}
                min={MIN_WEEKLY_TARGET}
              />
            </div>
          </div>
          {showErrors && durationRangeError !== null && (
            <p role="alert" className="text-xs text-destructive">
              {durationRangeError}
            </p>
          )}
          {showErrors && weeklyTargetError !== null && (
            <p role="alert" className="text-xs text-destructive">
              {weeklyTargetError}
            </p>
          )}

          {/* Schedule builder */}
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <p className="text-sm font-medium leading-none" aria-hidden="true">
              Weekly schedule
            </p>
            <div className="flex gap-1.5" role="group" aria-label="Schedule days">
              {WEEKDAYS.map((day) => {
                const active = schedule.some((s) => s.day === day)
                return (
                  <button
                    key={day}
                    type="button"
                    aria-label={DAY_FULL[day]}
                    aria-pressed={active}
                    onClick={() => toggleDay(day)}
                    className={cn(
                      'h-8 w-8 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-input bg-background text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {DAY_ABBR[day]}
                  </button>
                )
              })}
            </div>

            {schedule.map((slot) => (
              <div
                key={slot.day}
                className="flex flex-wrap items-end gap-3 rounded border border-border px-3 py-2"
              >
                <span className="min-w-20 text-sm font-medium text-foreground">
                  {DAY_FULL[slot.day]}
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-muted-foreground" aria-hidden="true">
                    Start
                  </span>
                  <TimeInput
                    label={`${DAY_FULL[slot.day]} start`}
                    value={minutesToTime(slot.startMinutes)}
                    onChange={(v) => updateSlot(slot.day, { startMinutes: timeToMinutes(v) })}
                    use24h={use24h}
                    size="md"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-muted-foreground" aria-hidden="true">
                    Duration (min)
                  </span>
                  <NumberInput
                    aria-label={`${DAY_FULL[slot.day]} duration`}
                    value={slot.durationMin}
                    onChange={(n) => updateSlot(slot.day, { durationMin: n })}
                    min={MIN_DURATION_FLOOR}
                    className="w-32"
                  />
                </div>
              </div>
            ))}

            {showErrors && slotDurationError !== null && (
              <p role="alert" className="text-xs text-destructive">
                {slotDurationError}
              </p>
            )}
          </div>
        </form>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={isPending}>
            {isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

ActivityTemplateDialog.displayName = 'ActivityTemplateDialog'
