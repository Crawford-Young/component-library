import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const sliderVariants = cva(
  [
    'relative flex w-full touch-none select-none items-center',
    'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
  ],
  {
    variants: {
      size: {
        sm: 'h-1',
        default: 'h-1.5',
        lg: 'h-2',
      },
    },
    defaultVariants: { size: 'default' },
  },
)

const sliderThumbVariants = cva(
  [
    'block rounded-full border-2 border-accent bg-background',
    'ring-offset-background',
    'transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: 'size-3',
        default: 'size-4',
        lg: 'size-5',
      },
    },
    defaultVariants: { size: 'default' },
  },
)

export type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> &
  VariantProps<typeof sliderVariants>

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, size, ...props }, ref) => {
    const value = props.value ?? props.defaultValue ?? [0]
    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(sliderVariants({ size }), className)}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn(
            'relative h-full w-full grow overflow-hidden rounded-full bg-surface-raised',
          )}
        >
          <SliderPrimitive.Range className="absolute h-full bg-accent" />
        </SliderPrimitive.Track>
        {value.map((_, i) => (
          <SliderPrimitive.Thumb key={i} className={cn(sliderThumbVariants({ size }))} />
        ))}
      </SliderPrimitive.Root>
    )
  },
)
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
