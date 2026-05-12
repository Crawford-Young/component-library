import type { Meta, StoryObj } from '@storybook/react'
import { PageHeader } from '@/components/ui/page-header'
import { FilterChip } from '@/components/ui/filter-chip'
import { EmptyState } from '@/components/ui/empty-state'

const meta: Meta = { title: 'Layout/PageUtilities', tags: ['autodocs'] }
export default meta

export const Header: StoryObj = {
  render: () => (
    <PageHeader
      title="Goals"
      action={
        <button className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground">
          New Goal
        </button>
      }
    />
  ),
}

export const Filters: StoryObj = {
  render: () => (
    <div className="flex gap-2">
      {(['All', 'Active', 'Complete'] as const).map((f, i) => (
        <FilterChip key={f} label={f} isSelected={i === 0} onClick={() => undefined} />
      ))}
    </div>
  ),
}

export const Empty: StoryObj = {
  render: () => (
    <EmptyState
      message="No goals yet. Let the AI help you set one."
      ctaLabel="Set a goal"
      onCtaClick={() => undefined}
    />
  ),
}
