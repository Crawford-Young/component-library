import * as React from 'react'
import { cn } from '@/lib/utils'

export interface NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'type'
> {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, min, max, step = 1, disabled, className, ...props }, ref) => {
    const decrement = () => {
      const next = value - step
      onChange(min !== undefined ? Math.max(next, min) : next)
    }

    const increment = () => {
      const next = value + step
      onChange(max !== undefined ? Math.min(next, max) : next)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseFloat(e.target.value)
      if (!isNaN(parsed)) onChange(parsed)
    }

    const atMin = min !== undefined && value <= min
    const atMax = max !== undefined && value >= max

    return (
      <div
        className={cn(
          'flex h-10 rounded border border-input bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <button
          type="button"
          aria-label="Decrement"
          onClick={decrement}
          disabled={disabled || atMin}
          className="px-3 text-muted-foreground hover:text-foreground disabled:pointer-events-none"
        >
          −
        </button>
        <input
          ref={ref}
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="w-full bg-transparent text-center focus:outline-none disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          {...props}
        />
        <button
          type="button"
          aria-label="Increment"
          onClick={increment}
          disabled={disabled || atMax}
          className="px-3 text-muted-foreground hover:text-foreground disabled:pointer-events-none"
        >
          +
        </button>
      </div>
    )
  },
)
NumberInput.displayName = 'NumberInput'
