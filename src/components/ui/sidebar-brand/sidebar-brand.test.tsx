import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SidebarContext } from '@/components/ui/sidebar/sidebar-context'
import { SidebarBrand } from './sidebar-brand'

const logo = <img src="/logo.png" alt="logo" />

describe('SidebarBrand', () => {
  it('renders logo and title when expanded', () => {
    render(
      <SidebarContext.Provider value={{ collapsed: false }}>
        <SidebarBrand logo={logo} title="Cybond" />
      </SidebarContext.Provider>,
    )
    expect(screen.getByAltText('logo')).toBeInTheDocument()
    expect(screen.getByText('Cybond')).toBeInTheDocument()
  })

  it('renders logo when collapsed', () => {
    render(
      <SidebarContext.Provider value={{ collapsed: true }}>
        <SidebarBrand logo={logo} title="Cybond" />
      </SidebarContext.Provider>,
    )
    expect(screen.getByAltText('logo')).toBeInTheDocument()
  })

  it('hides title visually when collapsed', () => {
    render(
      <SidebarContext.Provider value={{ collapsed: true }}>
        <SidebarBrand logo={logo} title="Cybond" />
      </SidebarContext.Provider>,
    )
    const title = screen.getByText('Cybond')
    expect(title.className).toContain('opacity-0')
    expect(title.className).toContain('w-0')
  })

  it('shows title visually when expanded', () => {
    render(
      <SidebarContext.Provider value={{ collapsed: false }}>
        <SidebarBrand logo={logo} title="Cybond" />
      </SidebarContext.Provider>,
    )
    const title = screen.getByText('Cybond')
    expect(title.className).not.toContain('opacity-0')
  })

  it('logo slot is always fixed-width centered', () => {
    const { container } = render(
      <SidebarContext.Provider value={{ collapsed: true }}>
        <SidebarBrand logo={logo} title="Cybond" />
      </SidebarContext.Provider>,
    )
    const logoSlot = container.firstChild?.firstChild as HTMLElement
    expect(logoSlot).toHaveClass('w-14')
    expect(logoSlot).toHaveClass('justify-center')
  })

  it('title has flex-1 when expanded', () => {
    render(
      <SidebarContext.Provider value={{ collapsed: false }}>
        <SidebarBrand logo={logo} title="Cybond" />
      </SidebarContext.Provider>,
    )
    const title = screen.getByText('Cybond')
    expect(title.className).toContain('flex-1')
  })

  it('applies handoffName as the title view-transition-name', () => {
    render(
      <SidebarContext.Provider value={{ collapsed: false }}>
        <SidebarBrand logo={logo} title="Cybond" handoffName="brand-wordmark" />
      </SidebarContext.Provider>,
    )
    const title = screen.getByText('Cybond')
    expect(title.style.viewTransitionName).toBe('brand-wordmark')
  })

  it('transitions the title on motion tokens, not raw duration literals', () => {
    render(
      <SidebarContext.Provider value={{ collapsed: false }}>
        <SidebarBrand logo={logo} title="Cybond" />
      </SidebarContext.Provider>,
    )
    const title = screen.getByText('Cybond')
    expect(title.className).toContain('duration-base')
    expect(title.className).not.toContain('duration-200')
  })

  it('applies custom className', () => {
    const { container } = render(
      <SidebarContext.Provider value={{ collapsed: false }}>
        <SidebarBrand logo={logo} title="Cybond" className="custom-class" />
      </SidebarContext.Provider>,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders as div when no href', () => {
    const { container } = render(
      <SidebarContext.Provider value={{ collapsed: false }}>
        <SidebarBrand logo={logo} title="Cybond" />
      </SidebarContext.Provider>,
    )
    expect(container.firstChild?.nodeName).toBe('DIV')
  })

  it('renders as anchor when href provided', () => {
    render(
      <SidebarContext.Provider value={{ collapsed: false }}>
        <SidebarBrand logo={logo} title="Cybond" href="/" />
      </SidebarContext.Provider>,
    )
    expect(screen.getByRole('link')).toHaveAttribute('href', '/')
  })

  it('applies hover styles when href provided', () => {
    render(
      <SidebarContext.Provider value={{ collapsed: false }}>
        <SidebarBrand logo={logo} title="Cybond" href="/" />
      </SidebarContext.Provider>,
    )
    expect(screen.getByRole('link').className).toContain('hover:bg-muted')
  })
})
