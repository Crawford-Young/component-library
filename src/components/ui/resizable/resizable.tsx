import * as React from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { cn } from '@/lib/utils'

export {
  useGroupRef,
  usePanelRef,
  type GroupImperativeHandle,
  type PanelImperativeHandle,
} from 'react-resizable-panels'

type ResizablePanelGroupProps = React.ComponentProps<typeof Group>

/** Group of resizable panels; `orientation` is "horizontal" (default) or "vertical". */
function ResizablePanelGroup({ className, ...props }: ResizablePanelGroupProps): React.JSX.Element {
  return <Group className={cn('flex h-full w-full', className)} {...props} />
}

type ResizablePanelProps = React.ComponentProps<typeof Panel>

/** Resizable panel: min/max/default size, `collapsible`, and `panelRef` (see `usePanelRef`). */
function ResizablePanel({ className, ...props }: ResizablePanelProps): React.JSX.Element {
  return <Panel className={cn('overflow-hidden', className)} {...props} />
}

type ResizableHandleProps = React.ComponentProps<typeof Separator> & {
  /** Show a grip affordance in the middle of the handle. */
  readonly withHandle?: boolean
}

/**
 * Drag/keyboard separator between panels. Role, ARIA and arrow-key resizing come
 * from the library; this adds the visual line, grip and a visible focus ring.
 */
function ResizableHandle({
  withHandle = false,
  className,
  ...props
}: ResizableHandleProps): React.JSX.Element {
  return (
    <Separator
      className={cn(
        'relative flex shrink-0 items-center justify-center bg-border outline-none transition-colors',
        'hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
        'aria-[orientation=vertical]:w-px aria-[orientation=vertical]:cursor-col-resize',
        'aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:cursor-row-resize',
        'after:absolute after:content-[""] aria-[orientation=vertical]:after:inset-y-0 aria-[orientation=vertical]:after:-inset-x-1 aria-[orientation=horizontal]:after:inset-x-0 aria-[orientation=horizontal]:after:-inset-y-1',
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div data-grip className="z-10 h-4 w-3 rounded-sm border border-border bg-surface-raised" />
      )}
    </Separator>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
export type { ResizablePanelGroupProps, ResizablePanelProps, ResizableHandleProps }
