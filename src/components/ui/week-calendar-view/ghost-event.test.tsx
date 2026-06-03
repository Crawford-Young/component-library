import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GhostEvent } from './ghost-event'

describe('GhostEvent time label', () => {
  it('shows time label when endSlot - startSlot >= 2', () => {
    render(
      <div style={{ position: 'relative', height: '800px' }}>
        <GhostEvent startSlot={36} endSlot={40} hourStart={8} hourCount={14} />
      </div>,
    )
    const ghost = screen.getByTestId('ghost-event')
    expect(ghost.textContent).toContain('9:00')
    expect(ghost.textContent).toContain('10:00')
  })

  it('does not show time label when endSlot - startSlot < 2', () => {
    render(
      <div style={{ position: 'relative', height: '800px' }}>
        <GhostEvent startSlot={36} endSlot={37} hourStart={8} hourCount={14} />
      </div>,
    )
    const ghost = screen.getByTestId('ghost-event')
    expect(ghost.textContent).toBe('')
  })

  it('formats half-hour correctly in time label', () => {
    render(
      <div style={{ position: 'relative', height: '800px' }}>
        <GhostEvent startSlot={36} endSlot={42} hourStart={8} hourCount={14} />
      </div>,
    )
    const ghost = screen.getByTestId('ghost-event')
    expect(ghost.textContent).toContain('9:00')
    expect(ghost.textContent).toContain('10:30')
  })

  it('formats noon correctly (slot 48 = 12:00)', () => {
    render(
      <div style={{ position: 'relative', height: '800px' }}>
        <GhostEvent startSlot={48} endSlot={52} hourStart={0} hourCount={24} />
      </div>,
    )
    const ghost = screen.getByTestId('ghost-event')
    expect(ghost.textContent).toContain('12:00')
  })
})

describe('GhostEvent label prop', () => {
  it('renders label text when label prop is provided', () => {
    render(
      <div style={{ position: 'relative', height: '800px' }}>
        <GhostEvent startSlot={36} endSlot={40} hourStart={8} hourCount={14} label="Copy" />
      </div>,
    )
    expect(screen.getByTestId('ghost-event').textContent).toContain('Copy')
  })

  it('does not render label text when label prop is absent', () => {
    render(
      <div style={{ position: 'relative', height: '800px' }}>
        <GhostEvent startSlot={36} endSlot={40} hourStart={8} hourCount={14} />
      </div>,
    )
    expect(screen.getByTestId('ghost-event').textContent).not.toContain('Copy')
  })
})
