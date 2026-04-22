import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'

function TestAccordion({ type = 'single' }: { type?: 'single' | 'multiple' }) {
  return (
    <Accordion type={type} collapsible={type === 'single' ? true : undefined}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>Content for section 1</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>Content for section 2</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

describe('Accordion', () => {
  it('renders all triggers', () => {
    render(<TestAccordion />)
    expect(screen.getByText('Section 1')).toBeInTheDocument()
    expect(screen.getByText('Section 2')).toBeInTheDocument()
  })

  it('all panels are closed by default', () => {
    render(<TestAccordion />)
    expect(screen.queryByText('Content for section 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Content for section 2')).not.toBeInTheDocument()
  })

  it('opens a panel when its trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<TestAccordion />)
    await user.click(screen.getByText('Section 1'))
    await waitFor(() => expect(screen.getByText('Content for section 1')).toBeInTheDocument())
  })

  it('closes an open panel when its trigger is clicked again (single collapsible)', async () => {
    const user = userEvent.setup()
    render(<TestAccordion />)
    await user.click(screen.getByText('Section 1'))
    await waitFor(() => screen.getByText('Content for section 1'))
    await user.click(screen.getByText('Section 1'))
    await waitFor(() => expect(screen.queryByText('Content for section 1')).not.toBeInTheDocument())
  })

  it('single mode closes first panel when second is opened', async () => {
    const user = userEvent.setup()
    render(<TestAccordion type="single" />)
    await user.click(screen.getByText('Section 1'))
    await waitFor(() => screen.getByText('Content for section 1'))
    await user.click(screen.getByText('Section 2'))
    await waitFor(() => {
      expect(screen.getByText('Content for section 2')).toBeInTheDocument()
      expect(screen.queryByText('Content for section 1')).not.toBeInTheDocument()
    })
  })

  it('multiple mode keeps multiple panels open simultaneously', async () => {
    const user = userEvent.setup()
    render(<TestAccordion type="multiple" />)
    await user.click(screen.getByText('Section 1'))
    await waitFor(() => screen.getByText('Content for section 1'))
    await user.click(screen.getByText('Section 2'))
    await waitFor(() => {
      expect(screen.getByText('Content for section 1')).toBeInTheDocument()
      expect(screen.getByText('Content for section 2')).toBeInTheDocument()
    })
  })

  it('AccordionTrigger contains a ChevronDown icon', () => {
    render(<TestAccordion />)
    const trigger = screen.getByRole('button', { name: /Section 1/i })
    expect(trigger.querySelector('svg')).toBeInTheDocument()
  })
})

describe('AccordionItem', () => {
  it('renders with bottom border', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="x">
          <AccordionTrigger>Item</AccordionTrigger>
          <AccordionContent>body</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
    const itemEl = screen.getByText('Item').closest('h3')?.parentElement
    expect(itemEl?.className).toContain('border-b')
  })
})
