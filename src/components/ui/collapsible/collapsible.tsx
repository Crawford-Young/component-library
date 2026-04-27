import * as React from 'react'
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleTrigger>
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleTrigger
    ref={ref}
    className={cn('group', className)}
    {...props}
  />
))
CollapsibleTrigger.displayName = CollapsiblePrimitive.CollapsibleTrigger.displayName

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleContent
    ref={ref}
    className={cn(
      'overflow-hidden',
      'data-[state=open]:animate-collapsible-down',
      'data-[state=closed]:animate-collapsible-up',
      'motion-reduce:animate-none',
      className,
    )}
    {...props}
  />
))
CollapsibleContent.displayName = CollapsiblePrimitive.CollapsibleContent.displayName

const CollapsibleIndicator = React.forwardRef<
  SVGSVGElement,
  React.ComponentPropsWithoutRef<typeof ChevronDown>
>(({ className, ...props }, ref) => (
  <ChevronDown
    ref={ref}
    className={cn(
      'size-4 shrink-0 transition-transform duration-200',
      'group-data-[state=open]:rotate-180',
      'motion-reduce:transition-none',
      className,
    )}
    {...props}
  />
))
CollapsibleIndicator.displayName = 'CollapsibleIndicator'

export { Collapsible, CollapsibleContent, CollapsibleIndicator, CollapsibleTrigger }
