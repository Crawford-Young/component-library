import { describe, it, expect } from 'vitest'
import { buildIso, toTimeSlot } from './time'

describe('buildIso', () => {
  it('builds a UTC ISO from a date and HH:MM using UTC date parts', () => {
    const date = new Date(Date.UTC(2026, 5, 13, 0, 0, 0)) // 2026-06-13
    expect(buildIso(date, '09:30')).toBe('2026-06-13T09:30:00.000Z')
  })
})

describe('toTimeSlot', () => {
  it('extracts UTC HH:MM from an ISO string', () => {
    expect(toTimeSlot('2026-06-13T09:30:00.000Z')).toBe('09:30')
  })
  it('zero-pads single-digit hours and minutes', () => {
    expect(toTimeSlot('2026-06-13T04:05:00.000Z')).toBe('04:05')
  })
})
