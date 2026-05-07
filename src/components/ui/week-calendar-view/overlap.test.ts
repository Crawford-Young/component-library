import { describe, expect, it } from 'vitest'
import { buildOverlapLayout } from './overlap'

const e = (id: string, start: string, end: string) => ({ id, start, end })

describe('buildOverlapLayout', () => {
  it('returns empty array for no events', () => {
    expect(buildOverlapLayout([])).toEqual([])
  })

  it('gives single event column 0, totalColumns 1', () => {
    const result = buildOverlapLayout([e('1', '2026-05-04T09:00', '2026-05-04T10:00')])
    expect(result).toEqual([
      { event: e('1', '2026-05-04T09:00', '2026-05-04T10:00'), column: 0, totalColumns: 1 },
    ])
  })

  it('gives non-overlapping events separate column 0 each, totalColumns 1', () => {
    const events = [
      e('1', '2026-05-04T09:00', '2026-05-04T10:00'),
      e('2', '2026-05-04T11:00', '2026-05-04T12:00'),
    ]
    const result = buildOverlapLayout(events)
    expect(result.find((r) => r.event.id === '1')).toMatchObject({ column: 0, totalColumns: 1 })
    expect(result.find((r) => r.event.id === '2')).toMatchObject({ column: 0, totalColumns: 1 })
  })

  it('gives two overlapping events columns 0 and 1, totalColumns 2 each', () => {
    const events = [
      e('1', '2026-05-04T09:00', '2026-05-04T10:00'),
      e('2', '2026-05-04T09:30', '2026-05-04T10:30'),
    ]
    const result = buildOverlapLayout(events)
    expect(result.find((r) => r.event.id === '1')).toMatchObject({ column: 0, totalColumns: 2 })
    expect(result.find((r) => r.event.id === '2')).toMatchObject({ column: 1, totalColumns: 2 })
  })

  it('gives three-way overlapping events columns 0, 1, 2 with totalColumns 3', () => {
    const events = [
      e('1', '2026-05-04T09:00', '2026-05-04T11:00'),
      e('2', '2026-05-04T09:00', '2026-05-04T11:00'),
      e('3', '2026-05-04T09:00', '2026-05-04T11:00'),
    ]
    const result = buildOverlapLayout(events)
    const cols = result.map((r) => r.column).sort()
    expect(cols).toEqual([0, 1, 2])
    result.forEach((r) => expect(r.totalColumns).toBe(3))
  })

  it('treats adjacent events (end === start) as non-overlapping', () => {
    const events = [
      e('1', '2026-05-04T09:00', '2026-05-04T10:00'),
      e('2', '2026-05-04T10:00', '2026-05-04T11:00'),
    ]
    const result = buildOverlapLayout(events)
    expect(result.find((r) => r.event.id === '1')).toMatchObject({ column: 0, totalColumns: 1 })
    expect(result.find((r) => r.event.id === '2')).toMatchObject({ column: 0, totalColumns: 1 })
  })
})
