import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const meta: Meta<typeof SheetContent> = {
  title: 'UI/Sheet',
  component: SheetContent,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof SheetContent>

function SheetDemo({ side }: { side?: 'top' | 'right' | 'bottom' | 'left' }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open {side ?? 'right'} sheet</Button>
      </SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>Make changes to your profile settings here.</SheetDescription>
        </SheetHeader>
        <p className="text-sm text-muted-foreground flex-1">Sheet body content goes here.</p>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button>Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export const Default: Story = { render: () => <SheetDemo /> }
export const Left: Story = { render: () => <SheetDemo side="left" /> }
export const Top: Story = { render: () => <SheetDemo side="top" /> }
export const Bottom: Story = { render: () => <SheetDemo side="bottom" /> }
