import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { DataTable, type ColumnDef } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'

const meta: Meta<typeof DataTable> = {
  title: 'Data/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof DataTable>

interface Employee {
  name: string
  department: string
  role: string
  status: 'Active' | 'On Leave' | 'Inactive'
  salary: number
}

const employees: Employee[] = [
  {
    name: 'Alice Johnson',
    department: 'Engineering',
    role: 'Senior Engineer',
    status: 'Active',
    salary: 120000,
  },
  {
    name: 'Bob Smith',
    department: 'Design',
    role: 'Lead Designer',
    status: 'Active',
    salary: 110000,
  },
  {
    name: 'Carol White',
    department: 'Engineering',
    role: 'Staff Engineer',
    status: 'On Leave',
    salary: 140000,
  },
  {
    name: 'Dave Chen',
    department: 'Product',
    role: 'Product Manager',
    status: 'Active',
    salary: 130000,
  },
  {
    name: 'Eve Martinez',
    department: 'Design',
    role: 'UX Designer',
    status: 'Active',
    salary: 95000,
  },
  {
    name: 'Frank Lee',
    department: 'Engineering',
    role: 'Engineer',
    status: 'Inactive',
    salary: 90000,
  },
  {
    name: 'Grace Kim',
    department: 'Marketing',
    role: 'Marketing Lead',
    status: 'Active',
    salary: 100000,
  },
  {
    name: 'Hank Brown',
    department: 'Engineering',
    role: 'Senior Engineer',
    status: 'Active',
    salary: 115000,
  },
  {
    name: 'Iris Davis',
    department: 'Product',
    role: 'Product Designer',
    status: 'On Leave',
    salary: 105000,
  },
  {
    name: 'Jack Wilson',
    department: 'Engineering',
    role: 'Engineer',
    status: 'Active',
    salary: 85000,
  },
  {
    name: 'Karen Taylor',
    department: 'Marketing',
    role: 'Content Writer',
    status: 'Active',
    salary: 75000,
  },
  {
    name: 'Leo Anderson',
    department: 'Design',
    role: 'UI Designer',
    status: 'Active',
    salary: 90000,
  },
]

const statusVariant = {
  Active: 'default',
  'On Leave': 'secondary',
  Inactive: 'destructive',
} as const

const columns: ColumnDef<Employee>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'department', header: 'Department' },
  { accessorKey: 'role', header: 'Role' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.getValue('status') as Employee['status']]}>
        {row.getValue('status')}
      </Badge>
    ),
  },
  {
    accessorKey: 'salary',
    header: 'Salary',
    cell: ({ row }) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(row.getValue('salary')),
  },
]

export const Default: Story = {
  render: () => <DataTable columns={columns} data={employees} />,
}

export const WithPagination: Story = {
  render: () => <DataTable columns={columns} data={employees} pagination />,
}

export const CustomPageSize: Story = {
  render: () => <DataTable columns={columns} data={employees} pagination={{ pageSize: 5 }} />,
}

export const Empty: Story = {
  render: () => <DataTable columns={columns} data={[]} />,
}
