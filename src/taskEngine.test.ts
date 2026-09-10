import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { initialAgents } from './agents'
import {
  START_DELAY_MS,
  WORK_DURATION_MS,
  advanceAgent,
  createTask,
  logEntryFor,
  runMockTask,
} from './taskEngine'
import type { Agent } from './types'

const marketing = initialAgents.find(agent => agent.id === 'marketing') as Agent

describe('createTask', () => {
  it('trims the description and links the task to the agent', () => {
    const task = createTask('marketing', '  Planera en kampanj  ')
    expect(task.description).toBe('Planera en kampanj')
    expect(task.agentId).toBe('marketing')
  })

  it('gives every task a unique id', () => {
    const first = createTask('marketing', 'A')
    const second = createTask('marketing', 'B')
    expect(first.id).not.toBe(second.id)
  })
})

describe('advanceAgent', () => {
  const task = createTask('marketing', 'Planera en kampanj')

  it('moves idle -> working -> done and keeps the task visible', () => {
    const assigned = advanceAgent(marketing, { phase: 'assigned', task })
    expect(assigned.state).toBe('idle')
    expect(assigned.task).toBe('Planera en kampanj')

    const working = advanceAgent(assigned, { phase: 'started', task })
    expect(working.state).toBe('working')
    expect(working.task).toBe('Planera en kampanj')

    const done = advanceAgent(working, { phase: 'completed', task, result: 'Klart' })
    expect(done.state).toBe('done')
    expect(done.task).toBe('Planera en kampanj')
    expect(done.currentTask?.result).toBe('Klart')
  })

  it('takes a blocked agent over to the new task', () => {
    const blocked = initialAgents.find(agent => agent.id === 'sales') as Agent
    expect(blocked.state).toBe('blocked')
    expect(advanceAgent(blocked, { phase: 'assigned', task }).state).toBe('idle')
  })

  it('does not mutate the agent it is given', () => {
    const before = { ...marketing }
    advanceAgent(marketing, { phase: 'started', task })
    expect(marketing).toEqual(before)
  })
})

describe('logEntryFor', () => {
  const task = createTask('marketing', 'Planera en kampanj')
  const at = new Date(2026, 0, 1, 9, 5)

  it('writes one entry per phase', () => {
    expect(logEntryFor(marketing, { phase: 'assigned', task }, at).text).toContain('Planera en kampanj')
    expect(logEntryFor(marketing, { phase: 'started', task }, at).text).toContain('började arbeta')
    expect(logEntryFor(marketing, { phase: 'completed', task, result: 'Klart' }, at).text).toContain('Klart')
  })

  it('formats the clock with leading zeroes', () => {
    expect(logEntryFor(marketing, { phase: 'started', task }, at).time).toBe('09:05')
  })
})

describe('runMockTask', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('emits started and then completed', () => {
    const task = createTask('marketing', 'Planera en kampanj')
    const onEvent = vi.fn()
    runMockTask(marketing, task, onEvent)

    vi.advanceTimersByTime(START_DELAY_MS)
    expect(onEvent).toHaveBeenCalledTimes(1)
    expect(onEvent.mock.calls[0][0].phase).toBe('started')

    vi.advanceTimersByTime(WORK_DURATION_MS)
    expect(onEvent).toHaveBeenCalledTimes(2)
    expect(onEvent.mock.calls[1][0].phase).toBe('completed')
    expect(onEvent.mock.calls[1][0].result).toContain('Planera en kampanj')
  })

  it('stops emitting once cancelled', () => {
    const onEvent = vi.fn()
    const cancel = runMockTask(marketing, createTask('marketing', 'Planera en kampanj'), onEvent)
    cancel()
    vi.advanceTimersByTime(START_DELAY_MS + WORK_DURATION_MS)
    expect(onEvent).not.toHaveBeenCalled()
  })
})
