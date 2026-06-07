import type { Meta, StoryObj } from '@storybook/react'
import { Calendar, Settings, Target } from 'lucide-react'
import { Sidebar } from '@/components/ui/sidebar'
import { SidebarBrand } from '@/components/ui/sidebar-brand'
import { SidebarItem } from '@/components/ui/sidebar-item'

const meta: Meta<typeof SidebarBrand> = {
  title: 'Layout/SidebarBrand',
  component: SidebarBrand,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="flex h-[400px]">
        <Story />
        <div className="flex-1 bg-background p-6 text-sm text-foreground">Main content area</div>
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof SidebarBrand>

const logo = (
  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
    <span className="text-[10px] font-bold text-accent-foreground">CR</span>
  </div>
)

const navItems = [
  { label: 'Calendar', href: '/calendar', icon: <Calendar className="h-4 w-4" /> },
  { label: 'Goals', href: '/goals', icon: <Target className="h-4 w-4" /> },
  { label: 'Settings', href: '/settings', icon: <Settings className="h-4 w-4" /> },
]

export const Default: Story = {
  render: () => (
    <Sidebar header={<SidebarBrand logo={logo} title="Cybond" />}>
      {navItems.map((item) => (
        <SidebarItem key={item.href} icon={item.icon} label={item.label} href={item.href} />
      ))}
    </Sidebar>
  ),
}

export const StartsCollapsed: Story = {
  render: () => (
    <Sidebar header={<SidebarBrand logo={logo} title="Cybond" />} className="w-14">
      {navItems.map((item) => (
        <SidebarItem key={item.href} icon={item.icon} label={item.label} href={item.href} />
      ))}
    </Sidebar>
  ),
}
