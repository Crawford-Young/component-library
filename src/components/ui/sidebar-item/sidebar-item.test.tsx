import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SidebarItem } from './sidebar-item'

describe('SidebarItem', () => {
  it('renders label and link', () => {
    render(<SidebarItem icon={<span>icon</span>} label="Goals" href="/goals" />)
    expect(screen.getByRole('link', { name: /goals/i })).toHaveAttribute('href', '/goals')
  })

  it('applies active styles when isActive=true', () => {
    render(<SidebarItem icon={<span />} label="Goals" href="/goals" isActive />)
    expect(screen.getByRole('link').className).toContain('border-accent')
  })

  it('does not apply active styles when isActive=false', () => {
    render(<SidebarItem icon={<span />} label="Goals" href="/goals" isActive={false} />)
    expect(screen.getByRole('link').className).not.toContain('border-accent')
  })

  it('merges custom className', () => {
    render(<SidebarItem icon={<span />} label="Goals" href="/goals" className="custom" />)
    expect(screen.getByRole('link').className).toContain('custom')
  })
})
