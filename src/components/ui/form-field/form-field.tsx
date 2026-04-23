import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

interface FormFieldContextValue {
  id: string
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

function useFormField(): FormFieldContextValue {
  const ctx = React.useContext(FormFieldContext)
  if (!ctx) throw new Error('useFormField must be used within <FormField>')
  return ctx
}

const FormField = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const id = React.useId()
    return (
      <FormFieldContext.Provider value={{ id }}>
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {children}
        </div>
      </FormFieldContext.Provider>
    )
  },
)
FormField.displayName = 'FormField'

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ ...props }, ref) => {
  const { id } = useFormField()
  return <Label ref={ref} htmlFor={id} {...props} />
})
FormLabel.displayName = 'FormLabel'

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { id } = useFormField()
  return <Slot ref={ref} id={id} {...props} />
})
FormControl.displayName = 'FormControl'

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  if (!children) return null
  return (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  )
})
FormDescription.displayName = 'FormDescription'

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  if (!children) return null
  return (
    <p ref={ref} className={cn('text-sm text-destructive font-medium', className)} {...props}>
      {children}
    </p>
  )
})
FormMessage.displayName = 'FormMessage'

export { FormField, FormLabel, FormControl, FormDescription, FormMessage }
