import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { XpBar } from './xp-bar'

describe('XpBar', () => {
  it('renders level name', () => {
    render(<XpBar levelName="Seedling" currentXp={120} maxXp={500} />)
    expect(screen.getByText('Seedling')).toBeInTheDocument()
  })

  it('renders current and max xp', () => {
    render(<XpBar levelName="Seedling" currentXp={120} maxXp={500} />)
    expect(screen.getByText('120 / 500 pts')).toBeInTheDocument()
  })

  it('sets progress bar width proportionally', () => {
    const { container } = render(<XpBar levelName="Seedling" currentXp={250} maxXp={500} />)
    const indicator = container.querySelector('[data-testid="xp-indicator"]')
    expect(indicator).toHaveStyle({ width: '50%' })
  })

  it('clamps progress to 100% when currentXp >= maxXp', () => {
    const { container } = render(<XpBar levelName="Evergreen" currentXp={600} maxXp={500} />)
    const indicator = container.querySelector('[data-testid="xp-indicator"]')
    expect(indicator).toHaveStyle({ width: '100%' })
  })
})
