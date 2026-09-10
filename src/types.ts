export type AgentState = 'working' | 'idle' | 'blocked' | 'done'

export type Task = {
  id: string
  agentId: string
  description: string
  createdAt: number
  result?: string
}

export type Agent = {
  id: string
  name: string
  role: string
  department: string
  color: number
  state: AgentState
  task: string
  currentTask?: Task
}

export type LogKind = 'assigned' | 'started' | 'completed' | 'system'

export type LogEntry = {
  id: string
  time: string
  text: string
  kind: LogKind
}
