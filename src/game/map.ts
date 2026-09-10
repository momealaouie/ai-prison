import { PROP_ART, rng } from './pixels'

export type TileKind = 'grass' | 'corridor' | 'floor' | 'wall'

export type PropName = keyof typeof PROP_ART & string

export type PropPlacement = { prop: PropName; tx: number; ty: number }

export type Room = {
  id: string
  name: string
  agentId: string
  /** Rummets insida i rutor. Vaggarna ligger runt omkring. */
  x: number
  y: number
  w: number
  h: number
  floor: string
  accent: number
  props: PropPlacement[]
}

export const MAP_W = 56
export const MAP_H = 38

/** Byggnadens ytterkant. Utanfor den ar det gras. */
const BUILDING = { x: 2, y: 2, w: 52, h: 34 }

export const ROOMS: Room[] = [
  {
    id: 'huvudkontor', name: 'HUVUDKONTOR', agentId: 'director',
    x: 3, y: 3, w: 22, h: 13, floor: 'floor-warm', accent: 0xf7c948,
    props: furnish(22, 13, 101),
  },
  {
    id: 'media', name: 'MEDIA', agentId: 'content',
    x: 30, y: 3, w: 23, h: 13, floor: 'floor-mint', accent: 0xff6b6b,
    props: furnish(23, 13, 202),
  },
  {
    id: 'marknad', name: 'MARKNAD', agentId: 'marketing',
    x: 3, y: 21, w: 22, h: 14, floor: 'floor-blue', accent: 0x61c0bf,
    props: furnish(22, 14, 303),
  },
  {
    id: 'forsaljning', name: 'FÖRSÄLJNING', agentId: 'sales',
    x: 30, y: 21, w: 23, h: 14, floor: 'floor-lilac', accent: 0xb39ddb,
    props: furnish(23, 14, 404),
  },
]

/**
 * Moblerar ett rum pa fasta rader sa att inget kan hamna ovanpa nagot annat:
 * tva rader med stora mobler, tva rader med sma, sangar langs vanstra vaggen och
 * krukvaxter i hornen. Vilken mobel som hamnar var avgors av rummets fro.
 */
function furnish(w: number, h: number, seed: number): PropPlacement[] {
  const random = rng(seed)
  const pick = (options: PropName[]) => options[Math.floor(random() * options.length)]
  const big: PropName[] = ['desk', 'bookshelf', 'sofa']
  const small: PropName[] = ['chair', 'table', 'plant', 'terminal']
  const props: PropPlacement[] = []
  const add = (prop: PropName, tx: number, ty: number) => props.push({ prop, tx, ty })

  for (let x = 1; x + 2 <= w - 2; x += 3) add(pick(big), x, 1)
  add('plant', w - 2, 1)

  for (let x = 2; x <= w - 3; x += 2) add(pick(small), x, 3)

  for (let y = 5; y + 2 <= h - 1; y += 3) add('bed', 0, y)

  for (let x = 3; x + 2 <= w - 3; x += 4) add(pick(big), x, 6)

  for (let x = 2; x <= w - 3; x += 3) add(pick(small), x, 9)

  for (let x = 5; x + 2 <= w - 4; x += 4) add(pick(big), x, h - 2)
  add('plant', 2, h - 2)
  add('plant', w - 2, h - 2)

  return props
}

/** Oppningar i rumsvaggarna, i absoluta rutkoordinater. */
const DOORS: Array<[number, number]> = [
  [12, 16], [13, 16], [14, 16],
  [40, 16], [41, 16], [42, 16],
  [12, 20], [13, 20], [14, 20],
  [40, 20], [41, 20], [42, 20],
  [25, 8], [25, 9], [29, 8], [29, 9],
  [25, 27], [25, 28], [29, 27], [29, 28],
]

/** Dar spelaren borjar, mitt i korsningen mellan korridorerna. */
export const PLAYER_START = { tx: 27, ty: 18 }

export type WorldMap = {
  kind: TileKind[][]
  floor: string[][]
  solid: boolean[][]
  rooms: Room[]
}

function grid<T>(value: T): T[][] {
  return Array.from({ length: MAP_H }, () => Array.from({ length: MAP_W }, () => value))
}

function inBounds(x: number, y: number) {
  return x >= 0 && y >= 0 && x < MAP_W && y < MAP_H
}

function ring(x: number, y: number, w: number, h: number, apply: (x: number, y: number) => void) {
  for (let i = x; i < x + w; i++) {
    apply(i, y)
    apply(i, y + h - 1)
  }
  for (let j = y; j < y + h; j++) {
    apply(x, j)
    apply(x + w - 1, j)
  }
}

export function buildMap(): WorldMap {
  const kind = grid<TileKind>('grass')
  const floor = grid<string>('grass')

  const set = (x: number, y: number, k: TileKind, f: string) => {
    if (!inBounds(x, y)) return
    kind[y][x] = k
    floor[y][x] = f
  }

  for (let y = BUILDING.y; y < BUILDING.y + BUILDING.h; y++) {
    for (let x = BUILDING.x; x < BUILDING.x + BUILDING.w; x++) set(x, y, 'corridor', 'corridor')
  }
  ring(BUILDING.x, BUILDING.y, BUILDING.w, BUILDING.h, (x, y) => set(x, y, 'wall', 'wall'))

  for (const room of ROOMS) {
    ring(room.x - 1, room.y - 1, room.w + 2, room.h + 2, (x, y) => set(x, y, 'wall', 'wall'))
    for (let y = room.y; y < room.y + room.h; y++) {
      for (let x = room.x; x < room.x + room.w; x++) set(x, y, 'floor', room.floor)
    }
  }

  for (const [x, y] of DOORS) set(x, y, 'corridor', 'corridor')

  const solid = kind.map(row => row.map(k => k === 'wall'))
  for (const room of ROOMS) {
    for (const placement of room.props) {
      const [pw, ph] = PROP_ART[placement.prop].solid
      for (let dy = 0; dy < ph; dy++) {
        for (let dx = 0; dx < pw; dx++) {
          const x = room.x + placement.tx + dx
          const y = room.y + placement.ty + dy
          if (inBounds(x, y)) solid[y][x] = true
        }
      }
    }
  }

  return { kind, floor, solid, rooms: ROOMS }
}

/** Narmaste lediga ruta mot rummets mitt. Anvands som agentens startplats. */
export function agentHome(map: WorldMap, room: Room): { tx: number; ty: number } {
  const cx = room.x + Math.floor(room.w / 2)
  const cy = room.y + Math.floor(room.h / 2)
  for (let radius = 0; radius <= Math.max(room.w, room.h); radius++) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = cx + dx
        const y = cy + dy
        if (x < room.x || y < room.y || x >= room.x + room.w || y >= room.y + room.h) continue
        if (!map.solid[y][x]) return { tx: x, ty: y }
      }
    }
  }
  return { tx: room.x, ty: room.y }
}

/** Alla rutor man kan ga till fran en startruta. Anvands av testerna. */
export function reachable(map: WorldMap, from = PLAYER_START): Set<string> {
  const seen = new Set<string>([`${from.tx},${from.ty}`])
  const queue: Array<[number, number]> = [[from.tx, from.ty]]
  while (queue.length) {
    const [x, y] = queue.shift() as [number, number]
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx
      const ny = y + dy
      const key = `${nx},${ny}`
      if (!inBounds(nx, ny) || seen.has(key) || map.solid[ny][nx]) continue
      seen.add(key)
      queue.push([nx, ny])
    }
  }
  return seen
}
