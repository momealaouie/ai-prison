import { describe, expect, it } from 'vitest'
import { CHARACTER_ART, PROP_ART, characterPalette, shadeHex } from './pixels'

/** Pixel-art skrivs for hand, sa en felraknad rad ar latt att missa. */
function rectangular(rows: string[]) {
  return rows.every(row => row.length === rows[0].length)
}

describe('prop art', () => {
  it.each(Object.keys(PROP_ART))('%s has rows of equal width', key => {
    const { rows } = PROP_ART[key]
    expect(rows.length).toBeGreaterThan(0)
    expect(rectangular(rows), rows.map(r => `${r.length}: ${r}`).join('\n')).toBe(true)
  })

  it.each(Object.keys(PROP_ART))('%s only uses characters in its palette', key => {
    const { rows, palette } = PROP_ART[key]
    const unknown = [...new Set(rows.join('').split(''))].filter(ch => ch !== '.' && palette[ch] === undefined)
    expect(unknown).toEqual([])
  })
})

describe('character art', () => {
  const palette = characterPalette({ skin: 0xf5c99b, hair: 0x8a4b2a, shirt: 0xffc857, pants: 0x33405c })

  it.each(Object.keys(CHARACTER_ART))('%s has rows of equal width', key => {
    const rows = CHARACTER_ART[key]
    expect(rectangular(rows), rows.map(r => `${r.length}: ${r}`).join('\n')).toBe(true)
  })

  it('uses the same frame size everywhere so animation does not jump', () => {
    const sizes = new Set(Object.values(CHARACTER_ART).map(rows => `${rows[0].length}x${rows.length}`))
    expect([...sizes]).toEqual(['14x19'])
  })

  it.each(Object.keys(CHARACTER_ART))('%s only uses characters in the palette', key => {
    const unknown = [...new Set(CHARACTER_ART[key].join('').split(''))].filter(ch => ch !== '.' && palette[ch] === undefined)
    expect(unknown).toEqual([])
  })
})

describe('shadeHex', () => {
  it('darkens and clamps at the ends of the range', () => {
    expect(shadeHex(0x808080, -0x10)).toBe(0x707070)
    expect(shadeHex(0x000000, -20)).toBe(0x000000)
    expect(shadeHex(0xffffff, 20)).toBe(0xffffff)
  })
})
