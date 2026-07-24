import type { Meta, StoryObj } from '@storybook/react'

import { Badge } from '../../src/components/ui/badge'
import { Button } from '../../src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card'
import { Input } from '../../src/components/ui/input'
import '../../src/styles/themes/carsickyak.css'

const meta: Meta = {
  title: 'Foundation/CarsickYakTheme',
  parameters: { layout: 'padded' },
}
export default meta

function ThemeSample(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-background p-6 text-foreground">
      <h2 className="text-xl font-semibold">CarsickYak theme</h2>
      <p className="text-muted-foreground">Muted secondary text on background.</p>
      <div className="flex flex-wrap items-center gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Badge>Badge</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Surface card</CardTitle>
        </CardHeader>
        <CardContent>
          <Input placeholder="Input on surface" aria-label="Sample input" />
        </CardContent>
      </Card>
    </div>
  )
}

export const Light: StoryObj = {
  render: () => (
    <div className="theme-carsickyak">
      <ThemeSample />
    </div>
  ),
}

export const Dark: StoryObj = {
  render: () => (
    <div className="theme-carsickyak dark">
      <ThemeSample />
    </div>
  ),
}
