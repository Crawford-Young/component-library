import type { Meta, StoryObj } from '@storybook/react'
import { Sidebar } from '@/components/ui/sidebar'
import { SidebarItem } from '@/components/ui/sidebar-item'

const meta: Meta<typeof Sidebar> = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="h-[500px] w-64">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof Sidebar>

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Goals', href: '/goals' },
  { label: 'Habits', href: '/habits' },
  { label: 'Reflections', href: '/reflections' },
  { label: 'Calendar', href: '/calendar' },
]

export const Default: Story = {
  render: () => (
    <Sidebar>
      {navItems.map((item) => (
        <SidebarItem key={item.href} icon="○" label={item.label} href={item.href} />
      ))}
    </Sidebar>
  ),
}

export const WithActiveItem: Story = {
  render: () => (
    <Sidebar>
      {navItems.map((item, i) => (
        <SidebarItem
          key={item.href}
          icon="○"
          label={item.label}
          href={item.href}
          isActive={i === 1}
        />
      ))}
    </Sidebar>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <Sidebar footer={<p className="text-xs text-muted-foreground px-3">Seedling · 120 pts</p>}>
      {navItems.map((item) => (
        <SidebarItem key={item.href} icon="○" label={item.label} href={item.href} />
      ))}
    </Sidebar>
  ),
}
