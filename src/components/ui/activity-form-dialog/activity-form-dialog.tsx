import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TaskTimeFields } from '@/components/ui/task-time-fields'
import { DatePicker } from '@/components/ui/date-picker'
import { Button } from '@/components/ui/button'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { type CalendarEventColor, type DayOfWeek } from '@/components/ui/calendar-event-chip'
import { buildIso, toTimeSlot } from '@/lib/time'

// ─── Public types ─────────────────────────────────────────────────────────────

export type ActivityType = 'task' | 'goal'

export interface ActivitySocial {
  readonly activityType: 'solo' | 'group'
  readonly visibility: 'everyone' | 'friends' | 'busy' | 'only_me'
  readonly joinability?: 'open' | 'request' | 'closed'
  readonly maxParticipants?: number
}

export interface ActivityFormValues {
  readonly type: ActivityType
  readonly title: string
  /**
   * Goal target date, emitted date-only as `YYYY-MM-DD`. The dialog never emits
   * a time component for goals — consumers that persist a timestamp (e.g. a
   * `.datetime()` schema) must convert to noon-UTC (`T12:00:00.000Z`) themselves.
   */
  readonly targetDate?: string | null
  readonly startAt?: string | null
  readonly endAt?: string | null
  readonly recurrence?: string | null
  readonly recurrenceCount?: number
  readonly recurrenceDays?: readonly DayOfWeek[]
  readonly color?: string | null
  readonly location?: string | null
  readonly description?: string | null
  readonly allDay?: boolean
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
  /** Display task times as 24-hour instead of 12-hour with AM/PM. */
  readonly use24h?: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_TYPE: ActivityType = 'task'
const DEFAULT_START_TIME = '09:00'
const DEFAULT_END_TIME = '10:00'
const DEFAULT_RECURRENCE = 'none'
const WEEKLY_RECURRENCE = 'weekly'
const REPEAT_MIN = 2
const REPEAT_MAX = 52
const MIN_PARTICIPANTS = 2
const MAX_TITLE_LENGTH = 200
const DEFAULT_COLOR: CalendarEventColor = 'default'
const DEFAULT_VISIBILITY: ActivitySocial['visibility'] = 'only_me'
const DEFAULT_JOINABILITY: NonNullable<ActivitySocial['joinability']> = 'open'

const TYPE_OPTIONS: readonly { readonly value: ActivityType; readonly label: string }[] = [
  { value: 'task', label: 'Task' },
  { value: 'goal', label: 'Goal' },
] as const

const COLOR_OPTIONS: readonly { readonly value: CalendarEventColor; readonly label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'blue', label: 'Blue' },
  { value: 'violet', label: 'Violet' },
  { value: 'green', label: 'Green' },
  { value: 'red', label: 'Red' },
  { value: 'amber', label: 'Amber' },
  { value: 'pink', label: 'Pink' },
  { value: 'cyan', label: 'Cyan' },
  { value: 'indigo', label: 'Indigo' },
  { value: 'teal', label: 'Teal' },
  { value: 'orange', label: 'Orange' },
  { value: 'rose', label: 'Rose' },
  { value: 'sky', label: 'Sky' },
  { value: 'fuchsia', label: 'Fuchsia' },
  { value: 'lime', label: 'Lime' },
] as const

const VISIBILITY_OPTIONS: readonly {
  readonly value: ActivitySocial['visibility']
  readonly label: string
}[] = [
  { value: 'only_me', label: 'Only me' },
  { value: 'friends', label: 'Friends' },
  { value: 'busy', label: 'Busy' },
  { value: 'everyone', label: 'Everyone' },
] as const

const JOINABILITY_OPTIONS: readonly {
  readonly value: NonNullable<ActivitySocial['joinability']>
  readonly label: string
}[] = [
  { value: 'open', label: 'Open' },
  { value: 'request', label: 'Request' },
  { value: 'closed', label: 'Closed' },
] as const

