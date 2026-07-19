import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  WeekCalendarView,
  type DayWindow,
  type CreateActivityOption,
  type CreateRequest,
} from '@/components/ui/week-calendar-view'
import type { CalendarEvent } from '@/components/ui/calendar-event-chip'
import { EventCreateForm } from '@/components/ui/week-calendar-view/event-create-form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const meta: Meta<typeof WeekCalendarView> = {
  title: 'Data/WeekCalendarView',
  component: WeekCalendarView,
  argTypes: {
    use24h: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof WeekCalendarView>

const WEEK = '2026-05-04'

// Sun-first: [Sun, Mon, Tue, Wed, Thu, Fri, Sat]. Uniform 9–17 except Monday
// (wakes earlier, 6–17) and Friday (stays up later, 9–22) so per-day shading
// is visibly different across multiple days.
const PER_DAY_WINDOWS: readonly DayWindow[] = [
  { wake: 9, sleep: 17 },
  { wake: 6, sleep: 17 },
  { wake: 9, sleep: 17 },
  { wake: 9, sleep: 17 },
  { wake: 9, sleep: 17 },
  { wake: 9, sleep: 22 },
  { wake: 9, sleep: 17 },
]

export const Default: Story = {
  args: {
    defaultWeekStart: WEEK,
    events: [
      {
        id: '1',
        title: 'Team standup',
        start: '2026-05-04T09:00:00',
        end: '2026-05-04T09:30:00',
        color: 'blue',
        location: 'Google Meet',
      },
      {
        id: '2',
        title: 'Design review',
        start: '2026-05-05T14:00:00',
        end: '2026-05-05T15:30:00',
        color: 'violet',
        location: 'Figma',
        description: 'Review component specs',
      },
      {
        id: '3',
        title: 'Sprint planning',
        start: '2026-05-06T10:00:00',
        end: '2026-05-06T11:00:00',
        color: 'teal',
        location: 'Conference Room B',
      },
      {
        id: '4',
        title: 'Lunch',
        start: '2026-05-07T12:00:00',
        end: '2026-05-07T13:00:00',
        color: 'green',
      },
    ],
  },
}

export const CustomDisplay: Story = {
  args: {
    defaultWeekStart: WEEK,
    hourStart: 6,
    hourCount: 14,
    hourHeight: 56,
    events: [
      {
        id: '1',
        title: 'Early meeting',
        start: '2026-05-04T06:30:00',
        end: '2026-05-04T07:00:00',
        color: 'blue',
        location: 'Zoom',
      },
      {
        id: '2',
        title: 'Afternoon sync',
        start: '2026-05-05T15:00:00',
        end: '2026-05-05T16:00:00',
        color: 'violet',
      },
    ],
  },
}

export const Overlapping: Story = {
  args: {
    defaultWeekStart: WEEK,
    events: [
      {
        id: '1',
        title: 'Standup',
        start: '2026-05-04T09:00:00',
        end: '2026-05-04T09:30:00',
        color: 'blue',
      },
      {
        id: '2',
        title: 'Design sync',
        start: '2026-05-04T09:00:00',
        end: '2026-05-04T10:00:00',
        color: 'violet',
      },
      {
        id: '3',
        title: '1:1 with manager',
        start: '2026-05-04T09:15:00',
        end: '2026-05-04T09:45:00',
        color: 'green',
      },
    ],
  },
}

export const AllDay: Story = {
  args: {
    defaultWeekStart: WEEK,
    events: [
      {
        id: 'ad1',
        title: 'Conference',
        start: '2026-05-04T00:00:00',
        end: '2026-05-04T23:59:59',
        allDay: true,
        color: 'amber',
      },
      {
        id: 'ad2',
        title: 'Holiday',
        start: '2026-05-06T00:00:00',
        end: '2026-05-06T23:59:59',
        allDay: true,
        color: 'red',
      },
      { id: '1', title: 'Team standup', start: '2026-05-04T09:00:00', end: '2026-05-04T09:30:00' },
    ],
  },
}

export const EditAndDelete: Story = {
  args: {
    defaultWeekStart: WEEK,
    events: [
      {
        id: '1',
        title: 'Click to edit or delete',
        start: '2026-05-04T10:00:00',
        end: '2026-05-04T11:00:00',
        color: 'violet',
        location: 'Conference Room A',
        description: 'Open popover → Edit or Delete.',
      },
      {
        id: '2',
        title: 'Another editable event',
        start: '2026-05-05T14:00:00',
        end: '2026-05-05T15:00:00',
        color: 'teal',
      },
      {
        id: '3',
        title: 'Open popover → Mark complete',
        start: '2026-05-06T09:00:00',
        end: '2026-05-06T09:30:00',
        color: 'green',
      },
    ],
    onEventToggleComplete: () => {},
  },
}

export const Interactive: Story = {
  args: {
    defaultWeekStart: WEEK,
    hourHeight: 48,
    events: [
      {
        id: '1',
        title: 'Drag to move · Shift+drag = recurrence',
        start: '2026-05-04T09:00:00',
        end: '2026-05-04T10:00:00',
        color: 'blue',
      },
      {
        id: '2',
        title: 'Drag edge to resize',
        start: '2026-05-05T14:00:00',
        end: '2026-05-05T15:30:00',
        color: 'teal',
      },
    ],
    onEventCreate: () => {},
    onEventMove: () => {},
    onEventResize: () => {},
  },
}

function EventCreatePopoverDemo(): React.JSX.Element {
  return (
    <div className="relative inline-block">
      <Popover open onOpenChange={() => {}}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="rounded border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground"
          >
            9:00 – 10:00 (drag anchor)
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" side="bottom" align="start">
          <EventCreateForm
            startSlot={36}
            endSlot={40}
            date="2026-05-04"
            dayCount={1}
            days={[new Date('2026-05-04T00:00:00')]}
            startDayIdx={0}
            currentDayIdx={0}
            onSubmit={() => {}}
            onCancel={() => {}}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export const CreateEventPopover: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The create popover WeekCalendarView opens after a drag-to-create gesture. Recurring creation moved app-side, so this surface carries no Repeat / Days / repeat-count controls — just title, color, all-day, times, location, and description.',
      },
    },
  },
  render: () => <EventCreatePopoverDemo />,
}

