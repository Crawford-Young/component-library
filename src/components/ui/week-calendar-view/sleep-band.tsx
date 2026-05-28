import * as React from 'react'

export interface SleepBandProps {
  readonly sleepStart: number
  readonly sleepEnd: number
  readonly hourStart: number
  readonly hourCount: number
  readonly hourHeight: number
  /** When true, blocks pointer events (drag/click) in sleep hours. When false, visual only. Default: true. */
  readonly interactive?: boolean
}

interface RegionStyle {
  top: string
  height: string
}

function computeRegion(
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

export function SleepBand({
  sleepStart,
  sleepEnd,
  hourStart,
  hourCount,
  interactive = true,
}: SleepBandProps): React.JSX.Element {
  const topRegion = computeRegion(0, sleepEnd, hourStart, hourCount)
  const bottomRegion = computeRegion(sleepStart, 24, hourStart, hourCount)
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
