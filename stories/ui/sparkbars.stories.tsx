import type { Meta, StoryObj } from '@storybook/react'
import { Sparkbars } from '@/components/ui/sparkbars'

const usd = (n: number): string => `$${n.toFixed(2)}`
const DAYS = ['Oct 8', 'Oct 9', 'Oct 10', 'Oct 11', 'Oct 12', 'Oct 13', 'Oct 14']

const meta: Meta<typeof Sparkbars> = {
  title: 'Display/Sparkbars',
  component: Sparkbars,
  tags: ['autodocs'],
  args: {
    name: 'Spend by day',
    values: [0, 18.3, 0, 8.8, 13, 4.2, 4.4],
    labels: DAYS,
    format: usd,
  },
}

export default meta
type Story = StoryObj<typeof Sparkbars>

export const Default: Story = {}

export const AllZero: Story = { args: { values: [0, 0, 0, 0, 0, 0, 0] } }

export const InATableRow: Story = {
  render: (args) => (
    <table className="text-sm text-foreground">
      <thead>
        <tr>
          <th scope="col" className="pr-6 text-left">
            Repo
          </th>
          <th scope="col" className="text-left">
            By day
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="pr-6">demo-repo</td>
          <td>
            <Sparkbars {...args} />
          </td>
        </tr>
        <tr>
          <td className="pr-6">sample-app</td>
          <td>
            <Sparkbars {...args} values={[2, 0, 0, 1, 9, 0, 3]} />
          </td>
        </tr>
      </tbody>
    </table>
  ),
}
