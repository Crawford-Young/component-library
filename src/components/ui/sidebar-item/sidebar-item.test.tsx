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

describe('asChild', () => {
  it('renders the child element instead of an anchor', () => {
    render(
      <SidebarItem asChild icon={<svg data-testid="icon" />} label="Calendar" href="/calendar">
        <button type="button" data-testid="slotted" />
      </SidebarItem>,
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByTestId('slotted')).toBeInTheDocument()
  })

  it('injects icon and label inside the child element', () => {
    render(
      <SidebarItem asChild icon={<svg data-testid="icon" />} label="Calendar" href="/calendar">
        <button type="button" data-testid="slotted" />
      </SidebarItem>,
    )
    const child = screen.getByTestId('slotted')
    expect(child).toContainElement(screen.getByTestId('icon'))
    expect(child).toHaveTextContent('Calendar')
  })

  it('merges aria-current and item classes onto the child when active', () => {
    render(
      <SidebarItem asChild icon={<svg />} label="Calendar" href="/calendar" isActive>
        <button type="button" data-testid="slotted" />
      </SidebarItem>,
    )
    const child = screen.getByTestId('slotted')
    expect(child).toHaveAttribute('aria-current', 'page')
    expect(child.className).toContain('rounded-md')
  })

  it('preserves the child element own children', () => {
    render(
      <SidebarItem asChild icon={<svg />} label="Calendar" href="/calendar">
        <button type="button">
          <span data-testid="reporter" />
        </button>
      </SidebarItem>,
    )
    expect(screen.getByTestId('reporter')).toBeInTheDocument()
  })
})
