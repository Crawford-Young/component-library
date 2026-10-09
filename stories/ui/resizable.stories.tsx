import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  usePanelRef,
} from '@/components/ui/resizable'

const meta: Meta<typeof ResizablePanelGroup> = {
  title: 'Layout/Resizable',
  component: ResizablePanelGroup,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj<typeof ResizablePanelGroup>

function Pane({ label }: { readonly label: string }): React.JSX.Element {
  return (
    <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
      {label}
    </div>
  )
}

export const Horizontal: Story = {
  render: () => (
    <div className="h-48 w-full max-w-2xl rounded-lg border border-border">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel id="one" defaultSize="50%" minSize="20%">
          <Pane label="One" />
        </ResizablePanel>
        <ResizableHandle id="one-two" withHandle aria-label="Resize one and two" />
        <ResizablePanel id="two" defaultSize="50%" minSize="20%">
          <Pane label="Two" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
}

function ConsoleLayout(): React.JSX.Element {
  const leftRef = usePanelRef()
  const terminalRef = usePanelRef()
  return (
    <div className="flex h-[480px] w-full flex-col bg-background">
      <div className="flex gap-2 border-b border-border p-2">
        <Button variant="outline" size="sm" onClick={() => leftRef.current?.collapse()}>
          Collapse left
        </Button>
        <Button variant="outline" size="sm" onClick={() => leftRef.current?.expand()}>
          Expand left
        </Button>
        <Button variant="outline" size="sm" onClick={() => terminalRef.current?.collapse()}>
          Collapse terminal
        </Button>
        <Button variant="outline" size="sm" onClick={() => terminalRef.current?.expand()}>
          Expand terminal
        </Button>
      </div>
      <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
        <ResizablePanel
          id="left"
          panelRef={leftRef}
          defaultSize="22%"
          minSize="12%"
          collapsible
          collapsedSize="0%"
        >
          <Pane label="Left" />
        </ResizablePanel>
        <ResizableHandle id="left-centre" aria-label="Resize left panel" />
        <ResizablePanel id="centre" defaultSize="56%" minSize="30%">
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel id="main" defaultSize="70%" minSize="20%">
              <Pane label="Centre" />
            </ResizablePanel>
            <ResizableHandle id="main-terminal" withHandle aria-label="Resize terminal" />
            <ResizablePanel
              id="terminal"
              panelRef={terminalRef}
              defaultSize="30%"
              minSize="10%"
              collapsible
              collapsedSize="0%"
            >
              <Pane label="Bottom" />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle id="centre-right" aria-label="Resize right panel" />
        <ResizablePanel id="right" defaultSize="22%" minSize="12%">
          <Pane label="Right" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export const ThreePanelNested: Story = { render: () => <ConsoleLayout /> }
