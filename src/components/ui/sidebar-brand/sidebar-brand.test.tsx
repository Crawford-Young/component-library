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

  it('applies collapsed layout class when collapsed', () => {
    const { container } = render(
      <SidebarContext.Provider value={{ collapsed: true }}>
        <SidebarBrand logo={logo} title="Cybond" />
      </SidebarContext.Provider>,
    )
    expect(container.firstChild).toHaveClass('justify-center')
  })

  it('applies expanded layout class when expanded', () => {
    const { container } = render(
      <SidebarContext.Provider value={{ collapsed: false }}>
        <SidebarBrand logo={logo} title="Cybond" />
      </SidebarContext.Provider>,
    )
    expect(container.firstChild).toHaveClass('gap-2.5')
  })

  it('applies custom className', () => {
    const { container } = render(
      <SidebarContext.Provider value={{ collapsed: false }}>
        <SidebarBrand logo={logo} title="Cybond" className="custom-class" />
      </SidebarContext.Provider>,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
