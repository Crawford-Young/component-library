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

function ControlledTaskTimeFields(
  props: Partial<TaskTimeFieldsProps> & { showDate?: boolean; showRecurrence?: boolean },
) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [recurrence, setRecurrence] = useState('none')
  const [recurrenceCount, setRecurrenceCount] = useState(1)

  return (
    <div className="w-80">
      <TaskTimeFields
        date={date}
        onDateChange={setDate}
        startTime={startTime}
        onStartTimeChange={setStartTime}
        endTime={endTime}
        onEndTimeChange={setEndTime}
        recurrence={recurrence}
        onRecurrenceChange={setRecurrence}
        recurrenceCount={recurrenceCount}
        onRecurrenceCountChange={setRecurrenceCount}
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

export const NoRecurrence: Story = {
  render: () => <ControlledTaskTimeFields showRecurrence={false} />,
}

export const WithWeeklyRecurrence: Story = {
  render: () => <ControlledTaskTimeFields showDate={true} showRecurrence={true} />,
}
