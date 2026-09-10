import Phaser from 'phaser'
import { initialAgents } from '../agents'
import type { Agent, AgentState } from '../types'

const STATE_COLORS: Record<AgentState, number> = {
  idle: 0xa8aec5,
  working: 0x68d391,
  blocked: 0xff8a65,
  done: 0xf7c948,
}

type SceneEvents = { onAgentSelected: (agent: Agent) => void }

type AgentSprite = {
  container: Phaser.GameObjects.Container
  body: Phaser.GameObjects.Rectangle
  badge: Phaser.GameObjects.Rectangle
  badgeText: Phaser.GameObjects.Text
  baseY: number
  state: AgentState
}

export class PrisonScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle
  private keys!: Record<string, Phaser.Input.Keyboard.Key>
  private eventHandlers: SceneEvents = { onAgentSelected: () => undefined }
  private agentSprites = new Map<string, AgentSprite>()
  private latestAgents: Agent[] = initialAgents
  private selectedId: string | null = null

  constructor() {
    super('PrisonScene')
  }

  setEventHandlers(handlers: SceneEvents) {
    this.eventHandlers = handlers
  }

  /** Tar emot agentlistan från React. Säker att anropa innan scenen har skapats. */
  syncAgents(agents: Agent[]) {
    this.latestAgents = agents
    agents.forEach(agent => {
      const sprite = this.agentSprites.get(agent.id)
      if (!sprite) return
      sprite.state = agent.state
      sprite.badge.setFillStyle(STATE_COLORS[agent.state])
      sprite.badgeText.setText(agent.state.toUpperCase())
    })
  }

  setSelectedAgent(id: string | null) {
    this.selectedId = id
    this.agentSprites.forEach((sprite, agentId) => {
      sprite.body.setStrokeStyle(3, agentId === id ? 0xffffff : 0x282b3a)
    })
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1d2b')
    this.drawWorld()
    this.player = this.add.rectangle(520, 470, 22, 28, 0xf4d35e).setStrokeStyle(3, 0x282b3a)
    this.add.text(505, 490, 'DU', { fontFamily: 'monospace', fontSize: '9px', color: '#282b3a', fontStyle: 'bold' })

    this.latestAgents.forEach((agent, index) => this.createAgent(agent, 255 + (index % 2) * 225, 155 + Math.floor(index / 2) * 220))
    this.setSelectedAgent(this.selectedId)
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT') as Record<string, Phaser.Input.Keyboard.Key>
  }

  update() {
    const speed = 2.8
    const left = this.keys.A?.isDown || this.keys.LEFT?.isDown
    const right = this.keys.D?.isDown || this.keys.RIGHT?.isDown
    const up = this.keys.W?.isDown || this.keys.UP?.isDown
    const down = this.keys.S?.isDown || this.keys.DOWN?.isDown
    if (left) this.player.x -= speed
    if (right) this.player.x += speed
    if (up) this.player.y -= speed
    if (down) this.player.y += speed
    this.player.x = Phaser.Math.Clamp(this.player.x, 30, 970)
    this.player.y = Phaser.Math.Clamp(this.player.y, 45, 515)

    this.agentSprites.forEach((sprite, id) => {
      const amplitude = sprite.state === 'working' ? 4 : 2
      sprite.container.y = sprite.baseY + Math.sin(this.time.now / 700 + id.length) * amplitude
    })
  }

  private drawWorld() {
    const g = this.add.graphics()
    g.fillStyle(0x383c50).fillRect(18, 28, 984, 510)
    g.lineStyle(5, 0x171a26).strokeRect(18, 28, 984, 510)
    this.room(g, 42, 52, 395, 190, '#d7b98e', 'HUVUDKONTOR', 0xf7c948)
    this.room(g, 468, 52, 500, 190, '#b8d8ba', 'MEDIA', 0xff6b6b)
    this.room(g, 42, 275, 395, 235, '#9ec3d8', 'MARKNAD', 0x61c0bf)
    this.room(g, 468, 275, 500, 235, '#d5b6d5', 'FÖRSÄLJNING', 0xb39ddb)
    g.lineStyle(2, 0x777083, 0.35)
    for (let x = 25; x < 995; x += 32) g.lineBetween(x, 30, x, 536)
    for (let y = 36; y < 536; y += 32) g.lineBetween(20, y, 1000, y)
  }

  private room(g: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number, color: string, label: string, accent: number) {
    g.fillStyle(Phaser.Display.Color.HexStringToColor(color).color).fillRect(x, y, width, height)
    g.fillStyle(0x25283a).fillRect(x, y, width, 28)
    g.fillStyle(accent).fillRect(x + 10, y + 8, 12, 12)
    this.add.text(x + 30, y + 7, label, { fontFamily: 'monospace', fontSize: '12px', color: '#fff', fontStyle: 'bold' })
    g.fillStyle(0x695b52, 0.35).fillRect(x + 30, y + 75, 120, 46)
    g.fillStyle(0x695b52, 0.35).fillRect(x + width - 150, y + 75, 120, 46)
  }

  private createAgent(agent: Agent, x: number, y: number) {
    const body = this.add.rectangle(0, 8, 22, 26, agent.color).setStrokeStyle(3, 0x282b3a)
    const head = this.add.rectangle(0, -12, 18, 17, 0xf5c99b).setStrokeStyle(3, 0x282b3a)
    const name = this.add.text(-30, 28, agent.name, { fontFamily: 'monospace', fontSize: '10px', color: '#171a26', fontStyle: 'bold' })
    const badge = this.add.rectangle(0, -32, 54, 14, STATE_COLORS[agent.state]).setStrokeStyle(2, 0x282b3a)
    const badgeText = this.add
      .text(0, -32, agent.state.toUpperCase(), { fontFamily: 'monospace', fontSize: '8px', color: '#171a26', fontStyle: 'bold' })
      .setOrigin(0.5)
    const container = this.add.container(x, y, [body, head, name, badge, badgeText]).setSize(70, 80).setInteractive()
    container.on('pointerdown', () => this.eventHandlers.onAgentSelected(agent))
    this.agentSprites.set(agent.id, { container, body, badge, badgeText, baseY: y, state: agent.state })
  }
}
