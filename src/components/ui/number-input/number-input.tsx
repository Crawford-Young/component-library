import * as React from 'react'
import { cn } from '@/lib/utils'

interface NumberInputBaseProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'type' | 'value'
> {
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
}

export type NumberInputProps = NumberInputBaseProps &
  (
    | { allowEmpty?: false; value: number; onChange: (value: number) => void }
    | { allowEmpty: true; value: number | undefined; onChange: (value: number | undefined) => void }
  )

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, min, max, step = 1, disabled, allowEmpty, className, ...props }, ref) => {
    // `undefined` is only emitted on the allowEmpty arm (guarded at each call);
    // the cast reconciles the union's two onChange signatures for internal calls.
    const emit = onChange as (value: number | undefined) => void

    const decrement = () => {
      if (value === undefined) {
        emit(min ?? 0)
        return
      }
      const next = value - step
      emit(min !== undefined ? Math.max(next, min) : next)
    }

    const increment = () => {
      if (value === undefined) {
        emit(min ?? 0)
        return
      }
      const next = value + step
      emit(max !== undefined ? Math.min(next, max) : next)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (allowEmpty && e.target.value === '') {
        emit(undefined)
        return
      }
      const parsed = parseFloat(e.target.value)
      if (!isNaN(parsed)) emit(parsed)
    }

    const atMin = min !== undefined && value !== undefined && value <= min
    const atMax = max !== undefined && value !== undefined && value >= max

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
          value={value ?? ''}
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
