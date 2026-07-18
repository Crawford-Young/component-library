import * as React from 'react'
import { cva } from 'class-variance-authority'
import { CircleCheck, Flame, Lock, LockOpen, Pencil, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TimeInput } from '@/components/ui/time-input'

export type CalendarEventColor =
  | 'default'
  | 'blue'
  | 'violet'
  | 'green'
  | 'red'
  | 'amber'
  | 'pink'
  | 'cyan'
  | 'indigo'
  | 'teal'
  | 'orange'
  | 'rose'
  | 'sky'
  | 'fuchsia'
  | 'lime'

export type DayOfWeek = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface CalendarEvent {
  readonly id: string
  readonly title: string
  readonly start: string
  readonly end: string
  readonly allDay?: boolean
  readonly color?: CalendarEventColor
  readonly description?: string
  readonly location?: string
  /**
   * @deprecated Recurring creation/editing moved app-side (activity schedules). Still consumed by
   * `WeekCalendarView`'s display fan-out — an event carrying `recurrenceDays` renders on each
   * listed weekday in the current week — but no library UI edits it anymore. Removal is a later
   * wave, if ever.
   */
  readonly recurrenceDays?: readonly DayOfWeek[]
  /**
   * @deprecated Recurring creation/editing moved app-side. Retained as a display-only field on
   * the public shape; no library UI writes it.
   */
  readonly recurrenceFrequency?: RecurrenceFrequency
  /**
   * @deprecated Recurring creation/editing moved app-side. Total occurrence count (e.g. weeks)
   * for the event's recurrence. Retained as a display-only field on the public shape so typed
   * consumers can read/write it without a cast; no library UI writes it. `WeekCalendarView` does
   * not read this field for display.
   */
  readonly recurrenceCount?: number
  /**
   * @deprecated Recurring creation/editing moved app-side. Previously seeded the chip's (now
   * removed) edit-popover Days picker. Retained as a display-only field on the public shape; no
   * library UI reads or writes it anymore. `WeekCalendarView`'s display fan-out is driven by
   * `recurrenceDays`, not this field.
   */
  readonly seriesDays?: readonly DayOfWeek[]
  /** Whether the event has been marked complete. Toggled via `onToggleComplete`. */
  readonly completed?: boolean
  /** Opt-in for the chip's one-click complete circle (renders only when a toggle handler is also wired). */
  readonly completable?: boolean
  /**
   * @deprecated Streak computation moved app-side. Retained as a display-only field: when > 0 it
   * still renders as flame+count on the chip's time line. No library UI writes it.
   */
  readonly streak?: number
  /**
   * App-persisted lock flag. When `true`, the chip blocks drag/resize only — popover, quick
   * edit/delete, and complete-toggle all keep working. Toggled via `onToggleLock`.
   */
  readonly locked?: boolean
  /**
   * Id of the activity this event was created from, if any. `null`/absent means the event has
   * no backing activity. Drives the popover's "Edit activity" action (only shown when both this
   * is non-null and `onEditActivity` is provided).
   */
  readonly activityId?: string | null
}

// All bg values verified ≥4.5:1 contrast with white text (WCAG AA)
export const eventColorVariants = cva('overflow-hidden rounded px-1 text-[10px] font-medium', {
  variants: {
    color: {
      default: 'bg-emerald-700 text-white',
      blue: 'bg-blue-600 text-white',
      violet: 'bg-violet-600 text-white',
      green: 'bg-green-700 text-white',
      red: 'bg-red-600 text-white',
      amber: 'bg-amber-700 text-white',
      pink: 'bg-pink-600 text-white',
      cyan: 'bg-cyan-700 text-white',
      indigo: 'bg-indigo-600 text-white',
      teal: 'bg-teal-700 text-white',
      orange: 'bg-orange-700 text-white',
      rose: 'bg-rose-600 text-white',
      sky: 'bg-sky-700 text-white',
      fuchsia: 'bg-fuchsia-700 text-white',
      lime: 'bg-lime-700 text-white',
    },
  },
  defaultVariants: { color: 'default' },
})

