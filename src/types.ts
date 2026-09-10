export type AgentState = 'working' | 'idle' | 'blocked' | 'done'

export type Agent = {
  id: string
  name: string
  role: string
  department: string
  color: number
  state: AgentState
  task: string
}
