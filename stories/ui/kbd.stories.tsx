import type { Meta, StoryObj } from '@storybook/react'
import { Kbd } from '@/components/ui/kbd'

const meta: Meta<typeof Kbd> = {
  title: 'Display/Kbd',
  component: Kbd,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Kbd>

export const Default: Story = {
  args: { children: '⌘' },
}

export const KeyCombo: Story = {
  args: { keys: ['⌘', 'K'] },
}

export const ThreeKey: Story = {
  args: { keys: ['⌘', 'Shift', 'P'] },
}

export const AllExamples: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        Open command palette <Kbd keys={['⌘', 'K']} />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        Save file <Kbd keys={['⌘', 'S']} />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        Close tab <Kbd keys={['⌘', 'W']} />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        Single key <Kbd>Esc</Kbd>
      </div>
    </div>
  ),
}
