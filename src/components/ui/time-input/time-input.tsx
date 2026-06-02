import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface TimeInputProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly id?: string
  readonly label?: string
  readonly disabled?: boolean
  readonly className?: string
  readonly use24h?: boolean
}

function parse12h(time: string): { hour: number; minute: number; ampm: 'AM' | 'PM' } {
  const [hStr = '0', mStr = '0'] = time.split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  return {
    hour: h % 12 === 0 ? 12 : h % 12,
    minute: m,
    ampm: h < 12 ? 'AM' : 'PM',
  }
}

function to24h(hour: number, minute: number, ampm: 'AM' | 'PM'): string {
  let h = hour === 12 ? 0 : hour
  if (ampm === 'PM') h += 12
  return `${h.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

function parseMilitary(time: string): { hour: number; minute: number } {
  const [hStr = '0', mStr = '0'] = time.split(':')
  return { hour: parseInt(hStr, 10), minute: parseInt(mStr, 10) }
}

function emitMilitary(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

function incrementHour12(hour: number, ampm: 'AM' | 'PM'): { hour: number; ampm: 'AM' | 'PM' } {
  if (hour === 11) return { hour: 12, ampm: ampm === 'AM' ? 'PM' : 'AM' }
  if (hour === 12) return { hour: 1, ampm }
  return { hour: hour + 1, ampm }
}

function decrementHour12(hour: number, ampm: 'AM' | 'PM'): { hour: number; ampm: 'AM' | 'PM' } {
  if (hour === 12) return { hour: 11, ampm: ampm === 'AM' ? 'PM' : 'AM' }
  if (hour === 1) return { hour: 12, ampm }
  return { hour: hour - 1, ampm }
}

const spinnerCls =
  'flex h-7 rounded border border-input bg-background text-xs ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
const btnCls =
  'px-1.5 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50'
const numCls =
  'w-8 bg-transparent text-center text-foreground focus:outline-none disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

export function TimeInput({
  value,
  onChange,
  id,
  label,
  disabled,
  className,
  use24h = false,
}: TimeInputProps): React.JSX.Element {
  const hourRef = useRef<HTMLInputElement>(null)
  const minuteRef = useRef<HTMLInputElement>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const parsed12 = !use24h ? parse12h(value) : { hour: 12, minute: 0, ampm: 'AM' as const }
  const parsedMil = use24h ? parseMilitary(value) : { hour: 0, minute: 0 }

  const hour = use24h ? parsedMil.hour : parsed12.hour
  const minute = use24h ? parsedMil.minute : parsed12.minute
  const ampm = parsed12.ampm

  // Local display state — free-type until blur/Enter
  const [hourStr, setHourStr] = useState<string>(() =>
    use24h ? String(hour).padStart(2, '0') : String(hour),
  )
  const [minuteStr, setMinuteStr] = useState<string>(() => String(minute).padStart(2, '0'))
  const hourFocused = useRef(false)
  const minuteFocused = useRef(false)

  // Sync display from props when not focused
  useEffect(() => {
    if (!hourFocused.current) {
      setHourStr(use24h ? String(hour).padStart(2, '0') : String(hour))
    }
    if (!minuteFocused.current) {
      setMinuteStr(String(minute).padStart(2, '0'))
    }
  }, [hour, minute, use24h])

  const stateRef = useRef({ hour, minute, ampm, use24h })
  stateRef.current = { hour, minute, ampm, use24h }

  const hourLabel = label !== undefined ? `${label} hour` : 'Hour'
  const minuteLabel = label !== undefined ? `${label} minute` : 'Minute'

  useEffect(() => {
    const hourEl = hourRef.current
    const minEl = minuteRef.current
    /* v8 ignore next */
    if (!hourEl || !minEl) return

    const handleHourWheel = (e: WheelEvent): void => {
      e.preventDefault()
      const s = stateRef.current
      if (s.use24h) {
        onChangeRef.current(
          emitMilitary(
            e.deltaY < 0 ? (s.hour === 23 ? 0 : s.hour + 1) : s.hour === 0 ? 23 : s.hour - 1,
            s.minute,
          ),
        )
      } else {
        const next =
          e.deltaY < 0 ? incrementHour12(s.hour, s.ampm) : decrementHour12(s.hour, s.ampm)
        onChangeRef.current(to24h(next.hour, s.minute, next.ampm))
      }
    }

    const handleMinWheel = (e: WheelEvent): void => {
      e.preventDefault()
      const s = stateRef.current
      const nextMin =
        e.deltaY < 0 ? (s.minute === 59 ? 0 : s.minute + 1) : s.minute === 0 ? 59 : s.minute - 1
      onChangeRef.current(s.use24h ? emitMilitary(s.hour, nextMin) : to24h(s.hour, nextMin, s.ampm))
    }

    hourEl.addEventListener('wheel', handleHourWheel, { passive: false })
    minEl.addEventListener('wheel', handleMinWheel, { passive: false })

    return () => {
      hourEl.removeEventListener('wheel', handleHourWheel)
      minEl.removeEventListener('wheel', handleMinWheel)
    }
  }, [])

  function commitHour(): void {
    const v = parseInt(hourStr, 10)
    const s = stateRef.current
    if (isNaN(v) || v < 0 || v > 23) {
      setHourStr(s.use24h ? String(s.hour).padStart(2, '0') : String(s.hour))
      return
    }
    if (s.use24h) {
      onChangeRef.current(emitMilitary(v, s.minute))
    } else {
      // 0 → 12 AM, 1-12 → keep current AM/PM, 13-23 → PM
      if (v === 0) {
        onChangeRef.current(to24h(12, s.minute, 'AM'))
      } else if (v <= 12) {
        onChangeRef.current(to24h(v, s.minute, s.ampm))
      } else {
        onChangeRef.current(to24h(v - 12, s.minute, 'PM'))
      }
    }
  }

  function commitMinute(): void {
    const v = parseInt(minuteStr, 10)
    const s = stateRef.current
    if (isNaN(v) || v < 0 || v > 59) {
      setMinuteStr(String(s.minute).padStart(2, '0'))
      return
    }
    onChangeRef.current(s.use24h ? emitMilitary(s.hour, v) : to24h(s.hour, v, s.ampm))
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Hour */}
      <div className={spinnerCls}>
        <button
          type="button"
          aria-label="Decrement hour"
          disabled={disabled}
          onClick={() => {
            if (use24h) {
              onChange(emitMilitary(hour === 0 ? 23 : hour - 1, minute))
            } else {
              const next = decrementHour12(hour, ampm)
              onChange(to24h(next.hour, minute, next.ampm))
            }
          }}
          className={btnCls}
        >
          −
        </button>
        <input
          ref={hourRef}
          id={id}
          type="text"
          inputMode="numeric"
          role="spinbutton"
          aria-valuemin={use24h ? 0 : 1}
          aria-valuemax={use24h ? 23 : 12}
          aria-valuenow={hour}
          value={hourStr}
          aria-label={hourLabel}
          disabled={disabled}
          onChange={(e) => setHourStr(e.target.value)}
          onFocus={() => {
            hourFocused.current = true
          }}
          onBlur={() => {
            hourFocused.current = false
            commitHour()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitHour()
          }}
          className={numCls}
        />
        <button
          type="button"
          aria-label="Increment hour"
          disabled={disabled}
          onClick={() => {
            if (use24h) {
              onChange(emitMilitary(hour === 23 ? 0 : hour + 1, minute))
            } else {
              const next = incrementHour12(hour, ampm)
              onChange(to24h(next.hour, minute, next.ampm))
            }
          }}
          className={btnCls}
        >
          +
        </button>
      </div>

      <span className="text-xs text-muted-foreground" aria-hidden="true">
        :
      </span>

      {/* Minute */}
      <div className={spinnerCls}>
        <button
          type="button"
          aria-label="Decrement minute"
          disabled={disabled}
          onClick={() =>
            onChange(
              use24h
                ? emitMilitary(hour, minute === 0 ? 59 : minute - 1)
                : to24h(hour, minute === 0 ? 59 : minute - 1, ampm),
            )
          }
          className={btnCls}
        >
          −
        </button>
        <input
          ref={minuteRef}
          type="text"
          inputMode="numeric"
          role="spinbutton"
          aria-valuemin={0}
          aria-valuemax={59}
          aria-valuenow={minute}
          value={minuteStr}
          aria-label={minuteLabel}
          disabled={disabled}
          onChange={(e) => setMinuteStr(e.target.value)}
          onFocus={() => {
            minuteFocused.current = true
          }}
          onBlur={() => {
            minuteFocused.current = false
            commitMinute()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitMinute()
          }}
          className={numCls}
        />
        <button
          type="button"
          aria-label="Increment minute"
          disabled={disabled}
          onClick={() =>
            onChange(
              use24h
                ? emitMilitary(hour, minute === 59 ? 0 : minute + 1)
                : to24h(hour, minute === 59 ? 0 : minute + 1, ampm),
            )
          }
          className={btnCls}
        >
          +
        </button>
      </div>

      {/* AM/PM — 12h mode only */}
      {!use24h && (
        <div className="flex h-7 overflow-hidden rounded border border-input text-xs">
          <button
            type="button"
            aria-label="AM"
            aria-pressed={ampm === 'AM'}
            disabled={disabled}
            onClick={() => onChange(to24h(hour, minute, 'AM'))}
            className={cn(
              'px-1.5 transition-colors disabled:pointer-events-none disabled:opacity-50',
              ampm === 'AM'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            AM
          </button>
          <button
            type="button"
            aria-label="PM"
            aria-pressed={ampm === 'PM'}
            disabled={disabled}
            onClick={() => onChange(to24h(hour, minute, 'PM'))}
            className={cn(
              'px-1.5 transition-colors disabled:pointer-events-none disabled:opacity-50',
              ampm === 'PM'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            PM
          </button>
        </div>
      )}
    </div>
  )
}
