import * as React from 'react'

/**
 * A single day's awake window: valid hours run `wake` (inclusive) → `sleep` (exclusive).
 * Both accept fractional hours (e.g. `6.5` = 6:30am) for minute-granularity windows.
 */
export interface DayWindow {
  readonly wake: number
  readonly sleep: number
}

interface SleepBandBaseProps {
  readonly hourStart: number
  readonly hourCount: number
  readonly hourHeight: number
  /** When true, blocks pointer events (drag/click) in sleep hours. When false, visual only. Default: true. */
  readonly interactive?: boolean
}

/** Global wrapping sleep window (sleepStart → sleepEnd across midnight). */
interface SleepBandWrapProps extends SleepBandBaseProps {
  readonly sleepStart: number
  readonly sleepEnd: number
  readonly awakeWindow?: undefined
}

/** Per-day awake window: shade the parts of the visible range outside wake → sleep. */
interface SleepBandAwakeProps extends SleepBandBaseProps {
  readonly awakeWindow: DayWindow
  readonly sleepStart?: undefined
  readonly sleepEnd?: undefined
}

export type SleepBandProps = SleepBandWrapProps | SleepBandAwakeProps

interface RegionStyle {
  top: string
  height: string
}

export function computeRegion(
  regionStart: number,
  regionEnd: number,
  hourStart: number,
  hourCount: number,
): RegionStyle | null {
  const visEnd = hourStart + hourCount
  const clampedStart = Math.max(regionStart, hourStart)
  const clampedEnd = Math.min(regionEnd, visEnd)
  if (clampedEnd <= clampedStart) return null
  return {
    top: `${((clampedStart - hourStart) / hourCount) * 100}%`,
    height: `${((clampedEnd - clampedStart) / hourCount) * 100}%`,
  }
}

const stripeBackground =
  'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 8px)'

const HOURS_PER_DAY = 24

export function SleepBand(props: SleepBandProps): React.JSX.Element {
  const { hourStart, hourCount, interactive = true } = props
  const topRegion = props.awakeWindow
    ? computeRegion(hourStart, props.awakeWindow.wake, hourStart, hourCount)
    : computeRegion(0, props.sleepEnd, hourStart, hourCount)
  const bottomRegion = props.awakeWindow
    ? computeRegion(props.awakeWindow.sleep, hourStart + hourCount, hourStart, hourCount)
    : computeRegion(props.sleepStart, HOURS_PER_DAY, hourStart, hourCount)
  const regionStyle: React.CSSProperties = {
    backgroundImage: stripeBackground,
    pointerEvents: interactive ? 'auto' : 'none',
  }

  return (
    <>
      {topRegion && (
        <div
          data-testid="sleep-region"
          aria-hidden="true"
          className="absolute inset-x-0 z-10 bg-muted/40"
          style={{ ...topRegion, ...regionStyle }}
        />
      )}
      {bottomRegion && (
        <div
          data-testid="sleep-region"
          aria-hidden="true"
          className="absolute inset-x-0 z-10 bg-muted/40"
          style={{ ...bottomRegion, ...regionStyle }}
        />
      )}
    </>
  )
}