const CREATE_ACTIVITY_OPTIONS: readonly CreateActivityOption[] = [
  { id: 'act-1', label: 'Deep work', color: 'blue', defaultDurationMin: 90 },
  { id: 'act-2', label: 'Workout', color: 'green', defaultDurationMin: 45 },
  { id: 'act-3', label: 'Reading' },
]

function EventCreatePopoverActivityPickerDemo(): React.JSX.Element {
  const [newActivityRequest, setNewActivityRequest] = React.useState<string | null>(null)
  return (
    <div className="flex flex-col gap-3">
      <div className="relative inline-block">
        <Popover open onOpenChange={() => {}}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="rounded border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground"
            >
              9:00 – 10:00 (drag anchor)
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" side="bottom" align="start">
            <EventCreateForm
              startSlot={36}
              endSlot={40}
              date="2026-05-04"
              dayCount={1}
              days={[new Date('2026-05-04T00:00:00')]}
              startDayIdx={0}
              currentDayIdx={0}
              createActivityOptions={CREATE_ACTIVITY_OPTIONS}
              onCreateActivityRequest={(slot) =>
                setNewActivityRequest(`${slot.start} – ${slot.end}`)
              }
              onSubmit={() => {}}
              onCancel={() => {}}
            />
          </PopoverContent>
        </Popover>
      </div>
      {newActivityRequest !== null && (
        <p className="text-xs text-muted-foreground">
          onCreateActivityRequest fired for slot: {newActivityRequest}
        </p>
      )}
    </div>
  )
}

export const CreateEventPopoverActivityPicker: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The activity picker sits at the top of the create popover when `createActivityOptions` is provided: "No activity" (default) · one item per option · "New activity…". "Deep work" and "Workout" carry a `defaultDurationMin` — selecting either reveals a "Use N min" snap button that recomputes the end time as start + N minutes (local wall-clock arithmetic). "Reading" has no default duration, so no snap button appears for it. Selecting an option seeds the title and color once per selection change — further edits to the title survive. Selecting "New activity…" fires `onCreateActivityRequest` with the drawn slot\'s ISO bounds (shown below the popover in this standalone demo); inside `WeekCalendarView` itself, that same selection also closes the create popover.',
      },
    },
  },
  render: () => <EventCreatePopoverActivityPickerDemo />,
}