/** Visibility values that hide joinability even in group mode. */
const JOINABILITY_HIDDEN_VISIBILITY = new Set<ActivitySocial['visibility']>(['busy', 'only_me'])

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse a `YYYY-MM-DD` string (or null/undefined) into a Date at local noon. */
function parseDateString(dateStr: string | null | undefined): Date | undefined {
  if (!dateStr) return undefined
  return new Date(`${dateStr}T12:00:00`)
}

/** Format a Date to a `YYYY-MM-DD` string using its local calendar parts. */
function formatDateOnly(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
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
  use24h = false,
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
  const [recurrence, setRecurrence] = React.useState(
    initialValues?.recurrence ?? DEFAULT_RECURRENCE,
  )
  const [recurrenceCount, setRecurrenceCount] = React.useState(
    initialValues?.recurrenceCount ?? REPEAT_MIN,
  )
  const [recurrenceDays, setRecurrenceDays] = React.useState<readonly DayOfWeek[]>(
    initialValues?.recurrenceDays ?? [],
  )
  const [color, setColor] = React.useState<CalendarEventColor>(
    (initialValues?.color as CalendarEventColor | undefined) ?? DEFAULT_COLOR,
  )
  const [location, setLocation] = React.useState(initialValues?.location ?? '')
  const [description, setDescription] = React.useState(initialValues?.description ?? '')
  const [allDay, setAllDay] = React.useState(initialValues?.allDay ?? false)

  // goal fields
  const [goalDate, setGoalDate] = React.useState<Date | undefined>(() =>
    parseDateString(initialValues?.targetDate),
  )

  // social fields
  const [socialType, setSocialType] = React.useState<'solo' | 'group'>(
    initialValues?.social?.activityType ?? 'solo',
  )
  const [visibility, setVisibility] = React.useState<ActivitySocial['visibility']>(
    initialValues?.social?.visibility ?? DEFAULT_VISIBILITY,
  )
  const [joinability, setJoinability] = React.useState<NonNullable<ActivitySocial['joinability']>>(
    initialValues?.social?.joinability ?? DEFAULT_JOINABILITY,
  )
  const [maxParticipants, setMaxParticipants] = React.useState<number>(
    initialValues?.social?.maxParticipants ?? MIN_PARTICIPANTS,
  )

  // ── derived ─────────────────────────────────────────────────────────────────
  const showJoinability = socialType === 'group' && !JOINABILITY_HIDDEN_VISIBILITY.has(visibility)
  const dialogTitle = `${initialValues ? 'Edit' : 'New'} ${type}`
  const isSaveDisabled =
    title.trim() === '' ||
    isPending ||
    (type === 'task' && !allDay && !taskDate) ||
    (type === 'goal' && !goalDate)

  const formId = React.useId()
  const titleId = React.useId()

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
        : { activityType: 'solo', visibility }

    if (type === 'goal') {
      if (!goalDate) return
      void onSubmit({
        type: 'goal',
        title,
        targetDate: formatDateOnly(goalDate),
        location: location.trim() || null,
        description: description.trim() || null,
        social,
      })
      return
    }

    if (!allDay && !taskDate) return

    void onSubmit({
      type: 'task',
      title,
      startAt: allDay ? null : buildIso(taskDate!, startTime),
      endAt: allDay ? null : buildIso(taskDate!, endTime),
      recurrence: recurrence === DEFAULT_RECURRENCE ? null : recurrence,
      recurrenceCount: recurrence === DEFAULT_RECURRENCE ? undefined : recurrenceCount,
      recurrenceDays:
        recurrence === WEEKLY_RECURRENCE && recurrenceDays.length > 0 ? recurrenceDays : undefined,
      color: color === DEFAULT_COLOR ? null : color,
      location: location.trim() || null,
      description: description.trim() || null,
      allDay,
      social,
    })
  }

  const handleCancel = (): void => onOpenChange(false)

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="default"
        className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>Create or edit an activity.</DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          onSubmit={handleSubmit}
          data-testid="activity-form-scroll"
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-6 py-4"
        >
          {/* Type picker */}
          {!lockType && (
            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <RadioGroup
                value={type}
                onValueChange={(v) => setType(v as ActivityType)}
                className="flex flex-row gap-4"
              >
                {TYPE_OPTIONS.map((opt) => (
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
              maxLength={MAX_TITLE_LENGTH}
            />
          </div>

          {/* Task fields */}
          {type === 'task' && (
            <>
              <div className="flex items-center gap-2">
                <Switch id={`${formId}-all-day`} checked={allDay} onCheckedChange={setAllDay} />
                <Label htmlFor={`${formId}-all-day`}>All day</Label>
              </div>

              {!allDay && (
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
                  recurrenceDays={recurrenceDays}
                  onRecurrenceDaysChange={setRecurrenceDays}
                  showDate
                  showRecurrence
                  use24h={use24h}
                  repeatMin={REPEAT_MIN}
                  repeatMax={REPEAT_MAX}
                />
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label>Color</Label>
                  <Select value={color} onValueChange={(v) => setColor(v as CalendarEventColor)}>
                    <SelectTrigger aria-label="Color">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`${formId}-task-location`}>Location</Label>
                  <Input
                    id={`${formId}-task-location`}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location (optional)"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${formId}-task-description`}>Description</Label>
                <Textarea
                  id={`${formId}-task-description`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="min-h-16"
                />
              </div>
            </>
          )}

          {/* Goal fields */}
          {type === 'goal' && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label>Target date</Label>
                  <DatePicker
                    value={goalDate}
                    onValueChange={setGoalDate}
                    placeholder="Pick a date"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`${formId}-goal-location`}>Location</Label>
                  <Input
                    id={`${formId}-goal-location`}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location (optional)"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${formId}-goal-description`}>Description</Label>
                <Textarea
                  id={`${formId}-goal-description`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="min-h-16"
                />
              </div>
            </>
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
        </form>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={isSaveDisabled}>
            {isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

ActivityFormDialog.displayName = 'ActivityFormDialog'

// ─── Social Section (extracted to keep the main component lean) ───────────────

interface SocialSectionProps {
  readonly socialType: 'solo' | 'group'
  readonly onSocialTypeChange: (v: 'solo' | 'group') => void
  readonly visibility: ActivitySocial['visibility']
  readonly onVisibilityChange: (v: ActivitySocial['visibility']) => void
  readonly showJoinability: boolean
  readonly joinability: NonNullable<ActivitySocial['joinability']>
  readonly onJoinabilityChange: (v: NonNullable<ActivitySocial['joinability']>) => void
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Activity type: solo / group */}
        <div className="flex flex-col gap-1.5">
          <Label>Activity type</Label>
          <RadioGroup
            value={socialType}
            onValueChange={(v) => onSocialTypeChange(v as 'solo' | 'group')}
            className="flex flex-row gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="solo" id="social-solo" aria-label="Solo" />
              <Label htmlFor="social-solo">Solo</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="group" id="social-group" aria-label="Group" />
              <Label htmlFor="social-group">Group</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Visibility */}
        <div className="flex flex-col gap-1.5">
          <Label>Visibility</Label>
          <Select
            value={visibility}
            onValueChange={(v) => onVisibilityChange(v as ActivitySocial['visibility'])}
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
      </div>

      {(showJoinability || socialType === 'group') && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Joinability (group + non-private visibility only) */}
          {showJoinability && (
            <div className="flex flex-col gap-1.5">
              <Label>Joinability</Label>
              <Select
                value={joinability}
                onValueChange={(v) =>
                  onJoinabilityChange(v as NonNullable<ActivitySocial['joinability']>)
                }
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
                min={MIN_PARTICIPANTS}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
