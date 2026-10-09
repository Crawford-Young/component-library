import * as React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
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
} from './transcript'

function inList(node: React.ReactNode) {
  return render(<Transcript>{node}</Transcript>)
}

describe('Transcript', () => {
  it('renders an ordered list labelled "Agent transcript" in the mono font', () => {
    render(<Transcript />)
    const list = screen.getByRole('list', { name: 'Agent transcript' })
    expect(list.tagName).toBe('OL')
    expect(list).toHaveClass('font-mono')
  })

  it('accepts an overriding aria-label, className and forwards its ref', () => {
    const ref = React.createRef<HTMLOListElement>()
    render(<Transcript ref={ref} aria-label="Reviewer log" className="custom" />)
    const list = screen.getByRole('list', { name: 'Reviewer log' })
    expect(list).toHaveClass('custom')
    expect(ref.current).toBe(list)
  })

  it('keeps every part as its own list item, in order', () => {
    render(
      <Transcript>
        <TranscriptUserTurn>first</TranscriptUserTurn>
        <TranscriptText>second</TranscriptText>
        <TranscriptToolCall head="Read(a.ts)" />
      </Transcript>,
    )
    const items = screen.getAllByRole('listitem')
    expect(items.map((li) => li.textContent)).toEqual([
      expect.stringContaining('first'),
      expect.stringContaining('second'),
      expect.stringContaining('Read(a.ts)'),
    ])
  })

  it('has displayNames on every part', () => {
    expect(Transcript.displayName).toBe('Transcript')
    expect(TranscriptUserTurn.displayName).toBe('TranscriptUserTurn')
    expect(TranscriptText.displayName).toBe('TranscriptText')
    expect(TranscriptNote.displayName).toBe('TranscriptNote')
    expect(TranscriptThinking.displayName).toBe('TranscriptThinking')
    expect(TranscriptToolCall.displayName).toBe('TranscriptToolCall')
    expect(TranscriptTodos.displayName).toBe('TranscriptTodos')
    expect(TranscriptTodo.displayName).toBe('TranscriptTodo')
    expect(TranscriptPermission.displayName).toBe('TranscriptPermission')
    expect(TranscriptPermissionChoice.displayName).toBe('TranscriptPermissionChoice')
  })
})

describe('timestamps', () => {
  it('renders the timestamp slot on every part', () => {
    render(
      <Transcript>
        <TranscriptUserTurn timestamp="t-user">u</TranscriptUserTurn>
        <TranscriptText timestamp="t-text">x</TranscriptText>
        <TranscriptNote timestamp="t-note">n</TranscriptNote>
        <TranscriptThinking timestamp="t-think">th</TranscriptThinking>
        <TranscriptToolCall timestamp="t-tool" head="Bash(ls)" />
        <TranscriptTodos timestamp="t-todos" />
        <TranscriptPermission timestamp="t-perm" />
      </Transcript>,
    )
    const items = screen.getAllByRole('listitem')
    const stamps = ['t-user', 't-text', 't-note', 't-think', 't-tool', 't-todos', 't-perm']
    stamps.forEach((stamp, i) => {
      expect(within(items[i]!).getByText(stamp)).toHaveClass('tabular-nums')
    })
  })

  it('omits the timestamp element when no timestamp is given', () => {
    const { container } = inList(<TranscriptText>x</TranscriptText>)
    expect(container.querySelector('.tabular-nums')).toBeNull()
  })
})

describe('TranscriptUserTurn', () => {
  it('renders a decorative ">" prefix on a surface background with an sr-only label', () => {
    const ref = React.createRef<HTMLLIElement>()
    inList(
      <TranscriptUserTurn ref={ref} className="u">
        do it
      </TranscriptUserTurn>,
    )
    const item = screen.getByRole('listitem')
    expect(ref.current).toBe(item)
    expect(item).toHaveClass('u')
    expect(within(item).getByText('>')).toHaveAttribute('aria-hidden', 'true')
    expect(within(item).getByText('User:')).toHaveClass('sr-only')
    expect(within(item).getByText('do it').closest('.bg-surface')).not.toBeNull()
  })
})

