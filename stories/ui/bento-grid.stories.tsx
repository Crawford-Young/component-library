import type { Meta, StoryObj } from '@storybook/react'
import { BentoCell, BentoGrid } from '@/components/ui/bento-grid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const meta: Meta<typeof BentoGrid> = {
  title: 'Layout/BentoGrid',
  component: BentoGrid,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof BentoGrid>

export const Default: Story = {
  render: () => (
    <BentoGrid>
      {['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'].map((name) => (
        <Card key={name}>
          <CardHeader>
            <CardTitle>{name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Cell content</p>
          </CardContent>
        </Card>
      ))}
    </BentoGrid>
  ),
}

export const WithSpans: Story = {
  render: () => (
    <BentoGrid>
      <BentoCell span="wide">
        <Card className="h-32">
          <CardHeader>
            <CardTitle>Wide cell (2 cols)</CardTitle>
          </CardHeader>
        </Card>
      </BentoCell>
      <BentoCell>
        <Card className="h-32">
          <CardHeader>
            <CardTitle>Default</CardTitle>
          </CardHeader>
        </Card>
      </BentoCell>
      <BentoCell span="full">
        <Card className="h-24">
          <CardHeader>
            <CardTitle>Full width cell</CardTitle>
          </CardHeader>
        </Card>
      </BentoCell>
    </BentoGrid>
  ),
}
