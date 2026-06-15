import * as React from 'react'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ─── Constants ────────────────────────────────────────────────────────────────

const SLOT_INTERVAL_MINUTES = 30
const MINUTES_PER_DAY = 24 * 60
const TOTAL_SLOTS = MINUTES_PER_DAY / SLOT_INTERVAL_MINUTES // 48

/** 48-slot array of 'HH:MM' strings covering 00:00–23:30 in 30-minute increments. */
const TIME_SLOTS: readonly string[] = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
  const totalMinutes = i * SLOT_INTERVAL_MINUTES
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
})

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const

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
  readonly recurrenceCount: number
  readonly onRecurrenceCountChange: (n: number) => void
  readonly showDate?: boolean
  readonly showRecurrence?: boolean
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
  showDate = true,
  showRecurrence = true,
}: TaskTimeFieldsProps): React.JSX.Element {
  const startTimeId = React.useId()
  const endTimeId = React.useId()
  const recurrenceId = React.useId()
  const repeatCountId = React.useId()
  const dateId = React.useId()

  const showRepeatCount = showRecurrence && recurrence !== 'none'

  return (
    <div className="flex flex-col gap-4">
      {showDate && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={dateId}>Date</Label>
          <DatePicker value={date} onValueChange={onDateChange} placeholder="Pick a date" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={startTimeId}>Start time</Label>
          <Select value={startTime} onValueChange={onStartTimeChange}>
            <SelectTrigger id={startTimeId} aria-label="Start time">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={endTimeId}>End time</Label>
          <Select value={endTime} onValueChange={onEndTimeChange}>
            <SelectTrigger id={endTimeId} aria-label="End time">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      {showRepeatCount && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={repeatCountId}>Repeat count</Label>
          <NumberInput
            id={repeatCountId}
            aria-label="Repeat count"
            value={recurrenceCount}
            onChange={onRecurrenceCountChange}
            min={1}
          />
        </div>
      )}
    </div>
  )
}

TaskTimeFields.displayName = 'TaskTimeFields'
