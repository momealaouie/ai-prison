import Phaser from 'phaser'
import { FLOOR_VARIANTS, makeCharacterTextures, makeWorldTextures } from './art'
import { MAP_H, MAP_W, PLAYER_START, agentHome, buildMap } from './map'
import type { Room, WorldMap } from './map'
import { PROP_ART, TILE } from './pixels'
import type { CharacterLook } from './pixels'
import { initialAgents } from '../agents'
import type { Agent, AgentState } from '../types'

const ZOOM = 3.5
const PLAYER_SPEED = 62
const AGENT_SPEED = 30
const FRAME_MS = 150

const STATE_COLORS: Record<AgentState, number> = {
  idle: 0xa8aec5,
  working: 0x68d391,
  blocked: 0xff8a65,
  done: 0xf7c948,
}

/** Utseende per figur. Bor har och inte i agentmodellen, som Codex ager. */
const LOOKS: Record<string, CharacterLook> = {
  player: { skin: 0xf3c9a0, hair: 0x3a2a1d, shirt: 0xf4d35e, pants: 0x2f3a55 },
  director: { skin: 0xf0c39a, hair: 0xc0562f, shirt: 0xffc857, pants: 0x37405e },
  content: { skin: 0xe8b98d, hair: 0x2d2a33, shirt: 0xff6b6b, pants: 0x424a63 },
  marketing: { skin: 0xd9a273, hair: 0x6b4423, shirt: 0x61c0bf, pants: 0x33405c },
  sales: { skin: 0xf5cfa8, hair: 0xe0b33a, shirt: 0xb39ddb, pants: 0x3b3550 },
}

const FALLBACK_LOOK: CharacterLook = { skin: 0xeec19a, hair: 0x4a3728, shirt: 0x8fa9c4, pants: 0x35405c }

type Facing = 'down' | 'up' | 'side'

type Body = {
  id: string
  sprite: Phaser.GameObjects.Image
  shadow: Phaser.GameObjects.Ellipse
  x: number
  y: number
  facing: Facing
  flip: boolean
  frame: number
  frameTimer: number
  moving: boolean
}

type AgentView = Body & {
  room: Room
  label: Phaser.GameObjects.Container
  badge: Phaser.GameObjects.Rectangle
  badgeText: Phaser.GameObjects.Text
  ring: Phaser.GameObjects.Ellipse
  targetX: number
  targetY: number
  waitMs: number
  state: AgentState
}

type SceneEvents = { onAgentSelected: (agent: Agent) => void }

export class PrisonScene extends Phaser.Scene {
  private map!: WorldMap
  private player!: Body
  private agentViews = new Map<string, AgentView>()
  private keys!: Record<string, Phaser.Input.Keyboard.Key>
  private eventHandlers: SceneEvents = { onAgentSelected: () => undefined }
  private latestAgents: Agent[] = initialAgents
  private selectedId: string | null = null

  constructor() {
    super('PrisonScene')
  }

  setEventHandlers(handlers: SceneEvents) {
    this.eventHandlers = handlers
  }

  /** Tar emot agentlistan fran React. Saker att anropa innan scenen har skapats. */
  syncAgents(agents: Agent[]) {
    this.latestAgents = agents
    for (const agent of agents) {
      const view = this.agentViews.get(agent.id)
      if (!view) continue
      view.state = agent.state
      view.badge.setFillStyle(STATE_COLORS[agent.state])
      view.badgeText.setText(agent.state.toUpperCase())
    }
  }

  setSelectedAgent(id: string | null) {
    this.selectedId = id
    this.agentViews.forEach((view, agentId) => view.ring.setVisible(agentId === id))
  }

