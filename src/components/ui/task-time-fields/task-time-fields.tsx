import * as React from 'react'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { TimeInput } from '@/components/ui/time-input'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TaskTimeFieldsProps {
  readonly date: Date | undefined
  readonly onDateChange: (d: Date | undefined) => void
  readonly startTime: string
  readonly onStartTimeChange: (t: string) => void
  readonly endTime: string
  readonly onEndTimeChange: (t: string) => void
  readonly showDate?: boolean
  /** Display times as 24-hour (HH:MM) instead of 12-hour with an AM/PM toggle. */
  readonly use24h?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TaskTimeFields({
  date,
  onDateChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  showDate = true,
  use24h = false,
}: TaskTimeFieldsProps): React.JSX.Element {
  const startTimeId = React.useId()
  const endTimeId = React.useId()
  const dateId = React.useId()

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
    </div>
  )
}

TaskTimeFields.displayName = 'TaskTimeFields'
