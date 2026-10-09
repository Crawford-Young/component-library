import type { Meta, StoryObj } from '@storybook/react'
import {
  Transcript,
  TranscriptNote,
  TranscriptPermission,
  TranscriptPermissionChoice,
  TranscriptText,
  TranscriptThinking,
  TranscriptTodo,
  TranscriptTodos,
  TranscriptToolCall,
  TranscriptUserTurn,
} from '@/components/ui/transcript'

const meta: Meta<typeof Transcript> = {
  title: 'Display/Transcript',
  component: Transcript,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Presentational compound for an agent console transcript, styled like a Claude Code session. Each part renders its own `<li>`; the app maps its records onto parts. Every part takes a `timestamp` slot; Thinking and ToolCall results are Radix collapsibles (`open` / `defaultOpen` / `onOpenChange`).',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Transcript>

const time = (t: string) => <time dateTime={`2026-10-08T${t}`}>{t}</time>

export const Default: Story = {
  render: () => (
    <Transcript className="max-w-xl">
      <TranscriptUserTurn timestamp={time('14:02:01')}>
        Add a Transcript component to the UI library
      </TranscriptUserTurn>
      <TranscriptThinking timestamp={time('14:02:03')}>
        The library uses Radix collapsibles already, so the thinking block and tool results can
        reuse them.
      </TranscriptThinking>
      <TranscriptText timestamp={time('14:02:05')}>
        I&apos;ll start by reading the existing collapsible component.
      </TranscriptText>
      <TranscriptToolCall
        timestamp={time('14:02:06')}
        status="success"
        head="Read(src/components/ui/collapsible/collapsible.tsx)"
        resultSummary="Read 61 lines"
        result={
          'import * as React from "react"\nimport * as CollapsiblePrimitive from "@radix-ui/react-collapsible"'
        }
      />
      <TranscriptTodos timestamp={time('14:02:08')}>
        <TranscriptTodo status="completed">Read the collapsible primitive</TranscriptTodo>
        <TranscriptTodo status="in_progress">Write the failing test</TranscriptTodo>
        <TranscriptTodo>Implement the parts</TranscriptTodo>
      </TranscriptTodos>
      <TranscriptToolCall
        timestamp={time('14:02:12')}
        status="error"
        head="Bash(pnpm vitest run transcript)"
        resultSummary="Error: Failed to resolve import"
        result="Error: Failed to resolve import './transcript'"
      />
      <TranscriptNote tone="error" timestamp={time('14:02:12')}>
        Test run failed (expected: red step)
      </TranscriptNote>
      <TranscriptToolCall timestamp={time('14:02:20')} status="waiting" head="Bash(rm -rf dist)" />
      <TranscriptPermission timestamp={time('14:02:20')} command="rm -rf dist">
        <TranscriptPermissionChoice number={1} highlighted disabled>
          Yes
        </TranscriptPermissionChoice>
        <TranscriptPermissionChoice number={2} disabled>
          Yes, and don&apos;t ask again for rm commands
        </TranscriptPermissionChoice>
        <TranscriptPermissionChoice number={3} disabled>
          No, and tell Claude what to do differently
        </TranscriptPermissionChoice>
      </TranscriptPermission>
    </Transcript>
  ),
}

export const Expanded: Story = {
  render: () => (
    <Transcript className="max-w-xl">
      <TranscriptThinking defaultOpen timestamp={time('09:15:00')}>
        Check the token list before choosing tone colours.
      </TranscriptThinking>
      <TranscriptToolCall
        defaultOpen
        timestamp={time('09:15:02')}
        status="success"
        head="Grep(--warning)"
        resultSummary="Found 3 matches"
        result={'src/styles/tokens.css:37\nsrc/styles/tokens.css:97\nsrc/tailwind/preset.ts:41'}
      />
    </Transcript>
  ),
}

export const ToolStatuses: Story = {
  render: () => (
    <Transcript className="max-w-xl">
      <TranscriptToolCall status="pending" head="Read(README.md)" />
      <TranscriptToolCall status="running" head="Bash(pnpm test)" />
      <TranscriptToolCall status="waiting" head="Bash(git push)" />
      <TranscriptToolCall
        status="success"
        head="Edit(src/index.ts)"
        resultSummary="Updated 1 line"
      />
      <TranscriptToolCall status="error" head="WebFetch(https://example.com)" resultSummary="404" />
    </Transcript>
  ),
}

export const NoteTones: Story = {
  render: () => (
    <Transcript className="max-w-xl">
      <TranscriptNote>Default note</TranscriptNote>
      <TranscriptNote tone="success">Tests passed</TranscriptNote>
      <TranscriptNote tone="warning">Context at 80%</TranscriptNote>
      <TranscriptNote tone="error">Command exited with code 1</TranscriptNote>
      <TranscriptNote tone="info">Resumed from checkpoint</TranscriptNote>
    </Transcript>
  ),
}
