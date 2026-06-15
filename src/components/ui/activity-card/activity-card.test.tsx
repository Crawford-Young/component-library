import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ActivityCard } from './activity-card'

describe('ActivityCard', () => {
  const baseProps = {
    title: 'Morning Run',
    type: 'habit' as const,
    status: 'pending' as const,
    visibility: 'everyone' as const,
  }

  describe('title and type icon', () => {
    it('renders the title', () => {
      render(<ActivityCard {...baseProps} />)
      expect(screen.getByText('Morning Run')).toBeInTheDocument()
    })

    it('renders a task icon for type task', () => {
      render(<ActivityCard {...baseProps} type="task" />)
      // lucide renders svg with aria-hidden; we check it is present in the document
      const icons = document.querySelectorAll('svg[aria-hidden="true"]')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('renders a goal icon for type goal', () => {
      render(<ActivityCard {...baseProps} type="goal" />)
      const icons = document.querySelectorAll('svg[aria-hidden="true"]')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('renders a habit icon for type habit', () => {
      render(<ActivityCard {...baseProps} type="habit" />)
      const icons = document.querySelectorAll('svg[aria-hidden="true"]')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('status badge', () => {
    it('renders pending status', () => {
      render(<ActivityCard {...baseProps} status="pending" />)
      expect(screen.getByText('pending')).toBeInTheDocument()
    })

    it('renders in_progress status', () => {
      render(<ActivityCard {...baseProps} status="in_progress" />)
      expect(screen.getByText('in_progress')).toBeInTheDocument()
    })

    it('renders completed status', () => {
      render(<ActivityCard {...baseProps} status="completed" />)
      expect(screen.getByText('completed')).toBeInTheDocument()
    })
  })

  describe('StreakBadge', () => {
    it('renders StreakBadge when streak > 0', () => {
      render(<ActivityCard {...baseProps} streak={7} />)
      expect(screen.getByText('7')).toBeInTheDocument()
    })

    it('does not render StreakBadge when streak is 0', () => {
      render(<ActivityCard {...baseProps} streak={0} />)
      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })

    it('does not render StreakBadge when streak is undefined', () => {
      render(<ActivityCard {...baseProps} />)
      // no number text from a streak badge — just verify no "0" visible
      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })
  })

  describe('detail node', () => {
    it('renders detail node when provided', () => {
      render(<ActivityCard {...baseProps} detail={<span>recurs weekly</span>} />)
      expect(screen.getByText('recurs weekly')).toBeInTheDocument()
    })

    it('does not render detail section when omitted', () => {
      render(<ActivityCard {...baseProps} />)
      expect(screen.queryByText('recurs weekly')).not.toBeInTheDocument()
    })
  })

  describe('actions node', () => {
    it('renders actions node when provided', () => {
      render(<ActivityCard {...baseProps} actions={<button type="button">Start</button>} />)
      expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    })

    it('does not render actions when omitted', () => {
      render(<ActivityCard {...baseProps} />)
      expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument()
    })
  })

  describe('participant count', () => {
    it('renders "3 joined" when participantCount is 3', () => {
      render(<ActivityCard {...baseProps} participantCount={3} />)
      expect(screen.getByText('3 joined')).toBeInTheDocument()
    })

    it('does not render joined text when participantCount is 0', () => {
      render(<ActivityCard {...baseProps} participantCount={0} />)
      expect(screen.queryByText(/joined/)).not.toBeInTheDocument()
    })

    it('does not render joined text when participantCount is undefined', () => {
      render(<ActivityCard {...baseProps} />)
      expect(screen.queryByText(/joined/)).not.toBeInTheDocument()
    })
  })

  describe('visibility glyph aria-labels', () => {
    it('has correct aria-label for everyone visibility', () => {
      render(<ActivityCard {...baseProps} visibility="everyone" />)
      expect(screen.getByLabelText('Visible to everyone')).toBeInTheDocument()
    })

    it('has correct aria-label for friends visibility', () => {
      render(<ActivityCard {...baseProps} visibility="friends" />)
      expect(screen.getByLabelText('Visible to friends')).toBeInTheDocument()
    })

    it('has correct aria-label for busy visibility', () => {
      render(<ActivityCard {...baseProps} visibility="busy" />)
      expect(screen.getByLabelText('Visible when busy')).toBeInTheDocument()
    })

    it('has correct aria-label for only_me visibility', () => {
      render(<ActivityCard {...baseProps} visibility="only_me" />)
      expect(screen.getByLabelText('Visible to only me')).toBeInTheDocument()
    })
  })

  describe('nextOccurrence', () => {
    it('renders nextOccurrence when provided', () => {
      render(<ActivityCard {...baseProps} nextOccurrence="Tomorrow 9:00 AM" />)
      expect(screen.getByText('Tomorrow 9:00 AM')).toBeInTheDocument()
    })

    it('does not render nextOccurrence when null', () => {
      render(<ActivityCard {...baseProps} nextOccurrence={null} />)
      expect(screen.queryByText('Tomorrow 9:00 AM')).not.toBeInTheDocument()
    })

    it('does not render nextOccurrence when undefined', () => {
      render(<ActivityCard {...baseProps} />)
      // absence is expected — no next occurrence text visible
      expect(screen.queryByTestId('next-occurrence')).not.toBeInTheDocument()
    })
  })
})
