import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FormDialog } from '@/components/ui/form-dialog'
import type { FormDialogFooterContext } from '@/components/ui/form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const meta: Meta<typeof FormDialog> = {
  title: 'Dialogs/FormDialog',
  component: FormDialog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof FormDialog>

function DefaultDemo(): React.JSX.Element {
  const [open, setOpen] = React.useState(true)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={(e) => {
          e.preventDefault()
          setOpen(false)
        }}
        title="New item"
        description="Fill in the fields below."
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="form-dialog-demo-name">Name</Label>
          <Input id="form-dialog-demo-name" aria-label="Name" placeholder="Name" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="form-dialog-demo-notes">Notes</Label>
          <Input id="form-dialog-demo-notes" aria-label="Notes" placeholder="Notes (optional)" />
        </div>
      </FormDialog>
    </>
  )
}

export const Default: Story = {
  render: () => <DefaultDemo />,
}

function CustomFooterDemo(): React.JSX.Element {
  const [open, setOpen] = React.useState(true)
  const [savedCount, setSavedCount] = React.useState(0)

  function renderFooter(ctx: FormDialogFooterContext): React.JSX.Element {
    return (
      <>
        <Button type="button" variant="ghost" onClick={ctx.close}>
          Discard
        </Button>
        <Button type="button" variant="outline" onClick={ctx.close}>
          Save draft
        </Button>
        <Button type="submit" form={ctx.formId} disabled={ctx.isPending}>
          Publish
        </Button>
      </>
    )
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog ({savedCount} published)</Button>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={(e) => {
          e.preventDefault()
          setSavedCount((count) => count + 1)
          setOpen(false)
        }}
        title="Publish post"
        description="A footer render-prop proving the exported ctx: formId, isPending, close."
        footer={renderFooter}
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="form-dialog-demo-title">Title</Label>
          <Input id="form-dialog-demo-title" aria-label="Title" placeholder="Post title" />
        </div>
      </FormDialog>
    </>
  )
}

export const CustomFooter: Story = {
  render: () => <CustomFooterDemo />,
}

function PendingDemo(): React.JSX.Element {
  const [open, setOpen] = React.useState(true)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={(e) => e.preventDefault()}
        title="Saving item"
        description="isPending disables Save and swaps its label."
        isPending
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="form-dialog-demo-pending-name">Name</Label>
          <Input
            id="form-dialog-demo-pending-name"
            aria-label="Name"
            defaultValue="Existing item"
          />
        </div>
      </FormDialog>
    </>
  )
}

export const Pending: Story = {
  render: () => <PendingDemo />,
}
