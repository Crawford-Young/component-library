import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SleepBand, computeRegion } from './sleep-band'

function regions(container: HTMLElement): NodeListOf<HTMLElement> {
  return container.querySelectorAll('[data-testid="sleep-region"]')
}

describe('computeRegion', () => {
  it('returns proportional top/height for a region fully inside the visible range', () => {
    const region = computeRegion(2, 5, 0, 10)
    expect(region).toEqual({ top: '20%', height: '30%' })
  })

  it('clamps a region that starts before hourStart', () => {
    const region = computeRegion(-2, 5, 0, 10)
    expect(region).toEqual({ top: '0%', height: '50%' })
  })

  it('clamps a region that ends after the visible end', () => {
    const region = computeRegion(5, 100, 0, 10)
    expect(region).toEqual({ top: '50%', height: '50%' })
  })

  it('honours a non-zero hourStart offset', () => {
    const region = computeRegion(9, 12, 6, 11)
    expect(region).not.toBeNull()
    expect(region!.top).toBe(`${((9 - 6) / 11) * 100}%`)
    expect(region!.height).toBe(`${(3 / 11) * 100}%`)
  })

  it('computes proportional top/height for fractional-hour boundaries', () => {
    const region = computeRegion(6.5, 17, 6, 11)
    expect(region).not.toBeNull()
    expect(region!.top).toBe(`${((6.5 - 6) / 11) * 100}%`)
    expect(region!.height).toBe(`${((17 - 6.5) / 11) * 100}%`)
  })

  it('returns null when the region is entirely after the visible range', () => {
    expect(computeRegion(20, 30, 0, 10)).toBeNull()
  })

  it('returns null when the region is entirely before the visible range', () => {
    expect(computeRegion(-5, -1, 0, 10)).toBeNull()
  })

  it('returns null for a zero-height region (start equals end)', () => {
    expect(computeRegion(5, 5, 0, 10)).toBeNull()
  })
})

describe('SleepBand wrap model (sleepStart/sleepEnd)', () => {
  it('renders morning and evening regions for a wrapping sleep window', () => {
    const { container } = render(
      <SleepBand sleepStart={23} sleepEnd={7} hourStart={0} hourCount={24} hourHeight={30} />,
    )
    expect(regions(container).length).toBe(2)
  })
})

describe('SleepBand awake-window model (per-day)', () => {
  it('renders no regions when the day fills the whole visible window', () => {
    const { container } = render(
      <SleepBand
        awakeWindow={{ wake: 9, sleep: 17 }}
        hourStart={9}
        hourCount={8}
        hourHeight={30}
      />,
    )
    expect(regions(container).length).toBe(0)
  })

  it('renders only a top region when wake is later than the visible start', () => {
    const { container } = render(
      <SleepBand
        awakeWindow={{ wake: 9, sleep: 17 }}
        hourStart={6}
        hourCount={11}
        hourHeight={30}
      />,
    )
    const found = regions(container)
    expect(found.length).toBe(1)
    expect(found[0].style.top).toBe('0%')
    expect(found[0].style.height).toBe(`${(3 / 11) * 100}%`)
  })

  it('renders only a bottom region when sleep is earlier than the visible end', () => {
    const { container } = render(
      <SleepBand
        awakeWindow={{ wake: 9, sleep: 17 }}
        hourStart={9}
        hourCount={14}
        hourHeight={30}
      />,
    )
    const found = regions(container)
    expect(found.length).toBe(1)
    expect(found[0].style.top).toBe(`${((17 - 9) / 14) * 100}%`)
    expect(found[0].style.height).toBe(`${(6 / 14) * 100}%`)
  })

  it('renders both morning and evening wrap regions in full-day mode', () => {
    const { container } = render(
      <SleepBand
        awakeWindow={{ wake: 9, sleep: 17 }}
        hourStart={0}
        hourCount={24}
        hourHeight={30}
      />,
    )
    const found = regions(container)
    expect(found.length).toBe(2)
    // morning 0->9
    expect(found[0].style.top).toBe('0%')
    expect(found[0].style.height).toBe(`${(9 / 24) * 100}%`)
    // evening 17->24
    expect(found[1].style.top).toBe(`${(17 / 24) * 100}%`)
    expect(found[1].style.height).toBe(`${(7 / 24) * 100}%`)
  })

  it('shading is always pointer-events-none so it never blocks chip interaction', () => {
    const { container } = render(
      <SleepBand
        awakeWindow={{ wake: 9, sleep: 17 }}
        hourStart={0}
        hourCount={24}
        hourHeight={30}
      />,
    )
    const found = regions(container)
    expect(found.length).toBe(2)
    found.forEach((r) => expect(r.style.pointerEvents).toBe('none'))
  })
})
