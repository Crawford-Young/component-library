import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const meta: Meta<typeof DialogContent> = {
  title: 'UI/Dialog',
  component: DialogContent,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof DialogContent>

function DialogDemo({ size }: { size?: 'sm' | 'default' | 'lg' | 'full' }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open {size ?? 'default'} dialog</Button>
      </DialogTrigger>
      <DialogContent size={size}>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile. Click save when done.</DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Dialog body content goes here.</p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const Default: Story = { render: () => <DialogDemo /> }
export const Small: Story = { render: () => <DialogDemo size="sm" /> }
export const Large: Story = { render: () => <DialogDemo size="lg" /> }
export const Full: Story = { render: () => <DialogDemo size="full" /> }
