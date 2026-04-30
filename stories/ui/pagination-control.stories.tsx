import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { PaginationControl } from '@/components/ui/pagination-control'

const meta: Meta<typeof PaginationControl> = {
  title: 'Data/PaginationControl',
  component: PaginationControl,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof PaginationControl>

function PaginationDemo({ totalPages, totalItems }: { totalPages: number; totalItems?: number }) {
  const [page, setPage] = React.useState(1)
  return (
    <PaginationControl
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
      pageSize={totalItems ? Math.ceil(totalItems / totalPages) : undefined}
      totalItems={totalItems}
    />
  )
}

export const FewPages: Story = {
  render: () => <PaginationDemo totalPages={5} />,
}

export const ManyPages: Story = {
  render: () => <PaginationDemo totalPages={20} totalItems={200} />,
}

export const WithInfo: Story = {
  render: () => <PaginationDemo totalPages={10} totalItems={97} />,
}

export const SinglePage: Story = {
  render: () => <PaginationDemo totalPages={1} />,
}
