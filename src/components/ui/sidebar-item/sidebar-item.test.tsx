import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SidebarContext } from '@/components/ui/sidebar/sidebar-context'
import { SidebarItem } from './sidebar-item'

function renderWithContext(collapsed: boolean) {
  return render(
    <SidebarContext.Provider value={{ collapsed }}>
      <SidebarItem icon={<span>icon</span>} label="Goals" href="/goals" />
    </SidebarContext.Provider>,
  )
}

describe('SidebarItem', () => {
  it('renders label when expanded', () => {
    renderWithContext(false)
    expect(screen.getByText('Goals')).toBeInTheDocument()
  })

  it('hides label visually when collapsed', () => {
    renderWithContext(true)
    const label = screen.getByText('Goals')
    expect(label.className).toContain('w-0')
  })

  it('renders icon always', () => {
    renderWithContext(true)
    expect(screen.getByText('icon')).toBeInTheDocument()
  })

  it('renders link with correct href', () => {
    renderWithContext(false)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/goals')
  })

  it('marks active link with aria-current=page', () => {
    render(
      <SidebarContext.Provider value={{ collapsed: false }}>
        <SidebarItem icon={<span />} label="Goals" href="/goals" isActive />
      </SidebarContext.Provider>,
    )
    expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'page')
  })

  it('does not set aria-current when not active', () => {
    renderWithContext(false)
    expect(screen.getByRole('link')).not.toHaveAttribute('aria-current')
  })
})
