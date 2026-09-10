import type { Agent } from './types'

export const initialAgents: Agent[] = [
  { id: 'director', name: 'Nova', role: 'Direktör', department: 'Huvudkontor', color: 0xffc857, state: 'working', task: 'Delar upp dagens mål' },
  { id: 'content', name: 'Pixel', role: 'Content-agent', department: 'Media', color: 0xff6b6b, state: 'working', task: 'Skriver ett YouTube-manus' },
  { id: 'marketing', name: 'Milo', role: 'Marketing-agent', department: 'Marknad', color: 0x61c0bf, state: 'idle', task: 'Väntar på nästa kampanj' },
  { id: 'sales', name: 'Echo', role: 'Sales-agent', department: 'Försäljning', color: 0xb39ddb, state: 'blocked', task: 'Behöver godkännande från dig' },
]
