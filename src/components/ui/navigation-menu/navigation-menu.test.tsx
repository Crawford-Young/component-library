import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from './navigation-menu'

function TestMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/overview">Overview</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/about">About</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuIndicator />
      {/* NavigationMenu auto-adds a viewport; this is an additional explicit one */}
    </NavigationMenu>
  )
}

describe('NavigationMenu', () => {
  it('renders the nav landmark', () => {
    render(<TestMenu />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders list items', () => {
    render(<TestMenu />)
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('trigger is a button', () => {
    render(<TestMenu />)
    expect(screen.getByRole('button', { name: /products/i })).toBeInTheDocument()
  })

  it('trigger renders ChevronDown icon', () => {
    render(<TestMenu />)
    // lucide-react renders an svg inside the trigger
    const trigger = screen.getByRole('button', { name: /products/i })
    expect(trigger.querySelector('svg')).toBeInTheDocument()
  })

  it('content is not in the DOM before trigger click', () => {
    render(<TestMenu />)
    // NavigationMenu content is not mounted until the trigger is activated
    expect(screen.queryByText('Overview')).not.toBeInTheDocument()
  })

  it('shows content after trigger click', async () => {
    const user = userEvent.setup()
    render(<TestMenu />)
    await user.click(screen.getByRole('button', { name: /products/i }))
    await waitFor(() => expect(screen.getByText('Overview')).toBeInTheDocument())
  })

  it('NavigationMenuLink renders as anchor', () => {
    render(<TestMenu />)
    const aboutLink = screen.getByRole('link', { name: 'About' })
    expect(aboutLink).toBeInTheDocument()
    expect(aboutLink).toHaveAttribute('href', '/about')
  })

  it('NavigationMenuViewport renders inside NavigationMenu', () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList />
        <NavigationMenuViewport />
      </NavigationMenu>,
    )
    // The viewport wrapper div is present in the DOM
    // Our implementation wraps the Radix viewport in a div
    const viewportWrapper = container.querySelector('.absolute.left-0.top-full')
    expect(viewportWrapper).toBeInTheDocument()
  })

  it('applies className to NavigationMenu root', () => {
    const { container } = render(
      <NavigationMenu className="test-class">
        <NavigationMenuList />
      </NavigationMenu>,
    )
    expect(container.firstChild).toHaveClass('test-class')
  })

  it('forwards ref on NavigationMenuTrigger', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger ref={ref}>Trigger</NavigationMenuTrigger>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('forwards ref on NavigationMenuContent', async () => {
    const ref = { current: null as HTMLDivElement | null }
    const user = userEvent.setup()
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>T</NavigationMenuTrigger>
            <NavigationMenuContent ref={ref}>content</NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    await user.click(screen.getByRole('button', { name: 'T' }))
    await waitFor(() => expect(ref.current).toBeInstanceOf(HTMLDivElement))
  })

  it('forwards ref on NavigationMenuLink', () => {
    const ref = { current: null as HTMLAnchorElement | null }
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink ref={ref} href="/test">
              Link
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement)
  })

  it('has correct displayNames', () => {
    expect(NavigationMenuTrigger.displayName).toBeDefined()
    expect(NavigationMenuContent.displayName).toBeDefined()
    expect(NavigationMenuLink.displayName).toBeDefined()
    expect(NavigationMenuViewport.displayName).toBeDefined()
    expect(NavigationMenuIndicator.displayName).toBeDefined()
  })
})
