import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ChatPanel } from '@/components/ui/chat-panel'
import { ChatFab } from '@/components/ui/chat-fab'

const meta: Meta<typeof ChatPanel> = {
  title: 'Overlays/ChatPanel',
  component: ChatPanel,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof ChatPanel>

function WithFabDemo() {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative h-[600px] bg-background p-8">
      <p className="text-muted-foreground text-sm">Main content area</p>
      <ChatFab onClick={() => setOpen(true)} />
      <ChatPanel open={open} onOpenChange={setOpen} title="AI Assistant">
        <div className="p-4">
          <p className="text-sm text-muted-foreground">Chat UI goes here.</p>
        </div>
      </ChatPanel>
    </div>
  )
}

export const WithFab: Story = {
  render: () => <WithFabDemo />,
}

export const WithActions: Story = {
  render: () => (
    <ChatPanel
      open
      onOpenChange={() => {}}
      title="Assistant"
      actions={<button className="rounded px-2 py-1 text-xs text-muted-foreground">New</button>}
    >
      <div className="p-4 text-sm text-muted-foreground">Panel body</div>
    </ChatPanel>
  ),
}