function EventCreatePopoverActivityPickerNoNewActivityDemo(): React.JSX.Element {
  return (
    <div className="relative inline-block">
      <Popover open onOpenChange={() => {}}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="rounded border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground"
          >
            9:00 – 10:00 (drag anchor)
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" side="bottom" align="start">
          <EventCreateForm
            startSlot={36}
            endSlot={40}
            date="2026-05-04"
            dayCount={1}
            days={[new Date('2026-05-04T00:00:00')]}
            startDayIdx={0}
            currentDayIdx={0}
            createActivityOptions={CREATE_ACTIVITY_OPTIONS}
            onSubmit={() => {}}
            onCancel={() => {}}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export const CreateEventPopoverActivityPickerNoNewActivity: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'When `createActivityOptions` is provided but `onCreateActivityRequest` is not, the activity picker still renders "No activity" and one item per option, but omits the "New activity…" escape hatch — there is no handler to fire it into.',
      },
    },
  },
  render: () => <EventCreatePopoverActivityPickerNoNewActivityDemo />,
}

function CreateRequestReopenDemo(): React.JSX.Element {
  const [createRequest, setCreateRequest] = React.useState<CreateRequest | null>(null)
  // Simulate the app setting `createRequest` right after creating an activity: the
  // null→non-null transition reopens the create popover with the activity preselected.
  // 2026-05-04 is Monday of the displayed week; the slot ISO strings are local instants.
  React.useEffect(() => {
    setCreateRequest({
      slot: { start: '2026-05-04T09:00:00', end: '2026-05-04T10:30:00' },
      activityId: 'act-1',
    })
  }, [])
  return (
    <WeekCalendarView
      defaultWeekStart={WEEK}
      events={[]}
      hourStart={8}
      hourCount={14}
      hourHeight={56}
      createActivityOptions={CREATE_ACTIVITY_OPTIONS}
      createRequest={createRequest}
      onCreateRequestDismiss={() => setCreateRequest(null)}
      onEventCreate={() => setCreateRequest(null)}
    />
  )
}

export const CreateRequestReopen: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Controlled reopen: when `createRequest` transitions to a non-null value, `WeekCalendarView` opens the create popover at the slot (day/time derived from the ISO bounds via local getters) with the activity preselected in the picker — title and color seed from the matching `createActivityOptions` entry, then any `draft` overrides apply on top. Submit flows through the existing `onEventCreate` path (payload carries `activityId`); dismissing without submit (Cancel / Escape / outside click) fires `onCreateRequestDismiss`. This demo sets `createRequest` on mount, so the popover opens with "Deep work" preselected.',
      },
    },
  },
  render: () => <CreateRequestReopenDemo />,
}

export const DuplicateAction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'When `onEventDuplicate` is provided, the event popover renders a **Duplicate** action alongside Edit / Delete (no `activityId` requirement). Click a chip to open its popover, then **Duplicate** — the lib fires `onEventDuplicate` with the source event and closes the popover, taking no other action. The app then typically reopens the create popover seeded from the event via `createRequest` so the user can adjust the time before creating the copy.',
      },
    },
  },
  args: {
    defaultWeekStart: WEEK,
    events: [
      {
        id: '1',
        title: 'Click → Duplicate',
        start: '2026-05-04T10:00:00',
        end: '2026-05-04T11:00:00',
        color: 'violet',
        location: 'Studio',
        description: 'Open the popover, then Duplicate.',
      },
    ],
    onEventDuplicate: () => {},
  },
}

export const SleepMode: Story = {
  args: {
    defaultWeekStart: WEEK,
    hourStart: 0,
    hourCount: 24,
    hourHeight: 28,
    sleepEnabled: true,
    sleepStart: 23,
    sleepEnd: 7,
    events: [
      { id: '1', title: 'Team standup', start: '2026-05-04T09:00:00', end: '2026-05-04T09:30:00' },
    ],
  },
}

function AllHoursDemo() {
  const [showAll, setShowAll] = React.useState(false)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Switch id="all-hours" checked={showAll} onCheckedChange={setShowAll} />
        <Label htmlFor="all-hours" className="cursor-pointer text-xs">
          {showAll
            ? 'All hours (0–24h) — sleep bands are visual only, drag anywhere'
            : 'Working hours (6am–midnight)'}
        </Label>
      </div>
      <WeekCalendarView
        defaultWeekStart={WEEK}
        hourStart={showAll ? 0 : 6}
        hourCount={showAll ? 24 : 18}
        hourHeight={showAll ? 28 : 36}
        sleepEnabled={false}
        sleepStart={23}
        sleepEnd={7}
        events={[
          {
            id: '1',
            title: 'Team standup',
            start: '2026-05-04T09:00:00',
            end: '2026-05-04T09:30:00',
          },
          {
            id: '2',
            title: 'Late night call',
            start: '2026-05-05T23:30:00',
            end: '2026-05-06T00:00:00',
          },
        ]}
        onEventCreate={() => {}}
        onEventMove={() => {}}
        onEventResize={() => {}}
      />
    </div>
  )
}

