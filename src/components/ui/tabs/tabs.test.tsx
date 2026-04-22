import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

function TestTabs({ variant }: { variant?: 'default' | 'pills' }) {
  return (
    <Tabs defaultValue="account">
      <TabsList variant={variant}>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="disabled" disabled>
          Disabled
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account settings here.</TabsContent>
      <TabsContent value="password">Password settings here.</TabsContent>
    </Tabs>
  )
}

describe('Tabs', () => {
  it('renders tab triggers', () => {
    render(<TestTabs />)
    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Password')).toBeInTheDocument()
  })

  it('shows default tab content on mount', () => {
    render(<TestTabs />)
    expect(screen.getByText('Account settings here.')).toBeInTheDocument()
  })

  it('switches content when another tab is clicked', async () => {
    const user = userEvent.setup()
    render(<TestTabs />)
    await user.click(screen.getByText('Password'))
    await waitFor(() => {
      expect(screen.getByText('Password settings here.')).toBeInTheDocument()
    })
  })

  it('hides previous content when switching tabs', async () => {
    const user = userEvent.setup()
    render(<TestTabs />)
    await user.click(screen.getByText('Password'))
    await waitFor(() => {
      expect(screen.queryByText('Account settings here.')).not.toBeInTheDocument()
    })
  })

  it('disabled tab is not interactive', async () => {
    const user = userEvent.setup()
    render(<TestTabs />)
    const disabledTab = screen.getByText('Disabled').closest('button')
    expect(disabledTab).toBeDisabled()
    await user.click(screen.getByText('Account'))
    if (disabledTab) await user.click(disabledTab)
    expect(screen.getByText('Account settings here.')).toBeInTheDocument()
  })

  it('applies default variant classes to TabsList', () => {
    render(<TestTabs variant="default" />)
    const list = screen.getByRole('tablist')
    expect(list.className).toContain('border-b')
  })

  it('applies pills variant classes to TabsList', () => {
    render(<TestTabs variant="pills" />)
    const list = screen.getByRole('tablist')
    expect(list.className).toContain('bg-muted')
  })
})

describe('TabsTrigger', () => {
  it('has aria-selected=true on active tab', () => {
    render(<TestTabs />)
    const accountTab = screen.getByRole('tab', { name: 'Account' })
    expect(accountTab).toHaveAttribute('aria-selected', 'true')
  })

  it('has aria-selected=false on inactive tab', () => {
    render(<TestTabs />)
    const passwordTab = screen.getByRole('tab', { name: 'Password' })
    expect(passwordTab).toHaveAttribute('aria-selected', 'false')
  })
})
