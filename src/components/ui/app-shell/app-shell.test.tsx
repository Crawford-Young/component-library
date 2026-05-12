import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppShell } from './app-shell'

describe('AppShell', () => {
  it('renders sidebar, topbar and children', () => {
    render(
      <AppShell
        sidebar={<nav data-testid="sidebar">nav</nav>}
        topbar={<header data-testid="topbar">top</header>}
      >
        <main data-testid="content">content</main>
      </AppShell>,
    )
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('topbar')).toBeInTheDocument()
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(
      <AppShell sidebar={<div />} topbar={<div />} className="custom">
        <div />
      </AppShell>,
    )
    expect(container.firstChild).toHaveClass('custom')
  })
})