export const AllHoursToggle: Story = {
  render: () => <AllHoursDemo />,
}

export const Use24h: Story = {
  args: {
    defaultWeekStart: WEEK,
    use24h: true,
    dayWindows: Array.from({ length: 7 }, () => ({ wake: 9, sleep: 17 })),
    events: [
      {
        id: '1',
        title: 'Team standup',
        start: '2026-05-04T09:00:00',
        end: '2026-05-04T09:30:00',
        color: 'blue',
        location: 'Google Meet',
      },
      {
        id: '2',
        title: 'Design review',
        start: '2026-05-05T14:00:00',
        end: '2026-05-05T15:30:00',
        color: 'violet',
        location: 'Figma',
        description: 'Review component specs',
      },
      {
        id: '3',
        title: 'Sprint planning',
        start: '2026-05-06T10:00:00',
        end: '2026-05-06T11:00:00',
        color: 'teal',
        location: 'Conference Room B',
      },
      {
        id: '4',
        title: 'Lunch',
        start: '2026-05-07T12:00:00',
        end: '2026-05-07T13:00:00',
        color: 'green',
      },
    ],
  },
}

export const PerDayWindows: Story = {
  args: {
    defaultWeekStart: WEEK,
    dayWindows: PER_DAY_WINDOWS,
    events: [
      { id: '1', title: 'Team standup', start: '2026-05-04T09:00:00', end: '2026-05-04T09:30:00' },
      {
        id: '2',
        title: 'Early Monday sync',
        start: '2026-05-04T06:30:00',
        end: '2026-05-04T07:00:00',
        color: 'blue',
      },
      {
        id: '3',
        title: 'Late Friday review',
        start: '2026-05-08T20:00:00',
        end: '2026-05-08T21:00:00',
        color: 'violet',
      },
    ],
  },
}

export const OvernightLocalVsUtc: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Proves day-membership now derives from the viewer's own LOCAL `Date` getters, never from slicing an ISO string's own written digits. Two events:\n\n" +
          '1. **"Real local overnight"** — `2026-05-04T23:00:00` to `2026-05-05T01:00:00`, written with no offset (local wall-clock, same as every other story in this file). 23:00 to 01:00 always spans two LOCAL calendar days for any viewer, so `WeekCalendarView` splits it into two chips: one ending at midnight on Mon 5/4, one starting at midnight on Tue 5/5.\n\n' +
          '2. **"UTC-overnight, not local"** — `2026-05-04T16:00:00-07:00` to `2026-05-04T18:00:00-07:00` (16:00–18:00 wall-clock in a fixed `-07:00` offset, e.g. `America/Phoenix`, which does not observe DST). As real instants those are `2026-05-04T23:00:00Z`–`2026-05-05T01:00:00Z` — the UTC representation crosses midnight (May 4 → May 5), which is exactly what the old ISO-substring logic keyed off and would have incorrectly split into two chips days apart. The fixed code parses each instant to a `Date` and reads `getFullYear/Month/Date()` in the viewer\'s own local timezone, so it renders as ONE chip whenever the interval does not also cross a local midnight FOR THAT VIEWER.\n\n' +
          "This demo's \"stays 1 chip\" claim is inherently viewer-timezone-dependent, not universal: a viewer whose own local midnight falls inside 23:00Z-01:00Z (roughly UTC to UTC+1, e.g. a browser running with timezoneId 'UTC') WILL see event 2 split too - that's the correct behavior for that viewer, not a bug, but it means this story visually contradicts its own title under a UTC-local viewer. `tests/e2e` pins `use.timezoneId: 'America/New_York'` in `playwright.config.ts` specifically so this story (and the axe entry checking it) render deterministically in CI regardless of the runner's host TZ (ubuntu-latest defaults to UTC) - if you open this story in your own browser to eyeball it, your OS/browser timezone must also be well clear of the UTC+/-1 band for event 2 to show as one chip.\n\n" +
          "Event 1's color is `indigo` rather than the more intuitive `violet`/`green`: the split's overflow half renders with a pre-existing `opacity-70` treatment (`week-calendar-view.tsx`'s `isOverflow` branch) that dims the whole chip, including its white text, and most palette colors then fail axe `color-contrast` against the dark page background once dimmed — `indigo` is one of the few with enough margin to still clear 4.5:1. That the palette's contrast guarantee (\"verified ≥4.5:1 with white text\", see `calendar-event-chip.tsx`) only holds at full opacity is a pre-existing gap unrelated to this wave's fixes, surfaced here because no previously axe-tested story ever rendered a split/overflow chip.",
      },
    },
  },
  args: {
    defaultWeekStart: WEEK,
    hourStart: 0,
    hourCount: 24,
    hourHeight: 32,
    events: [
      {
        id: 'local-overnight',
        title: 'Real local overnight (splits into 2)',
        start: '2026-05-04T23:00:00',
        end: '2026-05-05T01:00:00',
        color: 'indigo',
      },
      {
        id: 'utc-overnight',
        title: 'UTC-overnight only (stays 1 chip)',
        start: '2026-05-04T16:00:00-07:00',
        end: '2026-05-04T18:00:00-07:00',
        color: 'teal',
      },
    ],
  },
}

