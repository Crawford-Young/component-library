import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Check, ChevronsUpDown, Home, Settings, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Combobox } from '@/components/ui/combobox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const frameworks = [
  { value: 'next.js', label: 'Next.js' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt.js', label: 'Nuxt.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
]

const meta = {
  title: 'Menus/Combobox',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function ComboboxDemo() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          aria-haspopup="listbox"
          className="w-[200px] justify-between"
        >
          {value ? frameworks.find((f) => f.value === value)?.label : 'Select framework…'}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework…" />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(current) => {
                    setValue(current === value ? '' : current)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 size-4',
                      value === framework.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {framework.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export const Default: Story = {
  render: () => <ComboboxDemo />,
}

interface RichOption {
  value: string
  label: string
  description: string
  icon: React.ReactNode
}

const richOptions: RichOption[] = [
  {
    value: 'home',
    label: 'Home',
    description: 'Personal dashboard',
    icon: <Home className="h-4 w-4" />,
  },
  {
    value: 'settings',
    label: 'Settings',
    description: 'Configure your preferences',
    icon: <Settings className="h-4 w-4" />,
  },
  {
    value: 'power',
    label: 'Power',
    description: 'System power controls',
    icon: <Zap className="h-4 w-4" />,
  },
]

function RichOptionsDemo() {
  const [value, setValue] = React.useState('')
  const selectedLabel = richOptions.find((opt) => opt.value === value)?.label
  return (
    <Combobox
      options={richOptions.map((opt) => ({
        value: opt.value,
        label: opt.label,
      }))}
      value={value}
      onValueChange={setValue}
      placeholder={selectedLabel || 'Select option…'}
      renderOption={(opt, { selected }) => {
        const richOpt = richOptions.find((o) => o.value === opt.value)
        return (
          <div className="flex items-center gap-2">
            {selected && <Check className="h-4 w-4" />}
            <div className="flex items-center gap-2">
              {richOpt?.icon}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{richOpt?.label}</span>
                <span className="text-xs text-muted-foreground">{richOpt?.description}</span>
              </div>
            </div>
          </div>
        )
      }}
    />
  )
}

export const RichOptions: Story = {
  render: () => <RichOptionsDemo />,
}
