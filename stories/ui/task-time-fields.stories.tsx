import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { TaskTimeFields } from '@/components/ui/task-time-fields'
import type { TaskTimeFieldsProps } from '@/components/ui/task-time-fields'

const meta: Meta<typeof TaskTimeFields> = {
  title: 'Inputs/TaskTimeFields',
  component: TaskTimeFields,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof TaskTimeFields>

function ControlledTaskTimeFields(props: Partial<TaskTimeFieldsProps> & { showDate?: boolean }) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')

  return (
    <div className="w-80">
      <TaskTimeFields
        date={date}
        onDateChange={setDate}
        startTime={startTime}
        onStartTimeChange={setStartTime}
        endTime={endTime}
        onEndTimeChange={setEndTime}
        {...props}
      />
    </div>
  )
}

export const Default: Story = {
  render: () => <ControlledTaskTimeFields />,
}

export const NoDate: Story = {
  render: () => <ControlledTaskTimeFields showDate={false} />,
}

export const TwentyFourHour: Story = {
  name: '24-hour time',
  render: () => <ControlledTaskTimeFields use24h />,
}
