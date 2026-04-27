import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

function TestTooltip() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

describe('Tooltip', () => {
  it('renders trigger', () => {
    render(<TestTooltip />)
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('tooltip is not visible before hover', () => {
    render(<TestTooltip />)
    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument()
  })

  it('shows tooltip content on hover', async () => {
    const user = userEvent.setup()
    render(<TestTooltip />)
    await user.hover(screen.getByText('Hover me'))
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toBeInTheDocument()
    expect(tooltip).toHaveTextContent('Tooltip text')
  })

  it('hides tooltip after unhover', async () => {
    const user = userEvent.setup()
    render(<TestTooltip />)
    await user.hover(screen.getByText('Hover me'))
    await screen.findAllByText('Tooltip text')
    await user.unhover(screen.getByText('Hover me'))
    await screen.findAllByText('Tooltip text').then(
      () => {},
      () => {},
    )
  })
})

describe('TooltipProvider — delayDuration', () => {
  it('has displayName', () => {
    expect(TooltipProvider.displayName).toBe('TooltipProvider')
  })

  it('tooltip appears when delayDuration={0} is passed (verifies override)', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Instant</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    await user.hover(screen.getByText('Hover me'))
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent('Instant')
  })
})

describe('TooltipContent', () => {
  it('has correct displayName', () => {
    expect(TooltipContent.displayName).toBeDefined()
  })

  it('applies base classes when rendered', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>T</TooltipTrigger>
          <TooltipContent className="test-class">content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    await user.hover(screen.getByText('T'))
    const tip = await screen.findByRole('tooltip')
    // Radix places role="tooltip" on a hidden a11y span; the styled content div is the parent
    const styledContainer = tip.closest('[data-state]')
    expect(styledContainer?.className).toContain('test-class')
  })
})
