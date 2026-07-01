import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { flushSync } from 'react-dom'
import { BrandSplash } from '@/components/ui/brand-splash'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/ui/sidebar'
import { SidebarBrand } from '@/components/ui/sidebar-brand'

/* Wave 2a spike — throwaway wiring to validate the splash → brand-slot morph.
   All view-transition plumbing lives HERE, not in the library (spec:
   docs/component-library/specs/2026-07-01-splash-handoff-design.md).
   2b replaces the DOM-query wiring with real props + startBrandHandoff. */

type DocWithVT = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> }
}

const VT_NAME = 'brand-wordmark'
// hand-tuned during the spike; 2b maps these onto --motion-*/--ease-* tokens
const VT_CSS = `
::view-transition-group(${VT_NAME}) {
  animation-duration: 600ms;
  animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
}
::view-transition-old(${VT_NAME}),
::view-transition-new(${VT_NAME}) {
  animation-duration: 600ms;
  animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
  height: 100%;
}
`

function MockShell(): React.JSX.Element {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar header={<SidebarBrand logo={<span aria-hidden>◆</span>} title="Cybond" />}>
        <div className="rounded-md px-3 py-2 text-sm text-muted-foreground">Today</div>
        <div className="rounded-md px-3 py-2 text-sm text-muted-foreground">Calendar</div>
        <div className="rounded-md px-3 py-2 text-sm text-muted-foreground">Goals</div>
      </Sidebar>
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Good evening</h1>
        <p className="mt-2 text-sm text-muted-foreground">Mock app content behind the splash.</p>
      </main>
    </div>
  )
}

function findSidebarTitle(root: HTMLElement): HTMLElement | null {
  const spans = Array.from(root.querySelectorAll<HTMLElement>('aside span'))
  return spans.find((s) => s.textContent === 'Cybond') ?? null
}

function HandoffStory(): React.JSX.Element {
  const [run, setRun] = React.useState(0)
  const [playing, setPlaying] = React.useState(true)
  const rootRef = React.useRef<HTMLDivElement>(null)

  // tag the splash wordmark for the OLD snapshot (spike-only DOM wiring)
  React.useEffect(() => {
    if (!playing) return
    const wm = document.querySelector<HTMLElement>('[data-wordmark]')
    if (wm) wm.style.viewTransitionName = VT_NAME
  }, [playing, run])

  const handleComplete = (): void => {
    // onComplete fires inside BrandSplash's effect — defer past React's commit
    // so flushSync below is legal
    queueMicrotask(() => {
      const root = rootRef.current
      const title = root ? findSidebarTitle(root) : null
      const swap = (): void => {
        // React commits async; VT needs the DOM mutated inside the callback
        flushSync(() => setPlaying(false))
        // name the NEW-state element only now — both named at once = collision
        if (title) title.style.viewTransitionName = VT_NAME
      }
      const doc = document as DocWithVT
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (doc.startViewTransition === undefined || reduce) {
        swap() // graceful degrade: no morph, splash exit fade already ran
        return
      }
      doc.startViewTransition(swap)
    })
  }

  return (
    <div ref={rootRef}>
      <style>{VT_CSS}</style>
      <MockShell />
      {playing ? (
        <BrandSplash
          key={run}
          wordmark="Cybond"
          splitIndex={2}
          quote={{ text: 'Bond to what matters.', attribution: null }}
          onComplete={handleComplete}
        />
      ) : (
        <Button
          className="fixed bottom-6 right-6"
          onClick={() => {
            const title = rootRef.current ? findSidebarTitle(rootRef.current) : null
            if (title) title.style.viewTransitionName = ''
            setRun((r) => r + 1)
            setPlaying(true)
          }}
        >
          Replay handoff
        </Button>
      )}
    </div>
  )
}

const meta: Meta = {
  title: 'Patterns/SplashHandoff',
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

export const Spike: Story = { render: () => <HandoffStory /> }
