import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { TaskTimeFields } from '@/components/ui/task-time-fields'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { buildIso, toTimeSlot } from '@/lib/time'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActivityType = 'task' | 'goal' | 'habit'

export interface ActivitySocial {
  readonly activityType: 'solo' | 'group'
  readonly visibility: 'everyone' | 'friends' | 'busy' | 'only_me'
  readonly joinability?: 'open' | 'request' | 'closed'
  readonly maxParticipants?: number
}

export interface ActivityFormValues {
  readonly type: ActivityType
  readonly title: string
  readonly targetDate?: string | null
  readonly startAt?: string | null
  readonly endAt?: string | null
  readonly recurrence?: string | null
  readonly recurrenceCount?: number
  readonly social: ActivitySocial
}

export interface ActivityFormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: ActivityFormValues) => void | Promise<void>
  readonly initialType?: ActivityType
  readonly initialValues?: Partial<ActivityFormValues>
  readonly lockType?: boolean
  readonly isPending?: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_TYPE: ActivityType = 'task'
const DEFAULT_START_TIME = '09:00'
const DEFAULT_END_TIME = '10:00'
const DEFAULT_RECURRENCE = 'none'
const DEFAULT_RECURRENCE_COUNT = 1
const DEFAULT_MAX_PARTICIPANTS = 10

const ACTIVITY_TYPE_OPTIONS: readonly { value: ActivityType; label: string }[] = [
  { value: 'task', label: 'Task' },
  { value: 'goal', label: 'Goal' },
  { value: 'habit', label: 'Habit' },
] as const

const SOCIAL_TYPE_OPTIONS: readonly { value: 'solo' | 'group'; label: string }[] = [
  { value: 'solo', label: 'Solo' },
  { value: 'group', label: 'Group' },
] as const

const VISIBILITY_OPTIONS: readonly {
  value: 'everyone' | 'friends' | 'busy' | 'only_me'
  label: string
}[] = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'friends', label: 'Friends' },
  { value: 'busy', label: 'Busy' },
  { value: 'only_me', label: 'Only Me' },
] as const

const JOINABILITY_OPTIONS: readonly { value: 'open' | 'request' | 'closed'; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'request', label: 'Request' },
  { value: 'closed', label: 'Closed' },
] as const

/** Visibility values that hide joinability even in group mode */
const JOINABILITY_HIDDEN_VISIBILITY = new Set<string>(['busy', 'only_me'])

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse a YYYY-MM-DD string (or null/undefined) into a Date (UTC noon). */
function parseDateString(dateStr: string | null | undefined): Date | undefined {
  if (!dateStr) return undefined
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
}

