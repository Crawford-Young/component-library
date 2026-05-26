import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

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
  readonly recurrenceDays?: readonly DayOfWeek[]
  readonly recurrenceFrequency?: RecurrenceFrequency
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
  readonly renderPopover?: (event: CalendarEvent) => React.ReactNode
  readonly className?: string
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

function toDraft(ev: CalendarEvent): DraftEvent {
  return {
    title: ev.title,
    color: ev.color ?? 'default',
    location: ev.location ?? '',
    description: ev.description ?? '',
    startTime: ev.start.substring(11, 16),
    endTime: ev.end.substring(11, 16),
  }
}

function formatTimeRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
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

const inputCls =
  'w-full rounded border border-input bg-background px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

const labelCls = 'mb-0.5 block text-[11px] font-medium text-muted-foreground'

export function CalendarEventChip({
  event,
  style,
  expanded = false,
  onClick,
  onEdit,
  onDelete,
  renderPopover,
  className,
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
    const start = `${event.start.substring(0, 10)}T${draft.startTime}:00`
    const end = `${event.end.substring(0, 10)}T${draft.endTime}:00`
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

  const timeRange = formatTimeRange(event.start, event.end)
  const startDate = new Date(event.start)
  const displayHour = startDate.getHours() % 12 || 12
  const displayMin = startDate.getMinutes().toString().padStart(2, '0')

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            eventColorVariants({ color: event.color }),
            className,
          )}
          style={style}
          aria-label={`${event.title} ${timeRange}`}
          onClick={() => onClick?.(event)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onClick?.(event)
          }}
        >
          <div className="truncate font-semibold">{event.title}</div>
          {showTimeRange && <div className="text-[9px]">{timeRange}</div>}
          {showStartTime && (
            <div className="text-[9px]">
              {displayHour}:{displayMin}
            </div>
          )}
          {showLocation && <div className="truncate text-[9px]">{event.location}</div>}
          {showDescription && <div className="line-clamp-2 text-[9px]">{event.description}</div>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0">
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

              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor={`${event.id}-start`} className={labelCls}>
                    Start
                  </label>
                  <input
                    id={`${event.id}-start`}
                    type="time"
                    className={inputCls}
                    value={draft.startTime}
                    onChange={(e) => setDraft((d) => ({ ...d, startTime: e.target.value }))}
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor={`${event.id}-end`} className={labelCls}>
                    End
                  </label>
                  <input
                    id={`${event.id}-end`}
                    type="time"
                    className={inputCls}
                    value={draft.endTime}
                    onChange={(e) => setDraft((d) => ({ ...d, endTime: e.target.value }))}
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
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
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
            {(onEdit !== undefined || onDelete !== undefined) && (
              <div className="flex gap-2 border-t border-border px-3 py-2">
                {onEdit !== undefined && (
                  <Button variant="outline" size="sm" onClick={handleEditClick}>
                    Edit
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
  )
}
