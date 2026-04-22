import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'

function TestCollapsible({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger>Toggle section</CollapsibleTrigger>
      <CollapsibleContent>Hidden content</CollapsibleContent>
    </Collapsible>
  )
}

describe('Collapsible', () => {
  it('renders trigger', () => {
    render(<TestCollapsible />)
    expect(screen.getByText('Toggle section')).toBeInTheDocument()
  })

  it('content is hidden by default when defaultOpen is false', () => {
    render(<TestCollapsible />)
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument()
  })

  it('content is visible when defaultOpen is true', () => {
    render(<TestCollapsible defaultOpen />)
    expect(screen.getByText('Hidden content')).toBeInTheDocument()
  })

  it('expands content when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<TestCollapsible />)
    await user.click(screen.getByText('Toggle section'))
    await waitFor(() => expect(screen.getByText('Hidden content')).toBeInTheDocument())
  })

  it('collapses content when trigger is clicked again', async () => {
    const user = userEvent.setup()
    render(<TestCollapsible />)
    await user.click(screen.getByText('Toggle section'))
    await waitFor(() => screen.getByText('Hidden content'))
    await user.click(screen.getByText('Toggle section'))
    await waitFor(() => expect(screen.queryByText('Hidden content')).not.toBeInTheDocument())
  })

  it('forwards ref on CollapsibleContent', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>T</CollapsibleTrigger>
        <CollapsibleContent ref={ref}>body</CollapsibleContent>
      </Collapsible>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