export interface CalendarEventChipProps {
  readonly event: CalendarEvent
  readonly style: React.CSSProperties
  readonly expanded?: boolean
  readonly onClick?: (event: CalendarEvent) => void
  readonly onEdit?: (event: CalendarEvent) => void
  readonly onDelete?: (event: CalendarEvent) => void
  readonly onToggleComplete?: (event: CalendarEvent) => void
  readonly onToggleLock?: (event: CalendarEvent) => void
  /**
   * Fires the popover's "Edit activity" action. The action only renders when this is provided
   * AND `event.activityId` is non-null.
   */
  readonly onEditActivity?: (event: CalendarEvent) => void
  /**
   * Fires the popover's "Duplicate" action. The action renders whenever this is
   * provided (no `activityId` requirement); it closes the popover and fires with
   * the event, taking no other action.
   */
  readonly onDuplicate?: (event: CalendarEvent) => void
  readonly onMoveStart?: (
    event: CalendarEvent,
    clientY: number,
    clientX: number,
    shiftKey: boolean,
  ) => void
  readonly onResizeStart?: (event: CalendarEvent, edge: 'start' | 'end') => void
  readonly renderPopover?: (event: CalendarEvent) => React.ReactNode
  readonly className?: string
  readonly use24h?: boolean
}

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

interface DraftEvent {
  title: string
  color: CalendarEventColor
  location: string
  description: string
  startTime: string
  endTime: string
}

function fmt24h(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

/** Parses a zero-padded "HH:MM" draft time (as produced by `TimeInput`) into `[hour, minute]`. */
function parseHHMM(time: string): [hour: number, minute: number] {
  const [h, m] = time.split(':')
  return [Number(h), Number(m)]
}

/**
 * Builds the edit form's initial draft from an event. Recurrence editing was removed from the
 * chip popover (recurring creation/editing moved app-side), so the draft no longer seeds any
 * recurrence day/frequency state — an edit preserves the event's stored recurrence fields
 * untouched via the `...event` spread in `handleSave`.
 *
 * Start/End are seeded from the LOCAL wall-clock of the event's instants — matching exactly
 * what the chip and popover already display (`formatTimeRange`, both driven by local `Date`
 * getters). Reading the ISO's own written clock digits (e.g. via `ev.start.substring(11, 16)`)
 * is wrong whenever the ISO carries an explicit offset or "Z": that substring is the offset's
 * own clock, not the viewer's local one, and seeding from it is the root cause of the
 * post-save time jump this fixes.
 */
function toDraft(ev: CalendarEvent): DraftEvent {
  return {
    title: ev.title,
    color: ev.color ?? 'default',
    location: ev.location ?? '',
    description: ev.description ?? '',
    startTime: fmt24h(new Date(ev.start)),
    endTime: fmt24h(new Date(ev.end)),
  }
}

function formatTimeRange(start: string, end: string, use24h = false): string {
  const s = new Date(start)
  const e = new Date(end)
  if (use24h) {
    return `${fmt24h(s)}–${fmt24h(e)}`
  }
  const sH = s.getHours()
  const eH = e.getHours()
  const sPeriod = sH < 12 ? 'AM' : 'PM'
  const ePeriod = eH < 12 ? 'AM' : 'PM'
  const fmt = (d: Date): string => {
    const h = d.getHours() % 12 || 12
    const m = d.getMinutes().toString().padStart(2, '0')
    return `${h}:${m}`
  }
  if (sPeriod === ePeriod) {
    return `${fmt(s)}–${fmt(e)} ${sPeriod}`
  }
  return `${fmt(s)} ${sPeriod}–${fmt(e)} ${ePeriod}`
}

function ClockIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-3 w-3 shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function MapPinIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-3 w-3 shrink-0"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function NoteIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-3 w-3 shrink-0"
    >
      <line x1="21" y1="10" x2="7" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="21" y1="18" x2="7" y2="18" />
    </svg>
  )
}

function CheckIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function InlineStreak({ streak }: { readonly streak: number }): React.JSX.Element {
  return (
    <span
      aria-label={`${streak}-day streak`}
      className="ml-1 inline-flex items-center gap-0.5 align-bottom"
    >
      <Flame className="h-2.5 w-2.5" aria-hidden />
      <span>{streak}</span>
    </span>
  )
}

