import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { flushSync } from 'react-dom'
import { BrandSplash } from '@/components/ui/brand-splash'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/ui/sidebar'
import { SidebarBrand } from '@/components/ui/sidebar-brand'
import { startBrandHandoff } from '@/lib/start-brand-handoff'

/* The consumer contract for the splash → app morph:
   1. same handoffName on BrandSplash and SidebarBrand
   2. exit="external" on the splash — startBrandHandoff owns the exit
   3. name the sidebar side ONLY once the splash is gone (same state
      update, inside flushSync) — two mounted elements sharing a
      view-transition-name make the browser skip the morph. */

const HANDOFF_NAME = 'brand-wordmark'

function HandoffDemo(): React.JSX.Element {
  const [run, setRun] = React.useState(0)
  const [playing, setPlaying] = React.useState(true)

  const handleComplete = (): void => {
    // defer past BrandSplash's effect so flushSync is legal
    queueMicrotask(() => {
      void startBrandHandoff(() => {
        flushSync(() => setPlaying(false))
      })
    })
  }

  return (
    <div>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar
          header={
            <SidebarBrand
              logo={<span aria-hidden>◆</span>}
              title="Cybond"
              handoffName={playing ? undefined : HANDOFF_NAME}
            />
          }
        >
          <div className="rounded-md px-3 py-2 text-sm text-muted-foreground">Today</div>
          <div className="rounded-md px-3 py-2 text-sm text-muted-foreground">Calendar</div>
          <div className="rounded-md px-3 py-2 text-sm text-muted-foreground">Goals</div>
        </Sidebar>
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold">Good evening</h1>
          <p className="mt-2 text-sm text-muted-foreground">Mock app content behind the splash.</p>
        </main>
      </div>
      {playing ? (
        <BrandSplash
          key={run}
          wordmark="Cybond"
          splitIndex={2}
          quote={{ text: 'Bond to what matters.', attribution: null }}
          handoffName={HANDOFF_NAME}
          exit="external"
          onComplete={handleComplete}
        />
      ) : (
        <Button
          className="fixed bottom-6 right-6"
          onClick={() => {
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

export const Handoff: Story = { render: () => <HandoffDemo /> }
