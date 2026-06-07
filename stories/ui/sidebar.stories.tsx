import type { Meta, StoryObj } from '@storybook/react'
import { Calendar, Settings, Target, RefreshCw, CheckSquare } from 'lucide-react'
import { Sidebar } from '@/components/ui/sidebar'
import { SidebarBrand } from '@/components/ui/sidebar-brand'
import { SidebarItem } from '@/components/ui/sidebar-item'

const meta: Meta<typeof Sidebar> = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="flex h-screen overflow-hidden">
        <Story />
        <div className="flex-1 bg-background p-6 text-sm text-foreground">Main content area</div>
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof Sidebar>

const navItems = [
  { label: 'Calendar', href: '/calendar', icon: <Calendar className="h-4 w-4" /> },
  { label: 'Goals', href: '/goals', icon: <Target className="h-4 w-4" /> },
  { label: 'Habits', href: '/habits', icon: <RefreshCw className="h-4 w-4" /> },
  { label: 'Tasks', href: '/tasks', icon: <CheckSquare className="h-4 w-4" /> },
  { label: 'Settings', href: '/settings', icon: <Settings className="h-4 w-4" /> },
]

const logo = (
  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
    <span className="text-[10px] font-bold text-accent-foreground">CR</span>
  </div>
)

export const Default: Story = {
  render: () => (
    <Sidebar header={<SidebarBrand logo={logo} title="Cybond" />}>
      {navItems.map((item) => (
        <SidebarItem key={item.href} icon={item.icon} label={item.label} href={item.href} />
      ))}
    </Sidebar>
  ),
}

export const WithActiveItem: Story = {
  render: () => (
    <Sidebar header={<SidebarBrand logo={logo} title="Cybond" />}>
      {navItems.map((item, i) => (
        <SidebarItem
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
          isActive={i === 1}
        />
      ))}
    </Sidebar>
  ),
}

export const WithLogout: Story = {
  render: () => (
    <Sidebar
      header={<SidebarBrand logo={logo} title="Cybond" />}
      footer={
        <div className="flex w-full items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            CY
          </div>
          <p className="flex-1 truncate text-xs font-medium text-foreground">Crawford Young</p>
          <button
            type="button"
            aria-label="Sign out"
            className="text-muted-foreground hover:text-foreground"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      }
    >
      {navItems.map((item) => (
        <SidebarItem key={item.href} icon={item.icon} label={item.label} href={item.href} />
      ))}
    </Sidebar>
  ),
}
