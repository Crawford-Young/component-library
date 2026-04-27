import type { Meta, StoryObj } from '@storybook/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const meta: Meta<typeof TabsList> = {
  title: 'Navigation/Tabs',
  component: TabsList,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof TabsList>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-muted-foreground">Overview content goes here.</p>
      </TabsContent>
      <TabsContent value="analytics">
        <p className="text-sm text-muted-foreground">Analytics content goes here.</p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-sm text-muted-foreground">Settings content goes here.</p>
      </TabsContent>
    </Tabs>
  ),
}

export const Pills: Story = {
  render: () => (
    <Tabs defaultValue="day" className="w-[400px]">
      <TabsList variant="pills">
        <TabsTrigger value="day" variant="pills">
          Day
        </TabsTrigger>
        <TabsTrigger value="week" variant="pills">
          Week
        </TabsTrigger>
        <TabsTrigger value="month" variant="pills">
          Month
        </TabsTrigger>
      </TabsList>
      <TabsContent value="day">
        <p className="text-sm text-muted-foreground">Day view.</p>
      </TabsContent>
      <TabsContent value="week">
        <p className="text-sm text-muted-foreground">Week view.</p>
      </TabsContent>
      <TabsContent value="month">
        <p className="text-sm text-muted-foreground">Month view.</p>
      </TabsContent>
    </Tabs>
  ),
}
