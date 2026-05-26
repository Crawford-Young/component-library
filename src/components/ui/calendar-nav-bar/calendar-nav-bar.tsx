import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type CalendarNavSource = 'prev' | 'next' | 'select' | 'today'

export interface CalendarNavBarProps {
  readonly currentDate: Date
  readonly onDateChange: (date: Date, source?: CalendarNavSource) => void
  readonly className?: string
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const CURRENT_YEAR = new Date().getFullYear()

function clampDay(day: number, year: number, month: number): number {
  return Math.min(day, new Date(year, month + 1, 0).getDate())
}

function getSundayOf(d: Date): string {
  const copy = new Date(d)
  copy.setDate(copy.getDate() - copy.getDay())
  return `${copy.getFullYear()}-${String(copy.getMonth() + 1).padStart(2, '0')}-${String(copy.getDate()).padStart(2, '0')}`
}

export function CalendarNavBar({
  currentDate,
  onDateChange,
  className,
}: CalendarNavBarProps): React.JSX.Element {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const day = currentDate.getDate()

  const years = Array.from({ length: 21 }, (_, i) => CURRENT_YEAR - 10 + i)

  function handlePrev(): void {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 7)
    onDateChange(d, 'prev')
  }

  function handleNext(): void {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 7)
    onDateChange(d, 'next')
  }

  function handleDayChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    onDateChange(new Date(year, month, clampDay(Number(e.target.value), year, month)), 'select')
  }

  function handleMonthChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    const newMonth = Number(e.target.value)
    onDateChange(new Date(year, newMonth, clampDay(day, year, newMonth)), 'select')
  }

  function handleYearChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    const newYear = Number(e.target.value)
    onDateChange(new Date(newYear, month, clampDay(day, newYear, month)), 'select')
  }

  const isCurrentWeek = getSundayOf(currentDate) === getSundayOf(new Date())

  function handleToday(): void {
    onDateChange(new Date(), 'today')
  }

  return (
    <div className={cn('flex items-center justify-between border-b px-2 py-1.5', className)}>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isCurrentWeek}
          onClick={handleToday}
        >
          Today
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Previous week"
          onClick={handlePrev}
        >
          ←
        </Button>
      </div>
      <div className="flex items-center gap-1">
        <select
          aria-label="Day"
          value={day}
          onChange={handleDayChange}
          className="rounded border bg-background px-1 py-0.5 text-xs"
        >
          {Array.from({ length: 31 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
        <select
          aria-label="Month"
          value={month}
          onChange={handleMonthChange}
          className="rounded border bg-background px-1 py-0.5 text-xs"
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i}>
              {m}
            </option>
          ))}
        </select>
        <select
          aria-label="Year"
          value={year}
          onChange={handleYearChange}
          className="rounded border bg-background px-1 py-0.5 text-xs"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <Button type="button" variant="ghost" size="sm" aria-label="Next week" onClick={handleNext}>
        →
      </Button>
    </div>
  )
}
