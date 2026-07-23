'use client'

import * as React from 'react'

import { eventColorVariants, type CalendarEventColor } from '@/components/ui/calendar-event-chip'
import { cn } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────────────────────

/** The full swatch set — same list the calendar chip's color union enumerates. */
export const EVENT_COLORS: readonly CalendarEventColor[] = [
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

const SWATCH_SIZE_CLASSES = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
} as const

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColorSwatchPickerProps {
  readonly value: CalendarEventColor
  readonly onChange: (color: CalendarEventColor) => void
  readonly label?: string
  readonly size?: 'sm' | 'md'
  readonly className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ColorSwatchPicker({
  value,
  onChange,
  label = 'Color',
  size = 'md',
  className,
}: ColorSwatchPickerProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)} role="group" aria-label={label}>
      {EVENT_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`Color: ${c}`}
          aria-pressed={value === c}
          onClick={() => onChange(c)}
          className={cn(
            eventColorVariants({ color: c }),
            SWATCH_SIZE_CLASSES[size],
            'cursor-pointer overflow-visible rounded-full p-0',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            value === c && 'ring-2 ring-ring ring-offset-1',
          )}
        />
      ))}
    </div>
  )
}

ColorSwatchPicker.displayName = 'ColorSwatchPicker'