/** Format a Date to a YYYY-MM-DD string using UTC parts. */
function formatDateOnly(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ActivityFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialType,
  initialValues,
  lockType = false,
  isPending = false,
}: ActivityFormDialogProps): React.JSX.Element {
  const resolvedInitialType = initialType ?? DEFAULT_TYPE

  // ── field state ─────────────────────────────────────────────────────────────
  const [type, setType] = React.useState<ActivityType>(initialValues?.type ?? resolvedInitialType)
  const [title, setTitle] = React.useState(initialValues?.title ?? '')

  // task fields
  const [taskDate, setTaskDate] = React.useState<Date | undefined>(() => {
    if (initialValues?.startAt) {
      const d = new Date(initialValues.startAt)
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
    }
    return undefined
  })
  const [startTime, setStartTime] = React.useState<string>(() =>
    initialValues?.startAt ? toTimeSlot(initialValues.startAt) : DEFAULT_START_TIME,
  )
  const [endTime, setEndTime] = React.useState<string>(() =>
    initialValues?.endAt ? toTimeSlot(initialValues.endAt) : DEFAULT_END_TIME,
  )

  // shared recurrence
  const [recurrence, setRecurrence] = React.useState(
    initialValues?.recurrence ?? DEFAULT_RECURRENCE,
  )
  const [recurrenceCount, setRecurrenceCount] = React.useState(
    initialValues?.recurrenceCount ?? DEFAULT_RECURRENCE_COUNT,
  )

  // goal fields
  const [goalDate, setGoalDate] = React.useState<Date | undefined>(() =>
    parseDateString(initialValues?.targetDate),
  )

  // social fields
  const [socialType, setSocialType] = React.useState<'solo' | 'group'>(
    initialValues?.social?.activityType ?? 'solo',
  )
  const [visibility, setVisibility] = React.useState<'everyone' | 'friends' | 'busy' | 'only_me'>(
    initialValues?.social?.visibility ?? 'everyone',
  )
  const [joinability, setJoinability] = React.useState<'open' | 'request' | 'closed'>(
    initialValues?.social?.joinability ?? 'open',
  )
  const [maxParticipants, setMaxParticipants] = React.useState<number>(
    initialValues?.social?.maxParticipants ?? DEFAULT_MAX_PARTICIPANTS,
  )

  // ── derived ─────────────────────────────────────────────────────────────────
  const showJoinability = socialType === 'group' && !JOINABILITY_HIDDEN_VISIBILITY.has(visibility)

  // ── submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const social: ActivitySocial =
      socialType === 'group'
        ? {
            activityType: 'group',
            visibility,
            ...(showJoinability ? { joinability } : {}),
            maxParticipants,
          }
        : {
            activityType: 'solo',
            visibility,
          }

    let values: ActivityFormValues

    if (type === 'task') {
      const startAt = taskDate ? buildIso(taskDate, startTime) : undefined
      const endAt = taskDate ? buildIso(taskDate, endTime) : undefined
      values = {
        type,
        title,
        startAt,
        endAt,
        recurrence: recurrence !== DEFAULT_RECURRENCE ? recurrence : undefined,
        recurrenceCount: recurrence !== DEFAULT_RECURRENCE ? recurrenceCount : undefined,
        social,
      }
    } else if (type === 'goal') {
      values = {
        type,
        title,
        targetDate: goalDate ? formatDateOnly(goalDate) : undefined,
        social,
      }
    } else {
      // habit
      values = {
        type,
        title,
        recurrence: recurrence !== DEFAULT_RECURRENCE ? recurrence : undefined,
        recurrenceCount: recurrence !== DEFAULT_RECURRENCE ? recurrenceCount : undefined,
        social,
      }
    }

    void onSubmit(values)
  }

  // ── render ───────────────────────────────────────────────────────────────────
  const titleId = React.useId()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="default">
        <DialogHeader>
          <DialogTitle>New Activity</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Type picker */}
          {!lockType && (
            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <RadioGroup
                value={type}
                onValueChange={(v) => setType(v as ActivityType)}
                className="flex flex-row gap-4"
              >
                {ACTIVITY_TYPE_OPTIONS.map((opt) => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <RadioGroupItem
                      value={opt.value}
                      id={`type-${opt.value}`}
                      aria-label={opt.label}
                    />
                    <Label htmlFor={`type-${opt.value}`}>{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

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
          </div>

          {/* Type-specific fields */}
          {type === 'task' && (
            <TaskTimeFields
              date={taskDate}
              onDateChange={setTaskDate}
              startTime={startTime}
              onStartTimeChange={setStartTime}
              endTime={endTime}
              onEndTimeChange={setEndTime}
              recurrence={recurrence}
              onRecurrenceChange={setRecurrence}
              recurrenceCount={recurrenceCount}
              onRecurrenceCountChange={setRecurrenceCount}
              showDate
              showRecurrence
            />
          )}

          {type === 'goal' && (
            <div className="flex flex-col gap-1.5">
              <Label>Target date</Label>
              <DatePicker value={goalDate} onValueChange={setGoalDate} placeholder="Pick a date" />
            </div>
          )}

          {type === 'habit' && (
            <HabitRecurrenceFields
              recurrence={recurrence}
              onRecurrenceChange={setRecurrence}
              recurrenceCount={recurrenceCount}
              onRecurrenceCountChange={setRecurrenceCount}
            />
          )}

          {/* Social section */}
          <SocialSection
            socialType={socialType}
            onSocialTypeChange={setSocialType}
            visibility={visibility}
            onVisibilityChange={setVisibility}
            showJoinability={showJoinability}
            joinability={joinability}
            onJoinabilityChange={setJoinability}
            maxParticipants={maxParticipants}
            onMaxParticipantsChange={setMaxParticipants}
          />

          <DialogFooter>
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium',
                'ring-offset-background transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:pointer-events-none disabled:opacity-50',
                'bg-primary text-primary-foreground hover:bg-primary/90',
                'h-10 px-4 py-2',
              )}
            >
              {isPending ? 'Saving…' : 'Save'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

ActivityFormDialog.displayName = 'ActivityFormDialog'

// ─── Habit Recurrence Fields ─────────────────────────────────────────────────

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const

interface HabitRecurrenceFieldsProps {
  readonly recurrence: string
  readonly onRecurrenceChange: (r: string) => void
  readonly recurrenceCount: number
  readonly onRecurrenceCountChange: (n: number) => void
}

function HabitRecurrenceFields({
  recurrence,
  onRecurrenceChange,
  recurrenceCount,
  onRecurrenceCountChange,
}: HabitRecurrenceFieldsProps): React.JSX.Element {
  const recurrenceId = React.useId()
  const repeatCountId = React.useId()
  const showRepeatCount = recurrence !== 'none'

  return (
    <div className="flex flex-col gap-4">
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

// ─── Social Section (extracted to keep main component lean) ──────────────────

interface SocialSectionProps {
  readonly socialType: 'solo' | 'group'
  readonly onSocialTypeChange: (v: 'solo' | 'group') => void
  readonly visibility: 'everyone' | 'friends' | 'busy' | 'only_me'
  readonly onVisibilityChange: (v: 'everyone' | 'friends' | 'busy' | 'only_me') => void
  readonly showJoinability: boolean
  readonly joinability: 'open' | 'request' | 'closed'
  readonly onJoinabilityChange: (v: 'open' | 'request' | 'closed') => void
  readonly maxParticipants: number
  readonly onMaxParticipantsChange: (n: number) => void
}

function SocialSection({
  socialType,
  onSocialTypeChange,
  visibility,
  onVisibilityChange,
  showJoinability,
  joinability,
  onJoinabilityChange,
  maxParticipants,
  onMaxParticipantsChange,
}: SocialSectionProps): React.JSX.Element {
  const maxParticipantsId = React.useId()

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-3">
      <p className="text-sm font-medium text-foreground">Social</p>

      {/* Activity type: solo / group */}
      <div className="flex flex-col gap-1.5">
        <Label>Activity type</Label>
        <Select value={socialType} onValueChange={(v) => onSocialTypeChange(v as 'solo' | 'group')}>
          <SelectTrigger aria-label="Activity type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SOCIAL_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Visibility */}
      <div className="flex flex-col gap-1.5">
        <Label>Visibility</Label>
        <Select
          value={visibility}
          onValueChange={(v) =>
            onVisibilityChange(v as 'everyone' | 'friends' | 'busy' | 'only_me')
          }
        >
          <SelectTrigger aria-label="Visibility">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VISIBILITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Joinability (group + non-private visibility only) */}
      {showJoinability && (
        <div className="flex flex-col gap-1.5">
          <Label>Joinability</Label>
          <Select
            value={joinability}
            onValueChange={(v) => onJoinabilityChange(v as 'open' | 'request' | 'closed')}
          >
            <SelectTrigger aria-label="Joinability">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JOINABILITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Max participants (group only) */}
      {socialType === 'group' && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={maxParticipantsId}>Max participants</Label>
          <NumberInput
            id={maxParticipantsId}
            aria-label="Max participants"
            value={maxParticipants}
            onChange={onMaxParticipantsChange}
            min={1}
          />
        </div>
      )}
    </div>
  )
}
