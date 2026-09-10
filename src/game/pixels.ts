/**
 * Ren pixel-art-data. Inga Phaser-beroenden har, sa den gar att testa i node.
 * Varje sprite ar rader av tecken som slas upp i en palett. Punkt ar genomskinligt.
 * All grafik ar egenritad - inga assets fran nagot befintligt spel.
 */

export const TILE = 16

export type Palette = Record<string, number>

/** Deterministisk slump sa varlden ser likadan ut vid varje omstart. */
export function rng(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

export const C = {
  outline: 0x2b2119,
  wood: 0x9c6b43,
  woodDark: 0x6f4a2d,
  woodLight: 0xba8557,
  cloth: 0xf3ece0,
  clothDark: 0xd3cabb,
  red: 0xc0392b,
  redDark: 0x8f2718,
  paper: 0xf2eadb,
  mug: 0xe8703a,
  screen: 0x3c4256,
  screenLit: 0x4fc3f7,
  book1: 0xe05a4a,
  book2: 0xf0b429,
  book3: 0x4d9de0,
  book4: 0x63c07f,
  book5: 0xa77bca,
  sofa: 0x8d5a4a,
  sofaDark: 0x6b4036,
  cushion: 0xb87a5e,
  leaf: 0x5cb85c,
  leafDark: 0x3f8f45,
  pot: 0xc07a4a,
  potDark: 0x8d5533,
  metal: 0x9aa3b5,
  metalDark: 0x6b7385,
}

export type PropArt = {
  rows: string[]
  palette: Palette
  /** Hur manga rutor propen blockerar, bredd x hojd. */
  solid: [number, number]
}

export const PROP_ART: Record<string, PropArt> = {
  bed: {
    solid: [1, 2],
    palette: { o: C.outline, W: C.woodLight, w: C.woodDark, p: C.cloth, P: C.clothDark, r: C.red, R: C.redDark },
    rows: [
      'oooooooooooooo',
      'oWWWWWWWWWWWWo',
      'oWppppppppppWo',
      'oWppppppppppWo',
      'oWPPPPPPPPPPWo',
      'oWrrrrrrrrrrWo',
      'oWrrrrrrrrrrWo',
      'oWrRrrrrrrRrWo',
      'oWrrrrrrrrrrWo',
      'oWrrrrrrrrrrWo',
      'oWrRrrrrrrRrWo',
      'oWrrrrrrrrrrWo',
      'oWrrrrrrrrrrWo',
      'oWrRrrrrrrRrWo',
      'oWrrrrrrrrrrWo',
      'oWrrrrrrrrrrWo',
      'oWrRrrrrrrRrWo',
      'oWrrrrrrrrrrWo',
      'oWrrrrrrrrrrWo',
      'oWrRrrrrrrRrWo',
      'oWrrrrrrrrrrWo',
      'oWrrrrrrrrrrWo',
      'oWRRRRRRRRRRWo',
      'oWwwwwwwwwwwWo',
      'oooooooooooooo',
    ],
  },
  desk: {
    solid: [2, 1],
    palette: { o: C.outline, W: C.wood, w: C.woodDark, m: C.paper, c: C.mug, k: C.screen },
    rows: [
      'oooooooooooooooooooooo',
      'oWWWWWWWWWWWWWWWWWWWWo',
      'oWWWWWWWWWWWWWWWWWWWWo',
      'oWWmmmmWWWWWWWWccWWWWo',
      'oWWmmmmWWWWWWWWccWWWWo',
      'oWWmmmmWWWWWWWWWWWWWWo',
      'oWWWWWWWkkkkkkWWWWWWWo',
      'oWWWWWWWkkkkkkWWWWWWWo',
      'oWWWWWWWWWWWWWWWWWWWWo',
      'owwwwwwwwwwwwwwwwwwwwo',
      'oooooooooooooooooooooo',
      '.ow................wo.',
      '.ow................wo.',
      '.oo................oo.',
    ],
  },
  bookshelf: {
    solid: [2, 1],
    palette: { o: C.outline, w: C.woodDark, '1': C.book1, '2': C.book2, '3': C.book3, '4': C.book4, '5': C.book5 },
    rows: [
      'oooooooooooooooooooooo',
      'owwwwwwwwwwwwwwwwwwwwo',
      'ow112233445511223344wo',
      'ow112233445511223344wo',
      'ow112233445511223344wo',
      'owwwwwwwwwwwwwwwwwwwwo',
      'ow334455112233445511wo',
      'ow334455112233445511wo',
      'ow334455112233445511wo',
      'owwwwwwwwwwwwwwwwwwwwo',
      'ow551122334455112233wo',
      'ow551122334455112233wo',
      'owwwwwwwwwwwwwwwwwwwwo',
      'oooooooooooooooooooooo',
    ],
  },
  sofa: {
    solid: [2, 1],
    palette: { o: C.outline, S: C.sofa, s: C.sofaDark, t: C.cushion },
    rows: [
      'oooooooooooooooooooooooooo',
      'oSSSSSSSSSSSSSSSSSSSSSSSSo',
      'oSssssssssssssssssssssssSo',
      'oSssssssssssssssssssssssSo',
      'oSSSSSSSSSSSSSSSSSSSSSSSSo',
      'oSttttttttttttttttttttttSo',
      'oSttttttttttttttttttttttSo',
      'oSttttttttttttttttttttttSo',
      'oSttttttttttttttttttttttSo',
      'oSSSSSSSSSSSSSSSSSSSSSSSSo',
      'osssssssssssssssssssssssso',
      'oooooooooooooooooooooooooo',
    ],
  },
  plant: {
    solid: [1, 1],
    palette: { o: C.outline, G: C.leaf, g: C.leafDark, T: C.pot, t: C.potDark },
    rows: [
      '.....GG.....',
      '...GGGGGG...',
      '..GGggGGGG..',
      '.GGGGGGggGG.',
      '.GGggGGGGGG.',
      '..GGGGGGGG..',
      '...GGGGGG...',
      '....GGGG....',
      '....oTTo....',
      '...oTTTTo...',
      '...oTTTTo...',
      '...otttto...',
      '...oooooo...',
    ],
  },
  table: {
    solid: [1, 1],
    palette: { o: C.outline, W: C.wood, w: C.woodDark, m: C.paper },
    rows: [
      '..oooooooooo..',
      '.oWWWWWWWWWWo.',
      'oWWWWWWWWWWWWo',
      'oWWWmmmmWWWWWo',
      'oWWWmmmmWWWWWo',
      'oWWWWWWWWWWWWo',
      'owwwwwwwwwwwwo',
      '.owwwwwwwwwwo.',
      '..oooooooooo..',
      '.....owwo.....',
      '.....owwo.....',
      '.....oooo.....',
    ],
  },
  chair: {
    solid: [1, 1],
    palette: { o: C.outline, W: C.cushion, w: C.sofaDark },
    rows: [
      '..oooooo..',
      '.oWWWWWWo.',
      '.oWWWWWWo.',
      '.oWWWWWWo.',
      '.owwwwwwo.',
      '..oooooo..',
      '..oWWWWo..',
      '..oWWWWo..',
      '..owwwwo..',
      '..oooooo..',
      '..oo..oo..',
      '..oo..oo..',
    ],
  },
  terminal: {
    solid: [1, 1],
    palette: { o: C.outline, W: C.metal, w: C.metalDark, k: C.screen, b: C.screenLit },
    rows: [
      'oooooooooooooo',
      'oWWWWWWWWWWWWo',
      'oWkkkkkkkkkkWo',
      'oWkbbbbbbbbkWo',
      'oWkbbkkbbbbkWo',
      'oWkbbbbbbkkkWo',
      'oWkbbbbbbbbkWo',
      'oWkkkkkkkkkkWo',
      'oWwwwwwwwwwwWo',
      'oooooooooooooo',
      '....oWWWWo....',
      '...oWWWWWWo...',
      '..oWWWWWWWWo..',
      '..oooooooooo..',
    ],
  },
}

/**
 * Karaktarer, 14x19. Byggs om per agent med olika har-, hud- och uniformsfarg.
 * o=kontur h=har s=hud e=oga c=troja C=trojskugga p=byxor b=skor S=hudskugga
 */
export const CHARACTER_ART: Record<string, string[]> = {
  'down-0': [
    '...oooooooo...',
    '..ohhhhhhhho..',
    '..ohhhhhhhho..',
    '..ohssssssho..',
    '..ohsessesho..',
    '..ohssssssho..',
    '...osssssso...',
    '....oSSSSo....',
    '.occcccccccco.',
    '.occcccccccco.',
    '.osccccccccso.',
    '.osccccccccso.',
    '.osCCCCCCCCso.',
    '..oppppppppo..',
    '..oppppppppo..',
    '..opppoopppo..',
    '..opppoopppo..',
    '..obbboobbbo..',
    '..oooooooooo..',
  ],
  'down-1': [
    '...oooooooo...',
    '..ohhhhhhhho..',
    '..ohhhhhhhho..',
    '..ohssssssho..',
    '..ohsessesho..',
    '..ohssssssho..',
    '...osssssso...',
    '....oSSSSo....',
    '.occcccccccco.',
    '.occcccccccco.',
    '.osccccccccso.',
    '.osccccccccso.',
    '.osCCCCCCCCso.',
    '..oppppppppo..',
    '..oppppppppo..',
    '..oppppppppo..',
    '..oppppppppo..',
    '..obbbbbbbbo..',
    '..oooooooooo..',
  ],
  'up-0': [
    '...oooooooo...',
    '..ohhhhhhhho..',
    '..ohhhhhhhho..',
    '..ohhhhhhhho..',
    '..ohhhhhhhho..',
    '..ohhhhhhhho..',
    '...ohhhhhho...',
    '....oSSSSo....',
    '.occcccccccco.',
    '.occcccccccco.',
    '.osccccccccso.',
    '.osccccccccso.',
    '.osCCCCCCCCso.',
    '..oppppppppo..',
    '..oppppppppo..',
    '..opppoopppo..',
    '..opppoopppo..',
    '..obbboobbbo..',
    '..oooooooooo..',
  ],
  'up-1': [
    '...oooooooo...',
    '..ohhhhhhhho..',
    '..ohhhhhhhho..',
    '..ohhhhhhhho..',
    '..ohhhhhhhho..',
    '..ohhhhhhhho..',
    '...ohhhhhho...',
    '....oSSSSo....',
    '.occcccccccco.',
    '.occcccccccco.',
    '.osccccccccso.',
    '.osccccccccso.',
    '.osCCCCCCCCso.',
    '..oppppppppo..',
    '..oppppppppo..',
    '..oppppppppo..',
    '..oppppppppo..',
    '..obbbbbbbbo..',
    '..oooooooooo..',
  ],
  'side-0': [
    '...oooooo.....',
    '..ohhhhhho....',
    '..ohhhhhho....',
    '..ohhhssso....',
    '..ohhhseso....',
    '..ohhhssso....',
    '...ohssso.....',
    '....oSSo......',
    '..occcccco....',
    '..occcccco....',
    '..osccccco....',
    '..osccccco....',
    '..osCCCCCo....',
    '..oppppppo....',
    '..oppppppo....',
    '..oppppppo....',
    '..oppppppo....',
    '..obbbbbbo....',
    '..oooooooo....',
  ],
  'side-1': [
    '...oooooo.....',
    '..ohhhhhho....',
    '..ohhhhhho....',
    '..ohhhssso....',
    '..ohhhseso....',
    '..ohhhssso....',
    '...ohssso.....',
    '....oSSo......',
    '..occcccco....',
    '..occcccco....',
    '..osccccco....',
    '..osccccco....',
    '..osCCCCCo....',
    '...oppppppo...',
    '...oppppppo...',
    '...oppppppo...',
    '...oppppppo...',
    '...obbbbbbo...',
    '...oooooooo...',
  ],
}

export type CharacterLook = { skin: number; hair: number; shirt: number; pants: number }

/** Ljusar upp eller morkar en farg. Ren aritmetik sa den kan testas utan Phaser. */
export function shadeHex(color: number, amount: number): number {
  const clamp = (value: number) => Math.max(0, Math.min(255, value))
  const r = clamp(((color >> 16) & 0xff) + amount)
  const g = clamp(((color >> 8) & 0xff) + amount)
  const b = clamp((color & 0xff) + amount)
  return (r << 16) | (g << 8) | b
}

export function characterPalette(look: CharacterLook): Palette {
  return {
    o: C.outline,
    h: look.hair,
    s: look.skin,
    S: shadeHex(look.skin, -28),
    e: C.outline,
    c: look.shirt,
    C: shadeHex(look.shirt, -30),
    p: look.pants,
    b: shadeHex(look.pants, -45),
  }
}
