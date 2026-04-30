import * as React from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
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

const dropdownSelect = cn(
  'appearance-none bg-transparent cursor-pointer',
  'text-sm font-semibold text-foreground',
  'transition-colors hover:text-accent focus:text-accent',
  'focus:outline-none px-0.5 py-0',
)

const Calendar = ({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) => (
  <DayPicker
    showOutsideDays={showOutsideDays}
    className={cn('p-3', className)}
    classNames={{
      months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
      month: 'space-y-3',
      month_caption: 'relative h-9 flex justify-center items-center',
      caption_label: 'text-sm font-semibold text-foreground tracking-tight',
      nav: 'absolute inset-x-0 top-0 flex items-center justify-between h-9',
      button_previous: navBtn,
      button_next: navBtn,
      dropdowns: 'flex items-center gap-0.5',
      months_dropdown: dropdownSelect,
      years_dropdown: dropdownSelect,
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
      Chevron: ({ orientation, ...rest }) => {
        if (orientation === 'left') return <ChevronLeft className="h-4 w-4" {...rest} />
        return <ChevronRight className="h-4 w-4" {...rest} />
      },
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
