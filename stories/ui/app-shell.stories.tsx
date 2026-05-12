import type { Meta, StoryObj } from '@storybook/react'
import { AppShell } from '@/components/ui/app-shell'

const meta: Meta<typeof AppShell> = {
  title: 'Layout/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof AppShell>

export const Default: Story = {
  args: {
    sidebar: (
      <aside className="flex h-full w-64 flex-col border-r border-border bg-surface p-4">
        <p className="text-sm text-muted-foreground">Sidebar</p>
      </aside>
    ),
    topbar: (
      <header className="flex h-14 items-center border-b border-border bg-surface px-4">
        <p className="text-sm font-medium">TopBar</p>
      </header>
    ),
    children: (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">Main content area</p>
      </div>
    ),
  },
}
