import type { Meta, StoryObj } from '@storybook/react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'

const meta: Meta<typeof NavigationMenu> = {
  title: 'UI/NavigationMenu',
  component: NavigationMenu,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof NavigationMenu>

export const Default: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink
                  href="/"
                  className="flex h-full w-full flex-col justify-end rounded-md bg-accent/20 p-6"
                >
                  <div className="mb-2 mt-4 text-lg font-medium text-foreground">
                    @crawfordyoung/ui
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Accessible, composable, dark-mode-first components.
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/docs/installation">
                  <div className="text-sm font-medium text-foreground">Installation</div>
                  <p className="text-xs text-muted-foreground">Get up and running in minutes.</p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/docs/components">
                  <div className="text-sm font-medium text-foreground">Components</div>
                  <p className="text-xs text-muted-foreground">
                    Browse the full component catalog.
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/docs/theming">
                  <div className="text-sm font-medium text-foreground">Theming</div>
                  <p className="text-xs text-muted-foreground">Customize tokens and dark mode.</p>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              {['Button', 'Input', 'Dialog', 'Select', 'Slider', 'Table'].map((item) => (
                <li key={item}>
                  <NavigationMenuLink href={`/docs/${item.toLowerCase()}`}>
                    <div className="text-sm font-medium text-foreground">{item}</div>
                    <p className="text-xs text-muted-foreground">Accessible {item} component.</p>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/docs" className="h-9 px-4 py-2 font-medium">
            Documentation
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
}

export const SimpleLinks: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        {['Home', 'About', 'Blog', 'Contact'].map((label) => (
          <NavigationMenuItem key={label}>
            <NavigationMenuLink href={`/${label.toLowerCase()}`} className="px-4 py-2 font-medium">
              {label}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  ),
}
