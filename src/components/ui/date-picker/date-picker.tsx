import * as React from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// ─── Calendar ────────────────────────────────────────────────────────────────

type CalendarProps = React.ComponentProps<typeof DayPicker>

const navBtn = cn(
  'inline-flex h-7 w-7 items-center justify-center rounded-md',
  'text-muted-foreground transition-colors',
  'hover:bg-item-hover hover:text-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  'disabled:pointer-events-none disabled:opacity-30',
)

type DropdownProps =
  React.ComponentProps<typeof DayPicker> extends {
    components?: { Dropdown?: infer D }
  }
    ? D extends React.ComponentType<infer P>
      ? P
      : never
    : never

const CalendarDropdown = ({
  options,
  value,
  onChange,
  disabled,
  'aria-label': ariaLabel,
}: DropdownProps) => {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const selected = options?.find((o) => o.value === value)

  React.useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  React.useEffect(() => {
    if (open && listRef.current) {
      const selectedEl = listRef.current.querySelector('[aria-current="true"]')
      selectedEl?.scrollIntoView({ block: 'nearest' })
    }
  }, [open])

  const handleSelect = (val: number) => {
    onChange?.({ target: { value: String(val) } } as React.ChangeEvent<HTMLSelectElement>)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex items-center gap-1 rounded px-1 py-0',
          'text-sm font-semibold text-foreground cursor-pointer',
          'transition-colors hover:text-accent',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:opacity-50 disabled:pointer-events-none',
        )}
      >
        {selected?.label}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div
          ref={listRef}
          className={cn(
            'absolute z-50 top-full mt-1 min-w-[7rem] max-h-52 overflow-y-auto',
            'bg-surface border border-border rounded-md shadow-lg p-1',
            'dark:[color-scheme:dark]',
          )}
        >
          {options?.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={opt.disabled}
              aria-current={opt.value === value ? 'true' : undefined}
              onClick={() => handleSelect(opt.value)}
              className={cn(
                'w-full text-left px-2 py-1.5 text-sm rounded-sm transition-colors',
                'disabled:opacity-30 disabled:pointer-events-none',
                opt.value === value
                  ? 'bg-accent text-accent-foreground font-medium hover:bg-accent-hover hover:text-accent-hover-foreground'
                  : 'hover:bg-item-hover',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const Calendar = ({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) => (
  <DayPicker
    showOutsideDays={showOutsideDays}
    navLayout="around"
    className={cn('p-3', className)}
    classNames={{
      months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
      month: 'relative flex flex-col gap-3',
      month_caption: 'relative h-9 flex justify-center items-center px-8',
      dropdowns: 'flex items-center gap-1',
      button_previous: cn(navBtn, 'absolute left-0 top-1 z-10'),
      button_next: cn(navBtn, 'absolute right-0 top-1 z-10'),
      month_grid: 'w-full border-collapse space-y-1',
      weekdays: 'flex mb-1',
      weekday:
        'w-9 text-center text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground py-1',
      week: 'flex w-full',
      day: cn(
        'h-9 w-9 text-center text-sm p-0 relative',
        'focus-within:relative focus-within:z-20',
      ),
      day_button: cn(
        'h-9 w-9 flex items-center justify-center rounded-md',
        'text-sm font-normal transition-colors',
        'hover:bg-item-hover hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'aria-selected:opacity-100',
      ),
      selected:
        'bg-accent text-accent-foreground hover:bg-accent-hover hover:text-accent-hover-foreground rounded-md font-medium',
      today: 'font-semibold text-accent',
      outside: 'opacity-25 aria-selected:opacity-50',
      disabled: 'opacity-30 pointer-events-none',
      range_middle:
        'aria-selected:bg-accent-subtle aria-selected:text-accent-subtle-foreground rounded-none',
      range_start: 'rounded-l-md rounded-r-none',
      range_end: 'rounded-r-md rounded-l-none',
      hidden: 'invisible',
      ...classNames,
    }}
    components={{
      Chevron: ({ orientation, className: cls, ...rest }) => {
        if (orientation === 'left') return <ChevronLeft className={cn('h-4 w-4', cls)} {...rest} />
        return <ChevronRight className={cn('h-4 w-4', cls)} {...rest} />
      },
      Dropdown: CalendarDropdown,
    }}
    {...props}
  />
)
Calendar.displayName = 'Calendar'

// ─── DatePicker ───────────────────────────────────────────────────────────────

interface DatePickerProps {
  value?: Date
  onValueChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  captionLayout?: React.ComponentProps<typeof DayPicker>['captionLayout']
  fromYear?: number
  toYear?: number
}

const DatePicker = ({
  value,
  onValueChange,
  placeholder = 'Pick a date',
  className,
  disabled,
  captionLayout = 'dropdown',
  fromYear = new Date().getFullYear() - 100,
  toYear = new Date().getFullYear() + 10,
}: DatePickerProps) => {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          aria-label={value ? format(value, 'MMMM d, yyyy') : placeholder}
          className={cn(
            'inline-flex min-w-[176px] items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm',
            'ring-offset-background transition-colors',
            'hover:bg-item-hover',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-accent" />
          <span className={cn('flex-1 text-left', !value && 'text-muted-foreground')}>
            {value ? format(value, 'MMMM d, yyyy') : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(day) => {
            onValueChange?.(day)
            setOpen(false)
          }}
          captionLayout={captionLayout}
          fromYear={fromYear}
          toYear={toYear}
        />
      </PopoverContent>
    </Popover>
  )
}
DatePicker.displayName = 'DatePicker'

// ─── DateRangePicker ──────────────────────────────────────────────────────────

interface DateRangePickerProps {
  value?: DateRange
  onValueChange?: (range: DateRange | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  captionLayout?: React.ComponentProps<typeof DayPicker>['captionLayout']
  fromYear?: number
  toYear?: number
}

const DateRangePicker = ({
  value,
  onValueChange,
  placeholder = 'Pick a date range',
  className,
  disabled,
  captionLayout = 'dropdown',
  fromYear = new Date().getFullYear() - 100,
  toYear = new Date().getFullYear() + 10,
}: DateRangePickerProps) => {
  const [open, setOpen] = React.useState(false)

  const label = React.useMemo(() => {
    if (!value?.from) return placeholder
    if (!value.to) return format(value.from, 'MMMM d, yyyy')
    return `${format(value.from, 'MMMM d, yyyy')} – ${format(value.to, 'MMMM d, yyyy')}`
  }, [value, placeholder])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          aria-label={label}
          className={cn(
            'inline-flex min-w-[220px] items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm',
            'ring-offset-background transition-colors',
            'hover:bg-item-hover',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-accent" />
          <span className={cn('flex-1 text-left', !value?.from && 'text-muted-foreground')}>
            {label}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onValueChange}
          numberOfMonths={2}
          captionLayout={captionLayout}
          fromYear={fromYear}
          toYear={toYear}
        />
      </PopoverContent>
    </Popover>
  )
}
DateRangePicker.displayName = 'DateRangePicker'

export { Calendar, DatePicker, DateRangePicker }
export type { DateRange }
