import raw from './geography.json'

export interface Place {
  id: number
  korean: string
  english: string
  hanja: string
  title: string
  koreanTitle: string
  image: string
  notes: string
  reference: string
  category: Category
  subtype: string
  tags: string[]
}

export type Category =
  | 'Provinces & Cities'
  | 'Seoul Capital Area'
  | 'Gyeonggi Districts'
  | 'Islands'
  | 'Mountains, Rivers & Seas'
  | 'Historical Provinces'

export const PLACES: Place[] = raw as Place[]

export const mediaUrl = (file: string) =>
  `${import.meta.env.BASE_URL}media/${encodeURIComponent(file)}`

/** URL of the pre-generated pronunciation clip for a place. */
export const ttsUrl = (id: number) =>
  `${import.meta.env.BASE_URL}media/tts/${id}.mp3`

export interface CategoryMeta {
  id: Category
  korean: string
  glyph: string
  accent: string
  blurb: string
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'Provinces & Cities', korean: '광역 행정구역', glyph: '◆', accent: 'var(--cheong)',
    blurb: 'Provinces & metropolitan cities' },
  { id: 'Seoul Capital Area', korean: '수도권', glyph: '⬡', accent: 'var(--jade)',
    blurb: 'Seoul districts & the capital region' },
  { id: 'Gyeonggi Districts', korean: '경기도 시·군', glyph: '◇', accent: 'var(--hwang)',
    blurb: 'Cities & counties of Gyeonggi' },
  { id: 'Mountains, Rivers & Seas', korean: '산·강·바다', glyph: '⛰', accent: '#2E7E83',
    blurb: 'The peninsula’s natural spine' },
  { id: 'Islands', korean: '섬', glyph: '⬣', accent: '#6E4F8E',
    blurb: 'Island groups & far shores' },
  { id: 'Historical Provinces', korean: '옛 지방', glyph: '❖', accent: '#BE3A2E',
    blurb: 'The eight historical provinces' },
]

/** Static category → places index, built once so callers avoid re-filtering PLACES. */
export const PLACES_BY_CATEGORY: Record<Category, Place[]> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = PLACES.filter((p) => p.category === c.id)
    return acc
  },
  {} as Record<Category, Place[]>,
)
