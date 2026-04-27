import * as React from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// ─── Calendar ────────────────────────────────────────────────────────────────

type CalendarProps = React.ComponentProps<typeof DayPicker>

const Calendar = ({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) => (
  <DayPicker
    showOutsideDays={showOutsideDays}
    className={cn('p-3', className)}
    classNames={{
      months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
      month: 'space-y-4',
      month_caption: 'relative h-9 flex justify-center items-center',
      caption_label: 'text-sm font-medium text-foreground',
      nav: 'absolute inset-x-0 top-0 flex items-center justify-between h-9',
      button_previous: cn(
        buttonVariants({ variant: 'outline' }),
        'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
      ),
      button_next: cn(
        buttonVariants({ variant: 'outline' }),
        'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
      ),
      dropdowns: 'flex items-center gap-2',
      months_dropdown: cn(
        'text-sm font-medium bg-background text-foreground cursor-pointer',
        'rounded border border-input px-2 py-1',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      ),
      years_dropdown: cn(
        'text-sm font-medium bg-background text-foreground cursor-pointer',
        'rounded border border-input px-2 py-1',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      ),
      month_grid: 'w-full border-collapse space-y-1',
      weekdays: 'flex',
      weekday: 'text-muted-foreground rounded w-9 font-normal text-[0.8rem]',
      week: 'flex w-full mt-2',
      day: cn(
        'h-9 w-9 text-center text-sm p-0 relative',
        'focus-within:relative focus-within:z-20',
      ),
      day_button: cn(
        buttonVariants({ variant: 'ghost' }),
        'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
      ),
      selected:
        'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded',
      today: 'bg-accent text-accent-foreground rounded',
      outside: 'text-muted-foreground opacity-50',
      disabled: 'text-muted-foreground opacity-50',
      range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
      range_start: 'rounded-l-md',
      range_end: 'rounded-r-md',
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
  captionLayout,
  fromYear,
  toYear,
}: DatePickerProps) => {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          aria-label={value ? format(value, 'MMMM d, yyyy') : placeholder}
          className={cn(
            'inline-flex items-center gap-2 rounded border border-input bg-background px-3 py-2 text-sm',
            'ring-offset-background transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {value ? format(value, 'MMMM d, yyyy') : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
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
  captionLayout,
  fromYear,
  toYear,
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
            'inline-flex items-center gap-2 rounded border border-input bg-background px-3 py-2 text-sm',
            'ring-offset-background transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            !value?.from && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
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