const inputCls =
  'w-full rounded border border-input bg-background px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

const labelCls = 'mb-0.5 block text-[11px] font-medium text-muted-foreground'

// Idle: invisible but still keyboard-reachable (opacity, not display:none). Revealed on chip
// hover/focus-within, and independently on the button's own focus-visible so Tab lands on it
// even if focus-within support/timing is inconsistent.
const quickActionButtonCls =
  'flex h-3 w-3 items-center justify-center rounded-full opacity-0 pointer-events-none motion-safe:transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function CalendarEventChip({
  event,
  style,
  expanded = false,
  onClick,
  onEdit,
  onDelete,
  onToggleComplete,
  onToggleLock,
  onEditActivity,
  onDuplicate,
  onMoveStart,
  onResizeStart,
  renderPopover,
  className,
  use24h = false,
}: CalendarEventChipProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [draft, setDraft] = React.useState<DraftEvent>(() => toDraft(event))

  function handleOpenChange(next: boolean): void {
    setOpen(next)
    if (!next) {
      setIsEditing(false)
      setDraft(toDraft(event))
    }
  }

  function handleEditClick(): void {
    setDraft(toDraft(event))
    setIsEditing(true)
  }

  function handleSave(): void {
    // Anchor the edit to the event's LOCAL calendar day (not the ISO's own written date —
    // that's the UTC/local mismatch this fixes) and rebuild real instants from the drafted
    // local HH:MM. `Date`'s constructor normalizes day overflow, so day + 1 on an overnight
    // end just works.
    const anchor = new Date(event.start)
    const [startHour, startMinute] = parseHHMM(draft.startTime)
    const [endHour, endMinute] = parseHHMM(draft.endTime)
    const isOvernight = draft.endTime < draft.startTime
    const start = new Date(
      anchor.getFullYear(),
      anchor.getMonth(),
      anchor.getDate(),
      startHour,
      startMinute,
    ).toISOString()
    const end = new Date(
      anchor.getFullYear(),
      anchor.getMonth(),
      anchor.getDate() + (isOvernight ? 1 : 0),
      endHour,
      endMinute,
    ).toISOString()
    // Recurrence editing was removed from the popover: an edit preserves the event's stored
    // recurrence fields (`recurrenceDays`/`recurrenceFrequency`/`recurrenceCount`/`seriesDays`)
    // untouched via the `...event` spread, so a fanned event keeps fanning out after an edit.
    onEdit!({
      ...event,
      title: draft.title,
      color: draft.color,
      location: draft.location !== '' ? draft.location : undefined,
      description: draft.description !== '' ? draft.description : undefined,
      start,
      end,
    })
    setOpen(false)
    setIsEditing(false)
  }

  const heightPct = typeof style.height === 'string' ? parseFloat(style.height) : NaN
  const showTimeRange = expanded
  const showStartTime = !expanded && !isNaN(heightPct) && heightPct > 4
  const showLocation =
    (expanded && event.location !== undefined) ||
    (!expanded && !isNaN(heightPct) && heightPct > 10 && event.location !== undefined)
  const showDescription = expanded && event.description !== undefined

  const timeRange = formatTimeRange(event.start, event.end, use24h)
  const startDate = new Date(event.start)
  const displayHour = startDate.getHours() % 12 || 12
  const displayMin = startDate.getMinutes().toString().padStart(2, '0')
  const displayStartTime = use24h ? fmt24h(startDate) : `${displayHour}:${displayMin}`
  const showCheckbox = event.completable === true && onToggleComplete !== undefined
  const showLock = onToggleLock !== undefined
  const isLocked = event.locked === true
  const showStreak = event.streak !== undefined && event.streak > 0
  const showEditActivity =
    event.activityId !== undefined && event.activityId !== null && onEditActivity !== undefined

  return (
    <div
      className={cn('group relative', eventColorVariants({ color: event.color }), className)}
      style={style}
    >
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'block h-full w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              onMoveStart !== undefined && !isLocked && 'cursor-grab',
            )}
            aria-label={`${event.title} ${timeRange}`}
            onClick={() => onClick?.(event)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick?.(event)
            }}
            onPointerDown={(e) => {
              if (isLocked) return
              const target = e.target as HTMLElement
              const resize = target.dataset.resize
              if (resize === 'start' || resize === 'end') {
                e.stopPropagation()
                onResizeStart?.(event, resize)
              } else {
                onMoveStart?.(event, e.clientY, e.clientX, e.shiftKey)
              }
            }}
          >
            <div
              className={cn(
                // Reserve room on the right for the cluster (sibling, absolutely positioned —
                // see below), so truncated title text never runs under it. Two pairs, chosen by
                // whether the lock button is wired (it's idle-visible, unlike edit/delete which
                // only reveal on hover):
                //   - Lock NOT wired (C1 values, unchanged): idle pr-4 (16px) clears the
                //     always-visible checkbox alone (12px icon + right-1 4px inset). Hover/
                //     focus-within pr-11 (44px) clears the full 3-icon cluster
                //     (3 * 12px + 2 * gap-0.5 2px + 4px = 44px) once quick edit/delete reveal.
                //   - Lock wired: idle now has 2 always-visible icons (checkbox + lock):
                //     2*12 + 1*2 + 4 = 30px — no exact Tailwind step (pr-7=28/pr-8=32), pr-8
                //     picked for headroom. Hover has the full 4-icon cluster:
                //     4*12 + 3*2 + 4 = 58px — pr-14 (56px) picked over the arbitrary pr-[58px];
                //     the 2px shortfall is invisible at this chip's text-[10px] title size.
                showLock
                  ? 'truncate pr-8 font-semibold motion-safe:transition-[padding] group-hover:pr-14 group-focus-within:pr-14'
                  : 'truncate pr-4 font-semibold motion-safe:transition-[padding] group-hover:pr-11 group-focus-within:pr-11',
                event.completed && 'line-through',
              )}
            >
              {event.title}
            </div>
            {showTimeRange && (
              <div className="text-[9px]">
                {timeRange}
                {showStreak && <InlineStreak streak={event.streak!} />}
              </div>
            )}
            {showStartTime && (
              <div className="text-[9px]">
                {displayStartTime}
                {showStreak && <InlineStreak streak={event.streak!} />}
              </div>
            )}
            {showLocation && <div className="truncate text-[9px]">{event.location}</div>}
            {showDescription && <div className="line-clamp-2 text-[9px]">{event.description}</div>}
            {!isLocked && (
              <>
                <div
                  data-resize="start"
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1.5 cursor-ns-resize"
                />
                <div
                  data-resize="end"
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-1.5 cursor-ns-resize"
                />
              </>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-72 max-h-[var(--radix-popover-content-available-height)] overflow-y-auto p-0"
          side="right"
          align="start"
          sideOffset={0}
          collisionPadding={8}
        >
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSave()
              }}
            >
              <div className="space-y-2.5 px-3 py-3">
                <div>
                  <label htmlFor={`${event.id}-title`} className={labelCls}>
                    Title
                  </label>
                  <input
                    id={`${event.id}-title`}
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
                          'h-5 w-5 cursor-pointer rounded-full p-0 overflow-visible',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                          draft.color === c && 'ring-2 ring-ring ring-offset-1',
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div>
                    <label htmlFor={`${event.id}-start`} className={labelCls}>
                      Start
                    </label>
                    <TimeInput
                      id={`${event.id}-start`}
                      label="Start"
                      value={draft.startTime}
                      onChange={(v) => setDraft((d) => ({ ...d, startTime: v }))}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <label htmlFor={`${event.id}-end`} className={labelCls}>
                        End
                      </label>
                      {draft.endTime < draft.startTime && (
                        <span className="text-[10px] text-muted-foreground">+1 day</span>
                      )}
                    </div>
                    <TimeInput
                      id={`${event.id}-end`}
                      label="End"
                      value={draft.endTime}
                      onChange={(v) => setDraft((d) => ({ ...d, endTime: v }))}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={`${event.id}-location`} className={labelCls}>
                    Location
                  </label>
                  <input
                    id={`${event.id}-location`}
                    className={inputCls}
                    value={draft.location}
                    onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                  />
                </div>

                <div>
                  <label htmlFor={`${event.id}-desc`} className={labelCls}>
                    Description
                  </label>
                  <textarea
                    id={`${event.id}-desc`}
                    rows={2}
                    className={cn(inputCls, 'resize-none')}
                    value={draft.description}
                    onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 border-t border-border px-3 py-2">
                <Button type="submit" size="sm">
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="border-b border-border px-3 pb-2 pt-3">
                <p className="text-sm font-semibold text-foreground">{event.title}</p>
              </div>
              <div className="space-y-2 px-3 py-2">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <ClockIcon />
                  <p className="text-xs">{timeRange}</p>
                </div>
                {event.location !== undefined && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPinIcon />
                    <p className="text-xs">{event.location}</p>
                  </div>
                )}
                {event.description !== undefined && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <NoteIcon />
                    <p className="text-xs">{event.description}</p>
                  </div>
                )}
              </div>
              {renderPopover?.(event)}
              {(onEdit !== undefined ||
                onDelete !== undefined ||
                onToggleComplete !== undefined ||
                showEditActivity ||
                onDuplicate !== undefined) && (
                <div className="flex flex-wrap gap-2 border-t border-border px-3 py-2">
                  {onToggleComplete !== undefined && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => onToggleComplete(event)}
                    >
                      <CheckIcon />
                      {event.completed ? 'Mark incomplete' : 'Mark complete'}
                    </Button>
                  )}
                  {onEdit !== undefined && (
                    <Button variant="outline" size="sm" onClick={handleEditClick}>
                      Edit
                    </Button>
                  )}
                  {showEditActivity && (
                    <Button variant="outline" size="sm" onClick={() => onEditActivity!(event)}>
                      Edit activity
                    </Button>
                  )}
                  {onDuplicate !== undefined && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setOpen(false)
                        onDuplicate(event)
                      }}
                    >
                      Duplicate
                    </Button>
                  )}
                  {onDelete !== undefined && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setOpen(false)
                        onDelete(event)
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </PopoverContent>
      </Popover>
      {(onEdit !== undefined || onDelete !== undefined || showCheckbox || showLock) && (
        // Sibling of the trigger button, NOT a descendant — an interactive control (button,
        // checkbox) must never nest inside another interactive control (axe nested-interactive).
        // Absolutely positioned to sit in the chip's top-right corner; the title's pr-4/pr-11
        // reserve above keeps truncated text from running under it.
        <div className="absolute right-1 top-[3px] z-10 flex items-center gap-0.5">
          {onEdit !== undefined && (
            <button
              type="button"
              aria-label="Quick edit"
              className={quickActionButtonCls}
              onClick={(e) => {
                e.stopPropagation()
                setDraft(toDraft(event))
                setIsEditing(true)
                setOpen(true)
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Pencil className="h-3 w-3" aria-hidden />
            </button>
          )}
          {onDelete !== undefined && (
            <button
              type="button"
              aria-label="Quick delete"
              className={quickActionButtonCls}
              onClick={(e) => {
                e.stopPropagation()
                onDelete(event)
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          )}
          {showCheckbox && (
            <button
              type="button"
              role="checkbox"
              aria-checked={event.completed === true}
              aria-label={event.completed === true ? 'Mark incomplete' : 'Mark complete'}
              className="flex h-3 w-3 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={(e) => {
                e.stopPropagation()
                onToggleComplete!(event)
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {event.completed === true ? (
                <CircleCheck className="h-3 w-3" aria-hidden />
              ) : (
                <span
                  className="block h-2.5 w-2.5 rounded-full border-[1.5px] border-current"
                  aria-hidden
                />
              )}
            </button>
          )}
          {showLock && (
            <button
              type="button"
              aria-pressed={isLocked}
              aria-label={isLocked ? 'Unlock event' : 'Lock event'}
              className="flex h-3 w-3 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={(e) => {
                e.stopPropagation()
                onToggleLock!(event)
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {isLocked ? (
                <Lock className="h-3 w-3" aria-hidden />
              ) : (
                <LockOpen className="h-3 w-3 opacity-70" aria-hidden />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