  create() {
    this.map = buildMap()
    makeWorldTextures(this)
    makeCharacterTextures(this, 'player', LOOKS.player)
    for (const agent of this.latestAgents) {
      makeCharacterTextures(this, agent.id, LOOKS[agent.id] ?? FALLBACK_LOOK)
    }

    this.cameras.main.setBackgroundColor('#4f7a3d')
    this.drawGround()
    this.drawProps()
    this.drawRoomSigns()

    this.player = this.createBody('player', PLAYER_START.tx * TILE + TILE / 2, PLAYER_START.ty * TILE + TILE)
    for (const agent of this.latestAgents) this.createAgentView(agent)
    this.syncAgents(this.latestAgents)
    this.setSelectedAgent(this.selectedId)

    this.cameras.main.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE)
    this.cameras.main.setZoom(ZOOM)
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1)

    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT') as Record<string, Phaser.Input.Keyboard.Key>
  }

  /** Golv, gras och vaggar bakas in i en enda yta sa de bara ritas en gang. */
  private drawGround() {
    const ground = this.add.renderTexture(0, 0, MAP_W * TILE, MAP_H * TILE).setOrigin(0, 0).setDepth(0)
    ground.beginDraw()
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const variant = (x * 7 + y * 13) % FLOOR_VARIANTS
        const key = this.map.kind[y][x] === 'wall' ? 'wall-0' : `${this.map.floor[y][x]}-${variant}`
        ground.batchDraw(key, x * TILE, y * TILE)
      }
    }
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const isWall = this.map.kind[y][x] === 'wall'
        const wallAbove = y > 0 && this.map.kind[y - 1][x] === 'wall'
        if (isWall && !wallAbove) ground.batchDraw('wall-cap', x * TILE, y * TILE)
        if (!isWall && wallAbove) ground.batchDraw('wall-shadow', x * TILE, y * TILE)
      }
    }
    ground.endDraw()
  }

  private drawProps() {
    for (const room of this.map.rooms) {
      for (const placement of room.props) {
        const art = PROP_ART[placement.prop]
        const [pw, ph] = art.solid
        const x = (room.x + placement.tx) * TILE + (pw * TILE) / 2
        const y = (room.y + placement.ty + ph) * TILE
        this.add.ellipse(x, y - 2, art.rows[0].length + 2, 6, 0x000000, 0.2).setDepth(y - 1)
        this.add.image(x, y, `prop-${placement.prop}`).setOrigin(0.5, 1).setDepth(y)
      }
    }
  }

  private drawRoomSigns() {
    for (const room of this.map.rooms) {
      const x = (room.x + room.w / 2) * TILE
      const y = room.y * TILE + 7
      const text = this.add
        .text(x, y, room.name, { fontFamily: 'monospace', fontSize: '7px', color: '#fdf6e3', fontStyle: 'bold', resolution: ZOOM })
        .setOrigin(0.5)
        .setDepth(2)
      this.add
        .rectangle(x, y, text.width + 10, 11, 0x241f1a, 0.9)
        .setStrokeStyle(1, room.accent, 0.9)
        .setDepth(1)
    }
  }

  private createBody(id: string, x: number, y: number): Body {
    const shadow = this.add.ellipse(x, y - 1, 12, 5, 0x000000, 0.26)
    const sprite = this.add.image(x, y, `char-${id}-down-0`).setOrigin(0.5, 1)
    const body: Body = { id, sprite, shadow, x, y, facing: 'down', flip: false, frame: 0, frameTimer: 0, moving: false }
    this.placeBody(body)
    return body
  }

  private createAgentView(agent: Agent) {
    const room = this.map.rooms.find(candidate => candidate.agentId === agent.id) ?? this.map.rooms[0]
    const home = agentHome(this.map, room)
    const x = home.tx * TILE + TILE / 2
    const y = home.ty * TILE + TILE
    const body = this.createBody(agent.id, x, y)

    body.sprite.setInteractive({ useHandCursor: true })
    body.sprite.on('pointerdown', () => this.eventHandlers.onAgentSelected(agent))

    const ring = this.add.ellipse(x, y - 1, 20, 9, 0xf7c948, 0).setStrokeStyle(1, 0xf7c948, 1).setVisible(false)
    const name = this.add
      .text(0, -5, agent.name, { fontFamily: 'monospace', fontSize: '7px', color: '#fdf6e3', fontStyle: 'bold', resolution: ZOOM })
      .setOrigin(0, 0.5)
    const badgeText = this.add
      .text(0, 5, agent.state.toUpperCase(), { fontFamily: 'monospace', fontSize: '6px', color: '#171a26', fontStyle: 'bold', resolution: ZOOM })
      .setOrigin(0.5)
    const width = Math.max(name.width, badgeText.width) + 8
    name.setX(-width / 2 + 4)
    const plate = this.add.rectangle(0, -5, width, 10, 0x241f1a, 0.88).setStrokeStyle(1, 0x000000, 0.5)
    const badge = this.add.rectangle(0, 5, badgeText.width + 8, 9, STATE_COLORS[agent.state]).setStrokeStyle(1, 0x241f1a, 1)
    const label = this.add.container(x, y - 30, [plate, name, badge, badgeText]).setDepth(100000)

    this.agentViews.set(agent.id, {
      ...body, room, label, badge, badgeText, ring,
      targetX: x, targetY: y, waitMs: 400 + Math.random() * 1600, state: agent.state,
    })
  }

  update(_time: number, delta: number) {
    this.updatePlayer(delta)
    this.agentViews.forEach(view => this.updateAgent(view, delta))
  }

  private updatePlayer(delta: number) {
    const left = this.keys.A?.isDown || this.keys.LEFT?.isDown
    const right = this.keys.D?.isDown || this.keys.RIGHT?.isDown
    const up = this.keys.W?.isDown || this.keys.UP?.isDown
    const down = this.keys.S?.isDown || this.keys.DOWN?.isDown
    const dx = (right ? 1 : 0) - (left ? 1 : 0)
    const dy = (down ? 1 : 0) - (up ? 1 : 0)
    this.step(this.player, dx, dy, PLAYER_SPEED, delta)
  }

  /** Agenterna vandrar mellan slumpade rutor i sitt eget rum och tar pauser. */
  private updateAgent(view: AgentView, delta: number) {
    if (view.waitMs > 0) {
      view.waitMs -= delta
      this.step(view, 0, 0, AGENT_SPEED, delta)
    } else {
      const dx = view.targetX - view.x
      const dy = view.targetY - view.y
      if (Math.abs(dx) < 1.5 && Math.abs(dy) < 1.5) {
        this.pickAgentTarget(view)
        view.waitMs = 900 + Math.random() * 3000
      } else {
        this.step(view, Math.sign(Math.abs(dx) < 1.5 ? 0 : dx), Math.sign(Math.abs(dy) < 1.5 ? 0 : dy), AGENT_SPEED, delta)
      }
    }
    view.label.setPosition(Math.round(view.x), Math.round(view.y) - 30)
    view.ring.setPosition(Math.round(view.x), Math.round(view.y) - 1)
    view.ring.setDepth(view.y - 0.6)
  }

  private pickAgentTarget(view: AgentView) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const tx = view.room.x + Math.floor(Math.random() * view.room.w)
      const ty = view.room.y + Math.floor(Math.random() * view.room.h)
      if (this.map.solid[ty][tx]) continue
      view.targetX = tx * TILE + TILE / 2
      view.targetY = ty * TILE + TILE
      return
    }
  }

  private step(body: Body, dx: number, dy: number, speed: number, delta: number) {
    const distance = (speed * delta) / 1000
    const moving = dx !== 0 || dy !== 0
    if (moving) {
      const length = Math.hypot(dx, dy) || 1
      const stepX = (dx / length) * distance
      const stepY = (dy / length) * distance
      if (stepX !== 0 && this.canStand(body.x + stepX, body.y)) body.x += stepX
      if (stepY !== 0 && this.canStand(body.x, body.y + stepY)) body.y += stepY
      if (dx < 0) { body.facing = 'side'; body.flip = true } else if (dx > 0) { body.facing = 'side'; body.flip = false }
      else if (dy < 0) body.facing = 'up'
      else if (dy > 0) body.facing = 'down'
      body.frameTimer += delta
      if (body.frameTimer >= FRAME_MS) {
        body.frameTimer -= FRAME_MS
        body.frame = body.frame === 0 ? 1 : 0
      }
    } else if (body.moving) {
      body.frame = 0
      body.frameTimer = 0
    }
    body.moving = moving
    this.placeBody(body)
  }

  /** Fotterna far inte hamna i en vagg eller i en mobel. */
  private canStand(x: number, y: number) {
    for (const px of [x - 5, x + 5]) {
      for (const py of [y - 6, y - 1]) {
        const tx = Math.floor(px / TILE)
        const ty = Math.floor(py / TILE)
        if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return false
        if (this.map.solid[ty][tx]) return false
      }
    }
    return true
  }

  private placeBody(body: Body) {
    const x = Math.round(body.x)
    const y = Math.round(body.y)
    body.sprite.setTexture(`char-${body.id}-${body.facing}-${body.frame}`)
    body.sprite.setFlipX(body.flip)
    body.sprite.setPosition(x, y)
    body.sprite.setDepth(y)
    body.shadow.setPosition(x, y - 1)
    body.shadow.setDepth(y - 0.5)
  }
}
