import { describe, it, expect, afterEach } from 'vitest'
import { buildIso, toTimeSlot } from './time'

// Timezone correctness: `buildIso`/`toTimeSlot` must operate on LOCAL wall-clock
// terms — never UTC parts. Every test below pins `process.env.TZ` explicitly
// (rather than trusting the runner's ambient zone) so a regression back to
// UTC-part semantics fails deterministically under CI's UTC runner too.

function restoreTz(original: string | undefined): void {
  if (original === undefined) {
    delete process.env['TZ']
  } else {
    process.env['TZ'] = original
  }
}

describe('buildIso', () => {
  const ORIGINAL_TZ = process.env['TZ']

  afterEach(() => {
    restoreTz(ORIGINAL_TZ)
  })

  it('builds the real UTC instant for a local wall-clock time when the runner TZ is UTC', () => {
    process.env['TZ'] = 'UTC'
    const date = new Date(2026, 5, 13) // local June 13 2026, 00:00
    expect(buildIso(date, '09:30')).toBe('2026-06-13T09:30:00.000Z')
  })

  it('offsets the instant by the runner TZ so 09:30 reads correctly in Asia/Tokyo (UTC+9)', () => {
    process.env['TZ'] = 'Asia/Tokyo'
    const date = new Date(2026, 5, 13)
    // 09:30 local Tokyo (UTC+9) = 00:30 UTC, same calendar day.
    expect(buildIso(date, '09:30')).toBe('2026-06-13T00:30:00.000Z')
  })

  it("anchors on the date parameter's LOCAL day, not its UTC day, near a day boundary", () => {
    process.env['TZ'] = 'Asia/Tokyo'
    // Local June 13 00:30 in Tokyo (+09:00) is June 12 15:30 UTC — UTC and local
    // calendar days disagree here. buildIso must anchor on the LOCAL day (13).
    const date = new Date(2026, 5, 13, 0, 30)
    expect(buildIso(date, '09:30')).toBe('2026-06-13T00:30:00.000Z')
  })
})

describe('toTimeSlot', () => {
  const ORIGINAL_TZ = process.env['TZ']

  afterEach(() => {
    restoreTz(ORIGINAL_TZ)
  })

  it('extracts the LOCAL HH:MM slot from a UTC instant when the runner TZ is UTC', () => {
    process.env['TZ'] = 'UTC'
    expect(toTimeSlot('2026-06-13T09:30:00.000Z')).toBe('09:30')
  })

  it('extracts the LOCAL HH:MM slot from a UTC instant in Asia/Tokyo (UTC+9)', () => {
    process.env['TZ'] = 'Asia/Tokyo'
    expect(toTimeSlot('2026-06-13T09:30:00.000Z')).toBe('18:30')
  })

  it('extracts the LOCAL HH:MM slot from an explicit-offset ISO input', () => {
    process.env['TZ'] = 'UTC'
    // 23:30 at -04:00 = 2026-06-14T03:30:00Z; runner TZ UTC reads that as 03:30.
    expect(toTimeSlot('2026-06-13T23:30:00-04:00')).toBe('03:30')
  })

  it('zero-pads single-digit local hours and minutes', () => {
    process.env['TZ'] = 'UTC'
    expect(toTimeSlot('2026-06-13T04:05:00.000Z')).toBe('04:05')
  })
})

describe('buildIso / toTimeSlot round-trip', () => {
  const ORIGINAL_TZ = process.env['TZ']

  afterEach(() => {
    restoreTz(ORIGINAL_TZ)
  })

  const TIMES = ['00:00', '09:30', '13:45', '23:59'] as const
  const ZONES = ['UTC', 'Asia/Tokyo', 'America/New_York'] as const

  ZONES.forEach((zone) => {
    it.each(TIMES)(`round-trips %s through buildIso/toTimeSlot when TZ=${zone}`, (time) => {
      process.env['TZ'] = zone
      const date = new Date(2026, 5, 13)
      expect(toTimeSlot(buildIso(date, time))).toBe(time)
    })
  })
})
