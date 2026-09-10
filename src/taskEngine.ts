import type { Agent, LogEntry, Task } from './types'

/** Hur länge en mockad agent tänker innan den börjar, och hur länge arbetet tar. */
export const START_DELAY_MS = 900
export const WORK_DURATION_MS = 3200

export type TaskPhase = 'assigned' | 'started' | 'completed'

export type TaskEvent = { phase: TaskPhase; task: Task; result?: string }

let counter = 0

export function createTask(agentId: string, description: string, now = Date.now()): Task {
  counter += 1
  return { id: `task-${now}-${counter}`, agentId, description: description.trim(), createdAt: now }
}

/** Mockat resultat. Ersätts senare av riktig modell-/verktygsexekvering. */
export function mockResult(agent: Agent, task: Task): string {
  const templates: Record<string, string> = {
    'Direktör': `Bröt ner "${task.description}" i 3 delsteg och fördelade dem.`,
    'Content-agent': `Skrev ett utkast för "${task.description}".`,
    'Marketing-agent': `Tog fram en kampanjidé för "${task.description}".`,
    'Sales-agent': `Listade 5 möjliga leads för "${task.description}".`,
  }
  return templates[agent.role] ?? `Slutförde "${task.description}".`
}

/** Ren tillståndsövergång: idle -> working -> done. */
export function advanceAgent(agent: Agent, event: TaskEvent): Agent {
  switch (event.phase) {
    case 'assigned':
      return { ...agent, state: 'idle', task: event.task.description, currentTask: event.task }
    case 'started':
      return { ...agent, state: 'working', task: event.task.description, currentTask: event.task }
    case 'completed':
      return { ...agent, state: 'done', task: event.task.description, currentTask: { ...event.task, result: event.result } }
  }
}

export function formatClock(date = new Date()): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function logEntryFor(agent: Agent, event: TaskEvent, date = new Date()): LogEntry {
  const text =
    event.phase === 'assigned'
      ? `Du gav ${agent.name} ett nytt uppdrag: "${event.task.description}"`
      : event.phase === 'started'
        ? `${agent.name} började arbeta i ${agent.department}.`
        : `${agent.name} blev klar. ${event.result ?? ''}`.trim()
  return { id: `${event.task.id}-${event.phase}`, time: formatClock(date), text, kind: event.phase }
}

/**
 * Mockad exekvering: schemalägger start och slutförande.
 * Returnerar en avbrytsfunktion så att ett nytt uppdrag kan ersätta ett pågående.
 */
export function runMockTask(agent: Agent, task: Task, onEvent: (event: TaskEvent) => void): () => void {
  const started = setTimeout(() => onEvent({ phase: 'started', task }), START_DELAY_MS)
  const completed = setTimeout(
    () => onEvent({ phase: 'completed', task, result: mockResult(agent, task) }),
    START_DELAY_MS + WORK_DURATION_MS,
  )
  return () => {
    clearTimeout(started)
    clearTimeout(completed)
  }
}
