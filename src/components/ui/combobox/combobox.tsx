import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
}

const Combobox = ({
  options,
  value,
  onValueChange,
  placeholder = 'Select option…',
  searchPlaceholder = 'Search…',
  emptyText = 'No option found.',
  className,
  disabled,
}: ComboboxProps) => {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(value ?? '')

  const controlled = value !== undefined
  const currentValue = controlled ? value : internalValue

  const selectedLabel = options.find((opt) => opt.value === currentValue)?.label

  const handleSelect = (selectedValue: string) => {
    const next = selectedValue === currentValue ? '' : selectedValue
    if (!controlled) setInternalValue(next)
    onValueChange?.(next)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'inline-flex w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
            'ring-offset-background transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            !currentValue && 'text-muted-foreground',
            className,
          )}
        >
          {selectedLabel ?? placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem key={opt.value} value={opt.value} onSelect={handleSelect}>
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      currentValue === opt.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
Combobox.displayName = 'Combobox'

export { Combobox }
export type { ComboboxOption, ComboboxProps }
