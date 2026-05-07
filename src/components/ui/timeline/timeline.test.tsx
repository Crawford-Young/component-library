import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Timeline, TimelineItem } from './timeline'

describe('Timeline', () => {
  it('renders children', () => {
    render(
      <Timeline>
        <div>item</div>
      </Timeline>,
    )
    expect(screen.getByText('item')).toBeInTheDocument()
  })

  it('applies flex-col class', () => {
    const { container } = render(
      <Timeline>
        <div />
      </Timeline>,
    )
    expect((container.firstChild as HTMLElement).className).toContain('flex-col')
  })

  it('merges custom className', () => {
    const { container } = render(
      <Timeline className="mt-4">
        <div />
      </Timeline>,
    )
    expect((container.firstChild as HTMLElement).className).toContain('mt-4')
  })

  it('has displayName', () => {
    expect(Timeline.displayName).toBe('Timeline')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(
      <Timeline ref={ref}>
        <div />
      </Timeline>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('TimelineItem', () => {
  it('renders title', () => {
    render(<TimelineItem title="My Title" />)
    expect(screen.getByText('My Title')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<TimelineItem title="T" subtitle="Sub" />)
    expect(screen.getByText('Sub')).toBeInTheDocument()
  })

  it('does not render subtitle slot when omitted', () => {
    const { container } = render(<TimelineItem title="T" />)
    const subtitleElement = container.querySelector('.text-muted-foreground')
    expect(subtitleElement).toBeNull()
  })

  it('renders meta slot when provided', () => {
    render(<TimelineItem title="T" meta={<span>2024</span>} />)
    expect(screen.getByText('2024')).toBeInTheDocument()
  })

  it('renders custom icon when provided', () => {
    render(<TimelineItem title="T" icon={<span data-testid="custom-dot" />} />)
    expect(screen.getByTestId('custom-dot')).toBeInTheDocument()
  })

  it('renders default dot when no icon provided', () => {
    const { container } = render(<TimelineItem title="T" />)
    expect(container.querySelector('.bg-accent')).toBeInTheDocument()
  })

  it('renders connector line when isLast is false', () => {
    const { container } = render(<TimelineItem title="T" isLast={false} />)
    expect(container.querySelector('.bg-border')).toBeInTheDocument()
  })

  it('omits connector line when isLast is true', () => {
    const { container } = render(<TimelineItem title="T" isLast={true} />)
    expect(container.querySelector('.bg-border')).toBeNull()
  })

  it('renders body children', () => {
    render(
      <TimelineItem title="T">
        <p>body text</p>
      </TimelineItem>,
    )
    expect(screen.getByText('body text')).toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(<TimelineItem title="T" className="custom" />)
    expect((container.firstChild as HTMLElement).className).toContain('custom')
  })

  it('has displayName', () => {
    expect(TimelineItem.displayName).toBe('TimelineItem')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<TimelineItem ref={ref} title="T" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
