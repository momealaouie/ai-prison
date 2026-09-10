import { describe, expect, it } from 'vitest'
import { MAP_H, MAP_W, PLAYER_START, agentHome, buildMap, reachable } from './map'
import { PROP_ART } from './pixels'

const map = buildMap()

describe('buildMap', () => {
  it('surrounds the building with grass and keeps the outer edge walled', () => {
    expect(map.kind[0][0]).toBe('grass')
    expect(map.kind[MAP_H - 1][MAP_W - 1]).toBe('grass')
    expect(map.kind[2][2]).toBe('wall')
  })

  it('does not start the player inside a wall', () => {
    expect(map.solid[PLAYER_START.ty][PLAYER_START.tx]).toBe(false)
  })

  it('keeps every prop inside its room', () => {
    for (const room of map.rooms) {
      for (const placement of room.props) {
        const [pw, ph] = PROP_ART[placement.prop].solid
        expect(placement.tx + pw, `${room.id}/${placement.prop}`).toBeLessThanOrEqual(room.w)
        expect(placement.ty + ph, `${room.id}/${placement.prop}`).toBeLessThanOrEqual(room.h)
      }
    }
  })

  it('never stacks two props on the same tile', () => {
    for (const room of map.rooms) {
      const taken = new Set<string>()
      for (const placement of room.props) {
        const [pw, ph] = PROP_ART[placement.prop].solid
        for (let dy = 0; dy < ph; dy++) {
          for (let dx = 0; dx < pw; dx++) {
            const key = `${placement.tx + dx},${placement.ty + dy}`
            expect(taken.has(key), `${room.id} has two props on ${key}`).toBe(false)
            taken.add(key)
          }
        }
      }
    }
  })
})

describe('walkability', () => {
  const open = reachable(map)

  it('lets the player walk from the corridor into every room', () => {
    for (const room of map.rooms) {
      const { tx, ty } = agentHome(map, room)
      expect(map.solid[ty][tx], `${room.id} home tile is blocked`).toBe(false)
      expect(open.has(`${tx},${ty}`), `${room.id} is walled off from the corridor`).toBe(true)
    }
  })

  it('does not let the player escape onto the grass', () => {
    expect(open.has('0,0')).toBe(false)
  })
})
