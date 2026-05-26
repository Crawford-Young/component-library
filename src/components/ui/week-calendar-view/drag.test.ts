import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useDragState } from './drag'
import type { CalendarEvent } from '@/components/ui/calendar-event-chip'

const ev: CalendarEvent = {
  id: 'e1',
  title: 'Test',
  start: '2026-05-04T09:00:00',
  end: '2026-05-04T10:00:00',
}

describe('useDragState', () => {
  it('initial state is idle', () => {
    const { result } = renderHook(() => useDragState())
    expect(result.current[0].type).toBe('idle')
  })

  it('startCreate transitions to creating mode', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startCreate(2, 36))
    const mode = result.current[0]
    expect(mode.type).toBe('creating')
    if (mode.type === 'creating') {
      expect(mode.dayIdx).toBe(2)
      expect(mode.startSlot).toBe(36)
      expect(mode.currentSlot).toBe(36)
    }
  })

  it('startMove transitions to moving mode', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startMove(ev, 1, 2, 100, 200))
    const mode = result.current[0]
    expect(mode.type).toBe('moving')
    if (mode.type === 'moving') {
      expect(mode.event.id).toBe('e1')
      expect(mode.dayIdx).toBe(1)
      expect(mode.slotOffset).toBe(2)
      expect(mode.initClientX).toBe(100)
      expect(mode.initClientY).toBe(200)
    }
  })

  it('startResize transitions to resizing mode', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startResize(ev, 3, 40))
    const mode = result.current[0]
    expect(mode.type).toBe('resizing')
    if (mode.type === 'resizing') {
      expect(mode.event.id).toBe('e1')
      expect(mode.dayIdx).toBe(3)
      expect(mode.currentSlot).toBe(40)
    }
  })

  it('updateSlot changes currentSlot and dayIdx in creating mode', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startCreate(0, 32))
    act(() => result.current[1].updateSlot(1, 40))
    const mode = result.current[0]
    expect(mode.type).toBe('creating')
    if (mode.type === 'creating') {
      expect(mode.dayIdx).toBe(1)
      expect(mode.currentSlot).toBe(40)
    }
  })

  it('updateSlot changes currentSlot in resizing mode', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startResize(ev, 2, 36))
    act(() => result.current[1].updateSlot(2, 44))
    const mode = result.current[0]
    expect(mode.type).toBe('resizing')
    if (mode.type === 'resizing') {
      expect(mode.currentSlot).toBe(44)
    }
  })

  it('updateSlot changes dayIdx and currentSlot in moving mode', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startMove(ev, 0, 0, 0, 0))
    act(() => result.current[1].updateSlot(3, 36))
    const mode = result.current[0]
    expect(mode.type).toBe('moving')
    if (mode.type === 'moving') {
      expect(mode.dayIdx).toBe(3)
      expect(mode.currentSlot).toBe(36)
    }
  })

  it('tryDisambiguate does nothing below 8px threshold', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startMove(ev, 0, 0, 100, 200))
    act(() => result.current[1].tryDisambiguate(5, 1))
    expect(result.current[0].type).toBe('moving')
  })

  it('tryDisambiguate transitions to duplicating when deltaX > deltaY and >= 8px', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startMove(ev, 2, 0, 100, 200))
    act(() => result.current[1].tryDisambiguate(30, 5))
    const mode = result.current[0]
    expect(mode.type).toBe('duplicating')
    if (mode.type === 'duplicating') {
      expect(mode.startDayIdx).toBe(2)
      expect(mode.currentDayIdx).toBe(2)
    }
  })

  it('tryDisambiguate stays moving when deltaY > deltaX beyond 8px', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startMove(ev, 0, 0, 100, 200))
    act(() => result.current[1].tryDisambiguate(5, 30))
    expect(result.current[0].type).toBe('moving')
  })

  it('updateSlot changes currentDayIdx in duplicating mode', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startMove(ev, 1, 0, 100, 200))
    act(() => result.current[1].tryDisambiguate(30, 5))
    act(() => result.current[1].updateSlot(4, 36))
    const mode = result.current[0]
    expect(mode.type).toBe('duplicating')
    if (mode.type === 'duplicating') {
      expect(mode.currentDayIdx).toBe(4)
    }
  })

  it('reset returns to idle from any mode', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startCreate(0, 32))
    act(() => result.current[1].reset())
    expect(result.current[0].type).toBe('idle')
  })
})