describe('TranscriptText', () => {
  it('renders assistant text in the foreground colour', () => {
    const ref = React.createRef<HTMLLIElement>()
    inList(
      <TranscriptText ref={ref} className="t">
        hello
      </TranscriptText>,
    )
    expect(ref.current).toHaveClass('t')
    expect(screen.getByText('hello')).toHaveClass('text-foreground')
  })
})

describe('TranscriptNote', () => {
  it('renders a decorative ⎿ and muted text by default', () => {
    const ref = React.createRef<HTMLLIElement>()
    inList(
      <TranscriptNote ref={ref} className="n">
        Read 3 files
      </TranscriptNote>,
    )
    expect(ref.current).toHaveClass('n')
    expect(screen.getByText('⎿')).toHaveAttribute('aria-hidden', 'true')
    expect(ref.current).toHaveAttribute('data-tone', 'default')
    expect(screen.getByText('Read 3 files').parentElement).toHaveClass('text-muted-foreground')
  })

  it.each(['success', 'warning', 'error', 'info'] as const)(
    'applies a token-mixed colour for the %s tone',
    (tone) => {
      const ref = React.createRef<HTMLLIElement>()
      inList(
        <TranscriptNote ref={ref} tone={tone}>
          msg
        </TranscriptNote>,
      )
      expect(ref.current).toHaveAttribute('data-tone', tone)
      const token = tone === 'error' ? 'destructive' : tone
      expect(screen.getByText('msg').parentElement!.className).toContain(`var(--${token})`)
    },
  )
})

