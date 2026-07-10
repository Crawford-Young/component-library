import * as React from 'react'
import { type DayOfWeek } from '@/components/ui/calendar-event-chip'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import { TimeInput } from '@/components/ui/time-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────────────────────

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const

const WEEKLY_RECURRENCE = 'weekly'

const DAY_ABBR: readonly DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TaskTimeFieldsProps {
  readonly date: Date | undefined
  readonly onDateChange: (d: Date | undefined) => void
  readonly startTime: string
  readonly onStartTimeChange: (t: string) => void
  readonly endTime: string
  readonly onEndTimeChange: (t: string) => void
  readonly recurrence: string
  readonly onRecurrenceChange: (r: string) => void
  readonly recurrenceCount: number | undefined
  readonly onRecurrenceCountChange: (n: number | undefined) => void
  /** Days of week selected for weekly recurrence. Defaults to an empty selection. */
  readonly recurrenceDays?: readonly DayOfWeek[]
  readonly onRecurrenceDaysChange?: (days: readonly DayOfWeek[]) => void
  readonly showDate?: boolean
  readonly showRecurrence?: boolean
  /** Display times as 24-hour (HH:MM) instead of 12-hour with an AM/PM toggle. */
  readonly use24h?: boolean
  /** Minimum value for the repeat-count input. Defaults to `1`. */
  readonly repeatMin?: number
  /** Maximum value for the repeat-count input. Unbounded when omitted. */
  readonly repeatMax?: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TaskTimeFields({
  date,
  onDateChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  recurrence,
  onRecurrenceChange,
  recurrenceCount,
  onRecurrenceCountChange,
  recurrenceDays = [],
  onRecurrenceDaysChange,
  showDate = true,
  showRecurrence = true,
  use24h = false,
  repeatMin = 1,
  repeatMax,
}: TaskTimeFieldsProps): React.JSX.Element {
  const startTimeId = React.useId()
  const endTimeId = React.useId()
  const recurrenceId = React.useId()
  const repeatCountId = React.useId()
  const dateId = React.useId()

  const showRepeatCount = showRecurrence && recurrence !== 'none'
  const showWeekdayPicker = showRecurrence && recurrence === WEEKLY_RECURRENCE

  return (
    <div className="flex flex-col gap-4">
      {showDate && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={dateId}>Date</Label>
          <DatePicker value={date} onValueChange={onDateChange} placeholder="Pick a date" />
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={startTimeId}>Start time</Label>
          <TimeInput
            id={startTimeId}
            label="Start time"
            value={startTime}
            onChange={onStartTimeChange}
            use24h={use24h}
            size="md"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={endTimeId}>End time</Label>
          <TimeInput
            id={endTimeId}
            label="End time"
            value={endTime}
            onChange={onEndTimeChange}
            use24h={use24h}
            size="md"
          />
        </div>
      </div>

      {showRecurrence && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={recurrenceId}>Recurrence</Label>
          <Select value={recurrence} onValueChange={onRecurrenceChange}>
            <SelectTrigger id={recurrenceId} aria-label="Recurrence">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECURRENCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showWeekdayPicker && (
        <div className="flex flex-col gap-1.5">
          <Label aria-hidden="true">Days</Label>
          <div className="flex gap-1" role="group" aria-label="Recurrence days">
            {DAY_ABBR.map((d) => {
              const active = recurrenceDays.includes(d)
              return (
                <button
                  key={d}
                  type="button"
                  aria-label={`Day: ${d}`}
                  aria-pressed={active}
                  onClick={() =>
                    onRecurrenceDaysChange?.(
                      active ? recurrenceDays.filter((x) => x !== d) : [...recurrenceDays, d],
                    )
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
      )}

      {showRepeatCount && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={repeatCountId}>Repeat count</Label>
          <NumberInput
            id={repeatCountId}
            aria-label="Repeat count"
            allowEmpty
            placeholder="Forever"
            value={recurrenceCount}
            onChange={onRecurrenceCountChange}
            min={repeatMin}
            max={repeatMax}
          />
        </div>
      )}
    </div>
  )
}

TaskTimeFields.displayName = 'TaskTimeFields'
