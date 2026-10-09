import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it } from 'vitest'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  usePanelRef,
  type PanelImperativeHandle,
} from './resizable'

describe('Resizable', () => {
  it('renders panels and merges classNames on the group and panels', () => {
    render(
      <ResizablePanelGroup orientation="horizontal" className="grp" id="group">
        <ResizablePanel id="a" className="pnl" defaultSize="50%">
          left
        </ResizablePanel>
        <ResizableHandle id="h" />
        <ResizablePanel id="b" defaultSize="50%">
          right
        </ResizablePanel>
      </ResizablePanelGroup>,
    )
    expect(screen.getByText('left')).toBeInTheDocument()
    expect(screen.getByText('right')).toBeInTheDocument()
    expect(screen.getByTestId('group')).toHaveClass('grp', 'flex')
    expect(screen.getByText('left')).toHaveClass('pnl')
  })

  it('renders a focusable separator with library ARIA and a focus ring', () => {
    render(
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel id="a">a</ResizablePanel>
        <ResizableHandle id="h" className="extra" />
        <ResizablePanel id="b">b</ResizablePanel>
      </ResizablePanelGroup>,
    )
    const sep = screen.getByRole('separator')
    expect(sep).toHaveAttribute('tabindex', '0')
    expect(sep).toHaveClass('extra', 'focus-visible:ring-2', 'focus-visible:ring-ring')
    expect(sep).toHaveAttribute('aria-orientation', 'vertical')
    expect(sep.querySelector('[data-grip]')).toBeNull()
  })

  it('renders a grip when withHandle is set', () => {
    render(
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel id="a">a</ResizablePanel>
        <ResizableHandle id="h" withHandle />
        <ResizablePanel id="b">b</ResizablePanel>
      </ResizablePanelGroup>,
    )
    const sep = screen.getByRole('separator')
    expect(sep).toHaveAttribute('aria-orientation', 'horizontal')
    expect(sep.querySelector('[data-grip]')).not.toBeNull()
  })

  it('receives keyboard focus', async () => {
    const user = userEvent.setup()
    render(
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel id="a">a</ResizablePanel>
        <ResizableHandle id="h" />
        <ResizablePanel id="b">b</ResizablePanel>
      </ResizablePanelGroup>,
    )
    await user.tab()
    expect(screen.getByRole('separator')).toHaveFocus()
  })

  it('exposes imperative collapse/expand through panelRef', () => {
    let handle: PanelImperativeHandle | null = null
    function Harness(): React.JSX.Element {
      const ref = usePanelRef()
      React.useEffect(() => {
        handle = ref.current
      })
      return (
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel id="a" collapsible minSize="10%" collapsedSize="0%" panelRef={ref}>
            a
          </ResizablePanel>
          <ResizableHandle id="h" />
          <ResizablePanel id="b">b</ResizablePanel>
        </ResizablePanelGroup>
      )
    }
    render(<Harness />)
    expect(handle).not.toBeNull()
    act(() => handle!.collapse())
    act(() => handle!.expand())
    expect(typeof handle!.isCollapsed()).toBe('boolean')
  })
})
