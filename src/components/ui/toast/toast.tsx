import * as React from 'react'
import { Toaster as SonnerToaster, toast } from 'sonner'

type ToasterProps = React.ComponentProps<typeof SonnerToaster>

const Toaster = ({ theme = 'system', position = 'bottom-right', ...props }: ToasterProps) => (
  <SonnerToaster
    theme={theme}
    position={position}
    toastOptions={{
      classNames: {
        toast:
          'group toast group-[.toaster]:bg-surface group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
        description: 'group-[.toast]:text-muted-foreground',
        actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
        cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
      },
    }}
    {...props}
  />
)
Toaster.displayName = 'Toaster'

export { Toaster, toast }
