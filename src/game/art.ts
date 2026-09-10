import Phaser from 'phaser'
import { CHARACTER_ART, PROP_ART, TILE, characterPalette, rng, shadeHex } from './pixels'
import type { CharacterLook, Palette } from './pixels'

function newGraphics(scene: Phaser.Scene) {
  return scene.make.graphics({ x: 0, y: 0 })
}

function drawRows(g: Phaser.GameObjects.Graphics, rows: string[], palette: Palette) {
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = palette[row[x]]
      if (color === undefined) continue
      g.fillStyle(color, 1)
      g.fillRect(x, y, 1, 1)
    }
  })
}

function textureFromRows(scene: Phaser.Scene, key: string, rows: string[], palette: Palette) {
  if (scene.textures.exists(key)) scene.textures.remove(key)
  const g = newGraphics(scene)
  drawRows(g, rows, palette)
  g.generateTexture(key, rows[0].length, rows.length)
  g.destroy()
}

/** Kaklat golv med fasad kant och fog uppe och till vanster, sa rutorna radar upp sig. */
function floorTexture(scene: Phaser.Scene, key: string, base: number, grout: number, seed: number) {
  const g = newGraphics(scene)
  const random = rng(seed)
  g.fillStyle(base, 1).fillRect(0, 0, TILE, TILE)
  for (let i = 0; i < 26; i++) {
    g.fillStyle(shadeHex(base, random() > 0.5 ? 9 : -11), 1)
    g.fillRect(Math.floor(random() * TILE), Math.floor(random() * TILE), 1, 1)
  }
  for (let i = 0; i < 2; i++) {
    g.fillStyle(shadeHex(base, -16), 0.5)
    g.fillRect(2 + Math.floor(random() * 11), 2 + Math.floor(random() * 11), 2, 2)
  }
  g.fillStyle(shadeHex(base, 20), 1).fillRect(1, 1, TILE - 2, 1)
  g.fillStyle(shadeHex(base, 20), 1).fillRect(1, 1, 1, TILE - 2)
  g.fillStyle(shadeHex(base, -26), 1).fillRect(1, TILE - 1, TILE - 1, 1)
  g.fillStyle(shadeHex(base, -26), 1).fillRect(TILE - 1, 1, 1, TILE - 1)
  g.fillStyle(grout, 1).fillRect(0, 0, TILE, 1)
  g.fillStyle(grout, 1).fillRect(0, 0, 1, TILE)
  g.generateTexture(key, TILE, TILE)
  g.destroy()
}

function grassTexture(scene: Phaser.Scene, key: string, seed: number) {
  const g = newGraphics(scene)
  const random = rng(seed)
  const base = 0x6aa84f
  g.fillStyle(base, 1).fillRect(0, 0, TILE, TILE)
  for (let i = 0; i < 42; i++) {
    g.fillStyle(shadeHex(base, random() > 0.5 ? 14 : -16), 1)
    g.fillRect(Math.floor(random() * TILE), Math.floor(random() * TILE), 1, 1)
  }
  for (let i = 0; i < 3; i++) {
    const x = 2 + Math.floor(random() * (TILE - 4))
    const y = 2 + Math.floor(random() * (TILE - 4))
    g.fillStyle(shadeHex(base, -26), 1)
    g.fillRect(x, y, 1, 2)
    g.fillRect(x + 2, y - 1, 1, 3)
  }
  g.generateTexture(key, TILE, TILE)
  g.destroy()
}

/** Tegelvagg med forskjutna skift, sett uppifran. */
function brickTexture(scene: Phaser.Scene, key: string, brick: number, mortar: number) {
  const g = newGraphics(scene)
  g.fillStyle(mortar, 1).fillRect(0, 0, TILE, TILE)
  const rowHeight = 5
  for (let row = 0; row * rowHeight < TILE; row++) {
    const offset = row % 2 === 0 ? 0 : -4
    for (let x = offset; x < TILE; x += 8) {
      g.fillStyle(brick, 1).fillRect(x, row * rowHeight, 7, rowHeight - 1)
      g.fillStyle(shadeHex(brick, -22), 1).fillRect(x, row * rowHeight + rowHeight - 2, 7, 1)
      g.fillStyle(shadeHex(brick, 16), 1).fillRect(x, row * rowHeight, 7, 1)
    }
  }
  g.generateTexture(key, TILE, TILE)
  g.destroy()
}

/** Ljus ovansida pa de vaggar som inte har nagon vagg ovanfor sig. */
function wallCapTexture(scene: Phaser.Scene, key: string) {
  const g = newGraphics(scene)
  const base = 0xb6a897
  g.fillStyle(shadeHex(base, -30), 1).fillRect(0, 0, TILE, 7)
  g.fillStyle(base, 1).fillRect(0, 0, TILE, 5)
  g.fillStyle(shadeHex(base, 20), 1).fillRect(0, 0, TILE, 1)
  g.generateTexture(key, TILE, 7)
  g.destroy()
}

/** Mjuk skugga som vaggarna kastar ner pa golvet. */
function wallShadowTexture(scene: Phaser.Scene, key: string) {
  const g = newGraphics(scene)
  for (let y = 0; y < 5; y++) {
    g.fillStyle(0x000000, 0.26 - y * 0.05)
    g.fillRect(0, y, TILE, 1)
  }
  g.generateTexture(key, TILE, 5)
  g.destroy()
}

const FLOORS: Record<string, [number, number]> = {
  'floor-warm': [0xcbb083, 0x947c56],
  'floor-mint': [0xb3cca2, 0x7e9670],
  'floor-blue': [0xa4c0d6, 0x7190a8],
  'floor-lilac': [0xc6abd0, 0x907699],
  corridor: [0xc0b49c, 0x8b7f68],
}

export const FLOOR_VARIANTS = 3

export function makeWorldTextures(scene: Phaser.Scene) {
  let seed = 1
  for (const [key, [base, grout]] of Object.entries(FLOORS)) {
    for (let v = 0; v < FLOOR_VARIANTS; v++) floorTexture(scene, `${key}-${v}`, base, grout, (seed += 7919))
  }
  for (let v = 0; v < FLOOR_VARIANTS; v++) grassTexture(scene, `grass-${v}`, (seed += 7919))
  brickTexture(scene, 'wall-0', 0xa15334, 0xcbb79f)
  wallCapTexture(scene, 'wall-cap')
  wallShadowTexture(scene, 'wall-shadow')
  for (const [name, art] of Object.entries(PROP_ART)) textureFromRows(scene, `prop-${name}`, art.rows, art.palette)
}

/** Sex bildrutor per figur: fram, bak och sida i tva gangsteg. */
export function makeCharacterTextures(scene: Phaser.Scene, id: string, look: CharacterLook) {
  const palette = characterPalette(look)
  for (const [frame, rows] of Object.entries(CHARACTER_ART)) {
    textureFromRows(scene, `char-${id}-${frame}`, rows, palette)
  }
}