export const PerDayWindowsFullDay: Story = {
  args: {
    defaultWeekStart: WEEK,
    dayWindows: PER_DAY_WINDOWS,
    sleepEnabled: true,
    events: [
      { id: '1', title: 'Team standup', start: '2026-05-04T09:00:00', end: '2026-05-04T09:30:00' },
      {
        id: '2',
        title: 'Early Monday sync',
        start: '2026-05-04T06:30:00',
        end: '2026-05-04T07:00:00',
        color: 'blue',
      },
      {
        id: '3',
        title: 'Late Friday review',
        start: '2026-05-08T20:00:00',
        end: '2026-05-08T21:00:00',
        color: 'violet',
      },
    ],
  },
}

const RESYNC_DEMO_EVENTS: readonly CalendarEvent[] = [
  {
    id: '1',
    title: 'Team standup',
    start: '2026-05-04T09:00:00',
    end: '2026-05-04T09:30:00',
    color: 'blue',
  },
  {
    id: '2',
    title: 'Design review',
    start: '2026-05-05T14:00:00',
    end: '2026-05-05T15:30:00',
    color: 'violet',
  },
]

function ResyncTokenDemo(): React.JSX.Element {
  const [events, setEvents] = React.useState<readonly CalendarEvent[]>(RESYNC_DEMO_EVENTS)
  const [mutationCount, setMutationCount] = React.useState(0)
  const [resyncToken, setResyncToken] = React.useState(0)
  const [lastWeekChange, setLastWeekChange] = React.useState<string | null>(null)

  function mutateServerData(): void {
    const nextMutationCount = mutationCount + 1
    setMutationCount(nextMutationCount)
    setEvents((previous) =>
      previous.map((event) =>
        event.id === '1'
          ? { ...event, title: `Team standup (server update #${nextMutationCount})` }
          : event,
      ),
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={mutateServerData}
          className="rounded border border-border px-3 py-1.5 text-xs text-foreground"
        >
          Mutate server data
        </button>
        <button
          type="button"
          onClick={() => setResyncToken((token) => token + 1)}
          className="rounded border border-border px-3 py-1.5 text-xs text-foreground"
        >
          Bump resyncToken
        </button>
        <span className="text-xs text-muted-foreground">
          resyncToken: {resyncToken} · last onWeekChange:{' '}
          {lastWeekChange ?? '(none yet — navigate a week)'}
        </span>
      </div>
      <WeekCalendarView
        defaultWeekStart={WEEK}
        events={events}
        resyncToken={resyncToken}
        onWeekChange={setLastWeekChange}
        onEventMove={() => {}}
        onEventResize={() => {}}
      />
    </div>
  )
}

export const ResyncToken: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates `onWeekChange` and `resyncToken` together. `events` and `resyncToken` live in this story's own state, standing in for a consumer that refetches server data.\n\n" +
          '**"Mutate server data"** updates the "Team standup" event\'s title in story state — simulating server truth diverging from what the calendar is currently showing — but does NOT change the rendered chip: `WeekCalendarView` copies `events` into internal `localEvents` once and only re-seeds on a `resyncToken` identity change, so an `events` prop mutation alone is invisible until the token bumps.\n\n' +
          '**"Bump resyncToken"** increments the token, which re-seeds `localEvents` from the current `events` prop — the chip title now picks up every mutation made since the last bump.\n\n' +
          'If you start a drag (move or resize an event) and bump the token mid-drag, the re-seed is deferred until the drag returns to idle, reading `events` as of that later moment — a resync can never yank an event out from under an in-progress drag.\n\n' +
          "`onWeekChange` fires with the new week's Sunday local-ISO date only when navigation actually changes the displayed week (never on mount, never for a same-week selection) — the chrome above echoes the last payload received; use the nav bar to see it update.",
      },
    },
  },
  render: () => <ResyncTokenDemo />,
}
