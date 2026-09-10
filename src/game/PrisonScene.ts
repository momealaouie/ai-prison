import Phaser from 'phaser'
import type { Agent } from '../types'

export const agents: Agent[] = [
  { id: 'director', name: 'Nova', role: 'Direktör', department: 'Huvudkontor', color: 0xffc857, state: 'working', task: 'Delar upp dagens mål' },
  { id: 'content', name: 'Pixel', role: 'Content-agent', department: 'Media', color: 0xff6b6b, state: 'working', task: 'Skriver ett YouTube-manus' },
  { id: 'marketing', name: 'Milo', role: 'Marketing-agent', department: 'Marknad', color: 0x61c0bf, state: 'idle', task: 'Väntar på nästa kampanj' },
  { id: 'sales', name: 'Echo', role: 'Sales-agent', department: 'Försäljning', color: 0xb39ddb, state: 'blocked', task: 'Behöver godkännande från dig' },
]

type SceneEvents = { onAgentSelected: (agent: Agent) => void }

export class PrisonScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle
  private keys!: Record<string, Phaser.Input.Keyboard.Key>
  private eventHandlers: SceneEvents = { onAgentSelected: () => undefined }
  private agentSprites = new Map<string, Phaser.GameObjects.Container>()

  constructor() {
    super('PrisonScene')
  }

  setEventHandlers(handlers: SceneEvents) {
    this.eventHandlers = handlers
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1d2b')
    this.drawWorld()
    this.player = this.add.rectangle(520, 470, 22, 28, 0xf4d35e).setStrokeStyle(3, 0x282b3a)
    this.add.text(505, 490, 'DU', { fontFamily: 'monospace', fontSize: '9px', color: '#282b3a', fontStyle: 'bold' })

    agents.forEach((agent, index) => this.createAgent(agent, 255 + (index % 2) * 225, 155 + Math.floor(index / 2) * 220))
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
      const wobble = Math.sin(this.time.now / 700 + id.length) * 0.25
      sprite.y += wobble
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
    const container = this.add.container(x, y, [body, head, name]).setSize(70, 65).setInteractive()
    container.on('pointerdown', () => this.eventHandlers.onAgentSelected(agent))
    this.agentSprites.set(agent.id, container)
  }
}
