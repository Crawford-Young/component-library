import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { Sidebar } from './sidebar'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

beforeEach(() => {
  localStorageMock.clear()
  Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })
})

describe('Sidebar', () => {
  it('renders children', () => {
    render(
      <Sidebar>
        <div>nav item</div>
      </Sidebar>,
    )
    expect(screen.getByText('nav item')).toBeInTheDocument()
  })

  it('renders header slot when provided', () => {
    render(
      <Sidebar header={<span>Logo</span>}>
        <div />
      </Sidebar>,
    )
    expect(screen.getByText('Logo')).toBeInTheDocument()
  })

  it('renders footer slot when provided', () => {
    render(
      <Sidebar footer={<span>User</span>}>
        <div />
      </Sidebar>,
    )
    expect(screen.getByText('User')).toBeInTheDocument()
  })

  it('renders collapse toggle button', () => {
    render(
      <Sidebar>
        <div />
      </Sidebar>,
    )
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeInTheDocument()
  })

  it('starts expanded by default', () => {
    render(
      <Sidebar>
        <div />
      </Sidebar>,
    )
    const aside = screen.getByRole('complementary')
    expect(aside.className).toContain('w-64')
  })

  it('collapses when toggle is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Sidebar>
        <div />
      </Sidebar>,
    )
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    const aside = screen.getByRole('complementary')
    expect(aside.className).toContain('w-14')
  })

  it('expands when toggle clicked again', async () => {
    const user = userEvent.setup()
    render(
      <Sidebar>
        <div />
      </Sidebar>,
    )
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    await user.click(screen.getByRole('button', { name: 'Expand sidebar' }))
    const aside = screen.getByRole('complementary')
    expect(aside.className).toContain('w-64')
  })

  it('persists collapsed state to localStorage', async () => {
    const user = userEvent.setup()
    render(
      <Sidebar>
        <div />
      </Sidebar>,
    )
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    expect(localStorageMock.getItem('sidebar-collapsed')).toBe('true')
  })

  it('reads initial state from localStorage', () => {
    localStorageMock.setItem('sidebar-collapsed', 'true')
    render(
      <Sidebar>
        <div />
      </Sidebar>,
    )
    const aside = screen.getByRole('complementary')
    expect(aside.className).toContain('w-14')
  })

  it('shows collapsedHeader when collapsed', async () => {
    const user = userEvent.setup()
    render(
      <Sidebar header={<span>Full Header</span>} collapsedHeader={<span>Logo Only</span>}>
        <div />
      </Sidebar>,
    )
    expect(screen.getByText('Full Header')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    expect(screen.queryByText('Full Header')).not.toBeInTheDocument()
    expect(screen.getByText('Logo Only')).toBeInTheDocument()
  })

  it('restores header when expanded', async () => {
    const user = userEvent.setup()
    render(
      <Sidebar header={<span>Full Header</span>} collapsedHeader={<span>Logo Only</span>}>
        <div />
      </Sidebar>,
    )
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    await user.click(screen.getByRole('button', { name: 'Expand sidebar' }))
    expect(screen.getByText('Full Header')).toBeInTheDocument()
    expect(screen.queryByText('Logo Only')).not.toBeInTheDocument()
  })

  it('defaults to expanded when localStorage access throws (SSR / privacy mode)', () => {
    const spy = vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new ReferenceError('localStorage is not defined')
    })
    render(
      <Sidebar>
        <div />
      </Sidebar>,
    )
    const aside = screen.getByRole('complementary')
    expect(aside.className).toContain('w-64')
    spy.mockRestore()
  })

  it('shows header when collapsed with no collapsedHeader provided', async () => {
    const user = userEvent.setup()
    render(
      <Sidebar header={<span>Always Header</span>}>
        <div />
      </Sidebar>,
    )
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    expect(screen.getByText('Always Header')).toBeInTheDocument()
  })

  it('controlled: renders collapsed from the prop and ignores localStorage', () => {
    localStorage.setItem('sidebar-collapsed', 'false')
    render(<Sidebar collapsed>{<span>nav</span>}</Sidebar>)
    expect(screen.getByLabelText('Main sidebar').className).toContain('w-14')
  })

  it('controlled: toggle fires onCollapsedChange without writing localStorage', async () => {
    localStorage.removeItem('sidebar-collapsed')
    const handler = vi.fn()
    render(
      <Sidebar collapsed={false} onCollapsedChange={handler}>
        <span>nav</span>
      </Sidebar>,
    )
    await userEvent.click(screen.getByLabelText('Collapse sidebar'))
    expect(handler).toHaveBeenCalledWith(true)
    expect(localStorage.getItem('sidebar-collapsed')).toBeNull()
  })

  it('uncontrolled: toggle still persists to localStorage and fires onCollapsedChange', async () => {
    localStorage.removeItem('sidebar-collapsed')
    const handler = vi.fn()
    render(<Sidebar onCollapsedChange={handler}>{<span>nav</span>}</Sidebar>)
    await userEvent.click(screen.getByLabelText('Collapse sidebar'))
    expect(handler).toHaveBeenCalledWith(true)
    expect(localStorage.getItem('sidebar-collapsed')).toBe('true')
  })
})
