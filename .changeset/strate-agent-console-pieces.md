---
'@crawfordyoung/ui': minor
---

Add `ContextGauge`, `AgentNodeCard`, the `Transcript` compound (user turn, text, note, thinking, tool call, todos, permission prompt) and `ResizablePanelGroup`/`ResizablePanel`/`ResizableHandle` (new dependency `react-resizable-panels`). Fix the published package missing `dist/tailwind/index.d.ts`: the build's clean step raced the tailwind entry's type output.
