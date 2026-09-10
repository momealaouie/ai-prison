import { useEffect, useRef, useState } from 'react'
import { initialAgents } from './agents'
import { advanceAgent, createTask, logEntryFor, runMockTask } from './taskEngine'
import type { TaskEvent } from './taskEngine'
import type { Agent, LogEntry } from './types'

const seedLog: LogEntry[] = [
  { id: 'seed-1', time: '09:42', text: 'Nova delade upp dagens mål.', kind: 'system' },
  { id: 'seed-2', time: '09:39', text: 'Pixel började skriva ett nytt manus.', kind: 'system' },
  { id: 'seed-3', time: '09:31', text: 'Echo väntar på ditt godkännande.', kind: 'system' },
]

const LOG_LIMIT = 40

export function useAgentWorld() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents)
  const [log, setLog] = useState<LogEntry[]>(seedLog)
  const [selectedId, setSelectedId] = useState<string>(initialAgents[0].id)
  const running = useRef(new Map<string, () => void>())

  useEffect(() => {
    const timers = running.current
    return () => {
      timers.forEach(cancel => cancel())
      timers.clear()
    }
  }, [])

  const apply = (agent: Agent, event: TaskEvent) => {
    setAgents(current => current.map(item => (item.id === agent.id ? advanceAgent(item, event) : item)))
    setLog(current => [logEntryFor(agent, event), ...current].slice(0, LOG_LIMIT))
  }

  const assignTask = (agentId: string, description: string) => {
    const agent = agents.find(item => item.id === agentId)
    if (!agent || !description.trim()) return
    running.current.get(agentId)?.()
    const task = createTask(agentId, description)
    apply(agent, { phase: 'assigned', task })
    running.current.set(
      agentId,
      runMockTask(agent, task, event => {
        if (event.phase === 'completed') running.current.delete(agentId)
        apply(agent, event)
      }),
    )
  }

  return {
    agents,
    log,
    selectedId,
    selected: agents.find(item => item.id === selectedId) ?? null,
    setSelectedId,
    assignTask,
  }
}
