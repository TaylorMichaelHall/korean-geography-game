import { type QType } from './lib/quiz'

export type ModeId = 'survey' | 'locate' | 'pronounce' | 'script'

export interface GameMode {
  id: ModeId
  name: string
  korean: string
  glyph: string
  tagline: string
  types: QType[]
  accent: string
}

export const MODES: GameMode[] = [
  {
    id: 'survey', name: 'Field Survey', korean: '종합 측량', glyph: '⊕',
    tagline: 'Mixed expedition — maps, voices & script together',
    types: ['locate', 'pronounce', 'script', 'name2map'], accent: 'var(--hwang)',
  },
  {
    id: 'locate', name: 'Locate', korean: '위치 찾기', glyph: '◎',
    tagline: 'A region glows on the map. Name it.',
    types: ['locate'], accent: 'var(--jade)',
  },
  {
    id: 'pronounce', name: 'Pronounce', korean: '발음 듣기', glyph: '♪',
    tagline: 'Hear it spoken. Match the place.',
    types: ['pronounce'], accent: 'var(--cheong-bright)',
  },
  {
    id: 'script', name: 'Hanja', korean: '한자', glyph: '漢',
    tagline: 'Read the Chinese characters. Find the name.',
    types: ['script'], accent: 'var(--seal-bright)',
  },
]

export const modeById = (id: ModeId) => MODES.find((m) => m.id === id)!
