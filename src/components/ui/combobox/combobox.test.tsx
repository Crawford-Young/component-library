import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Combobox } from './combobox'

const options = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'angular', label: 'Angular' },
]

describe('Combobox', () => {
  it('renders trigger button', () => {
    render(<Combobox options={options} placeholder="Select framework…" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows placeholder when no value selected', () => {
    render(<Combobox options={options} placeholder="Select framework…" />)
    expect(screen.getByText('Select framework…')).toBeInTheDocument()
  })

  it('shows ChevronsUpDown icon', () => {
    const { container } = render(<Combobox options={options} placeholder="Select framework…" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('opens popover on trigger click', async () => {
    const user = userEvent.setup()
    render(<Combobox options={options} placeholder="Select framework…" />)
    await user.click(screen.getByRole('button'))
    await waitFor(() => expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument())
  })

  it('displays all options when opened', async () => {
    const user = userEvent.setup()
    render(<Combobox options={options} placeholder="Select framework…" />)
    await user.click(screen.getByRole('button'))
    await waitFor(() => {
      options.forEach((opt) => expect(screen.getByText(opt.label)).toBeInTheDocument())
    })
  })

  it('filters options on search input', async () => {
    const user = userEvent.setup()
    render(<Combobox options={options} placeholder="Select framework…" />)
    await user.click(screen.getByRole('button'))
    await waitFor(() => screen.getByPlaceholderText(/search/i))
    await user.type(screen.getByPlaceholderText(/search/i), 'react')
    // cmdk v1 removes non-matching items from the DOM
    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.queryByText('Vue')).not.toBeInTheDocument()
    })
  })

  it('calls onValueChange when an option is selected', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Combobox options={options} placeholder="Select framework…" onValueChange={onValueChange} />,
    )
    await user.click(screen.getByRole('button'))
    await waitFor(() => screen.getByText('React'))
    await user.click(screen.getByText('React'))
    expect(onValueChange).toHaveBeenCalledWith('react')
  })

  it('shows selected label in trigger after selection', async () => {
    const user = userEvent.setup()
    render(<Combobox options={options} placeholder="Select framework…" />)
    await user.click(screen.getByRole('button'))
    await waitFor(() => screen.getByText('Vue'))
    await user.click(screen.getByText('Vue'))
    await waitFor(() => expect(screen.getByText('Vue')).toBeInTheDocument())
  })

  it('shows check icon on selected item', async () => {
    const user = userEvent.setup()
    render(<Combobox options={options} value="svelte" placeholder="Select framework…" />)
    await user.click(screen.getByRole('button'))
    await waitFor(() => screen.getAllByText('Svelte').length > 0)
    // The check icon is rendered as svg inside the Svelte list item (not the trigger)
    const allSvelteEls = screen.getAllByText('Svelte')
    const svelteItem = allSvelteEls
      .map((el) => el.closest('[role="option"], [cmdk-item]'))
      .find(Boolean)
    expect(svelteItem?.querySelector('svg')).toBeTruthy()
  })

  it('deselects when the same option is selected again', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        options={options}
        value="react"
        placeholder="Select framework…"
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('button'))
    await waitFor(() => screen.getAllByText('React').length > 0)
    // Click the React list item (not the trigger button)
    const allReactEls = screen.getAllByText('React')
    const reactItem = allReactEls
      .map((el) => el.closest('[role="option"], [cmdk-item]'))
      .find(Boolean)
    await user.click(reactItem as HTMLElement)
    expect(onValueChange).toHaveBeenCalledWith('')
  })
})
