import type { Meta, StoryObj } from '@storybook/react'
import { Combobox } from '@/components/ui/combobox'

const meta: Meta<typeof Combobox> = {
  title: 'UI/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof Combobox>

const frameworks = [
  { value: 'next', label: 'Next.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'svelte', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt.js' },
]

export const Default: Story = {
  render: () => <Combobox options={frameworks} placeholder="Select framework…" />,
}