describe('TranscriptThinking', () => {
  it('is collapsed by default behind a "Thinking…" trigger with a decorative ✻', async () => {
    const user = userEvent.setup()
    inList(<TranscriptThinking>inner monologue</TranscriptThinking>)
    const trigger = screen.getByRole('button', { name: /Thinking…/ })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(within(trigger).getByText('✻')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByText('inner monologue')).toBeNull()
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('inner monologue')).toBeInTheDocument()
  })

  it('supports defaultOpen, a custom label, className and ref', () => {
    const ref = React.createRef<HTMLLIElement>()
    inList(
      <TranscriptThinking ref={ref} className="th" defaultOpen label="Pondering">
        visible
      </TranscriptThinking>,
    )
    expect(ref.current).toHaveClass('th')
    expect(screen.getByRole('button', { name: /Pondering/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByText('visible')).toBeInTheDocument()
  })

  it('is controllable via open + onOpenChange', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const { rerender } = inList(
      <TranscriptThinking open={false} onOpenChange={onOpenChange}>
        body
      </TranscriptThinking>,
    )
    await user.click(screen.getByRole('button', { name: /Thinking…/ }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByText('body')).toBeNull()
    rerender(
      <Transcript>
        <TranscriptThinking open onOpenChange={onOpenChange}>
          body
        </TranscriptThinking>
      </Transcript>,
    )
    expect(screen.getByText('body')).toBeInTheDocument()
  })
})

describe('TranscriptToolCall', () => {
  it('renders the head slot after a decorative status dot with an sr-only status', () => {
    const ref = React.createRef<HTMLLIElement>()
    inList(<TranscriptToolCall ref={ref} className="tc" head="Bash(pnpm test)" />)
    const item = ref.current!
    expect(item).toHaveClass('tc')
    expect(item).toHaveAttribute('data-status', 'running')
    expect(within(item).getByText('Bash(pnpm test)')).toBeInTheDocument()
    expect(item.querySelector('[data-slot="status-dot"]')).toHaveAttribute('aria-hidden', 'true')
    expect(within(item).getByText('Running:')).toHaveClass('sr-only')
  })

  it.each([
    ['pending', 'Pending:', 'bg-muted-foreground'],
    ['running', 'Running:', 'bg-muted-foreground'],
    ['waiting', 'Waiting:', 'bg-warning'],
    ['success', 'Done:', 'bg-success'],
    ['error', 'Failed:', 'bg-destructive'],
  ] as const)('status %s colours the dot and labels it', (status, label, bg) => {
    const ref = React.createRef<HTMLLIElement>()
    inList(<TranscriptToolCall ref={ref} status={status} head="Edit(x)" />)
    expect(ref.current).toHaveAttribute('data-status', status)
    expect(ref.current!.querySelector('[data-slot="status-dot"]')).toHaveClass(bg)
    expect(screen.getByText(label)).toHaveClass('sr-only')
  })

  it('animates the running dot only under motion-safe', () => {
    const ref = React.createRef<HTMLLIElement>()
    inList(<TranscriptToolCall ref={ref} status="running" head="h" />)
    expect(ref.current!.querySelector('[data-slot="status-dot"]')).toHaveClass(
      'motion-safe:animate-pulse',
    )
  })

  it('accepts a custom status label', () => {
    inList(<TranscriptToolCall status="error" statusLabel="Denied:" head="h" />)
    expect(screen.getByText('Denied:')).toHaveClass('sr-only')
    expect(screen.queryByText('Failed:')).toBeNull()
  })

  it('shows "Waiting for permission…" only for the waiting status', () => {
    const { unmount } = inList(<TranscriptToolCall status="waiting" head="h" />)
    const line = screen.getByText('Waiting for permission…')
    expect(line.parentElement!.className).toContain('var(--warning)')
    unmount()
    inList(<TranscriptToolCall status="success" head="h" />)
    expect(screen.queryByText('Waiting for permission…')).toBeNull()
  })

  it('accepts a custom waiting label', () => {
    inList(<TranscriptToolCall status="waiting" waitingLabel="Awaiting approval" head="h" />)
    expect(screen.getByText('Awaiting approval')).toBeInTheDocument()
  })

  it('renders a static ⎿ summary when there is no result body', () => {
    inList(<TranscriptToolCall head="h" resultSummary="Read 40 lines" />)
    expect(screen.getByText('Read 40 lines')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('collapses the result body behind a ⎿ summary trigger', async () => {
    const user = userEvent.setup()
    inList(<TranscriptToolCall head="h" resultSummary="12 lines" result={<pre>full output</pre>} />)
    const trigger = screen.getByRole('button', { name: /12 lines/ })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(within(trigger).getByText('⎿')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByText('full output')).toBeNull()
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('full output')).toBeInTheDocument()
  })

  it('falls back to a "Show result" trigger label when only a result is given', () => {
    inList(<TranscriptToolCall head="h" result="body" defaultOpen />)
    expect(screen.getByRole('button', { name: /Show result/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByText('body')).toBeInTheDocument()
  })

  it('is controllable via open + onOpenChange', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    inList(
      <TranscriptToolCall
        head="h"
        resultSummary="s"
        result="body"
        open={false}
        onOpenChange={onOpenChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: /s/ }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByText('body')).toBeNull()
  })
})

describe('TranscriptTodos', () => {
  it('renders a bordered box with a default "Todos" title and its items', () => {
    const ref = React.createRef<HTMLLIElement>()
    inList(
      <TranscriptTodos ref={ref} className="td">
        <TranscriptTodo>Write tests</TranscriptTodo>
      </TranscriptTodos>,
    )
    expect(ref.current).toHaveClass('td')
    expect(within(ref.current!).getByText('Todos')).toBeInTheDocument()
    const box = ref.current!.querySelector('.border')
    expect(box).not.toBeNull()
    const items = within(ref.current!).getAllByRole('listitem')
    expect(items).toHaveLength(1)
  })

  it('accepts a custom title', () => {
    inList(<TranscriptTodos title="Plan" />)
    expect(screen.getByText('Plan')).toBeInTheDocument()
  })

  it.each([
    ['pending', '☐', 'Pending:'],
    ['in_progress', '◼', 'In progress:'],
    ['completed', '☒', 'Completed:'],
  ] as const)('status %s shows a decorative box and an sr-only status', (status, box, label) => {
    const ref = React.createRef<HTMLLIElement>()
    inList(
      <TranscriptTodos>
        <TranscriptTodo ref={ref} status={status} className="item">
          task
        </TranscriptTodo>
      </TranscriptTodos>,
    )
    expect(ref.current).toHaveClass('item')
    expect(ref.current).toHaveAttribute('data-status', status)
    expect(within(ref.current!).getByText(box)).toHaveAttribute('aria-hidden', 'true')
    expect(within(ref.current!).getByText(label)).toHaveClass('sr-only')
  })

  it('strikes through completed items only', () => {
    inList(
      <TranscriptTodos>
        <TranscriptTodo status="completed">done</TranscriptTodo>
        <TranscriptTodo status="in_progress">doing</TranscriptTodo>
      </TranscriptTodos>,
    )
    expect(screen.getByText('done')).toHaveClass('line-through')
    expect(screen.getByText('doing')).not.toHaveClass('line-through')
  })
})

describe('TranscriptPermission', () => {
  it('renders an alert with a default question and the command slot', () => {
    const ref = React.createRef<HTMLLIElement>()
    inList(<TranscriptPermission ref={ref} className="p" command="rm -rf dist" />)
    expect(ref.current).toHaveClass('p')
    const alert = screen.getByRole('alert')
    expect(within(alert).getByText('Do you want to run this?')).toBeInTheDocument()
    expect(within(alert).getByText('rm -rf dist')).toBeInTheDocument()
  })

  it('accepts a custom question and omits the command box when no command is given', () => {
    inList(<TranscriptPermission question="Allow edit?" />)
    expect(screen.getByText('Allow edit?')).toBeInTheDocument()
    expect(screen.getByRole('alert').querySelector('[data-slot="command"]')).toBeNull()
  })

  it('renders numbered choices as real buttons, the highlighted one with a decorative ❯', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const ref = React.createRef<HTMLButtonElement>()
    inList(
      <TranscriptPermission command="ls">
        <TranscriptPermissionChoice ref={ref} number={1} highlighted onSelect={onSelect}>
          Yes
        </TranscriptPermissionChoice>
        <TranscriptPermissionChoice number={2}>No</TranscriptPermissionChoice>
      </TranscriptPermission>,
    )
    const yes = screen.getByRole('button', { name: /1\. Yes/ })
    expect(ref.current).toBe(yes)
    expect(within(yes).getByText('❯')).toHaveAttribute('aria-hidden', 'true')
    expect(yes).toHaveAttribute('data-highlighted', 'true')
    const no = screen.getByRole('button', { name: /2\. No/ })
    expect(no).not.toHaveAttribute('data-highlighted')
    expect(within(no).queryByText('❯')).toBeNull()
    await user.click(yes)
    expect(onSelect).toHaveBeenCalledTimes(1)
    await user.click(no)
  })

  it('also forwards onClick and responds to the keyboard', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onClick = vi.fn()
    inList(
      <TranscriptPermission>
        <TranscriptPermissionChoice number={1} onSelect={onSelect} onClick={onClick}>
          Yes
        </TranscriptPermissionChoice>
      </TranscriptPermission>,
    )
    await user.tab()
    expect(screen.getByRole('button', { name: /Yes/ })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disabled choices do not fire onSelect', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    inList(
      <TranscriptPermission>
        <TranscriptPermissionChoice number={1} disabled onSelect={onSelect} className="c">
          Yes
        </TranscriptPermissionChoice>
      </TranscriptPermission>,
    )
    const button = screen.getByRole('button', { name: /Yes/ })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('c', 'disabled:pointer-events-none')
    expect(button).toHaveAttribute('type', 'button')
    await user.click(button)
    expect(onSelect).not.toHaveBeenCalled()
  })
})
