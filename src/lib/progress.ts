import { PLACES, PLACES_BY_CATEGORY, type Category } from '../data'

export interface ItemStat {
  box: number // 0..5 mastery box (Leitner-lite)
  seen: number
  correct: number
  wrong: number
  lastSeen: number
}

export interface Progress {
  version: 1
  xp: number
  totalAnswered: number
  totalCorrect: number
  bestStreak: number
  rounds: number
  lastPlayed: number
  items: Record<number, ItemStat>
  settings: { sound: boolean }
}

const KEY = 'krgeo.v1'

/** Top Leitner box (full mastery). */
export const MAX_BOX = 5
/** A region counts as "mastered" once its box reaches this. */
export const MASTERED_BOX = 4

export const isMastered = (s: ItemStat) => s.box >= MASTERED_BOX

/** Whole-number accuracy percentage; 0 when nothing has been answered. */
export const accuracyPct = (correct: number, total: number) =>
  total ? Math.round((correct / total) * 100) : 0

const fresh = (): Progress => ({
  version: 1,
  xp: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  bestStreak: 0,
  rounds: 0,
  lastPlayed: 0,
  items: {},
  settings: { sound: true },
})

export function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fresh()
    const p = JSON.parse(raw) as Progress
    if (p.version !== 1) return fresh()
    if (!p.settings) p.settings = { sound: true }
    return p
  } catch {
    return fresh()
  }
}

export function save(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* storage full / unavailable — game still works in-memory */
  }
}

/** Wipe everything except the user's settings (e.g. sound). Mutates in place. */
export function resetAllInPlace(p: Progress) {
  p.xp = 0
  p.totalAnswered = 0
  p.totalCorrect = 0
  p.bestStreak = 0
  p.rounds = 0
  p.lastPlayed = 0
  p.items = {}
}

/** Clear per-region mastery for one category so it reads as unexplored again.
 *  Overall XP/rank are global and intentionally left untouched. */
export function resetCategoryInPlace(p: Progress, cat: Category) {
  for (const place of PLACES) {
    if (place.category === cat) delete p.items[place.id]
  }
}

export function statOf(p: Progress, id: number): ItemStat {
  return p.items[id] ?? { box: 0, seen: 0, correct: 0, wrong: 0, lastSeen: 0 }
}

/** Level curve: each level costs a bit more. */
export function levelFromXp(xp: number) {
  let level = 1
  let need = 100
  let remaining = xp
  while (remaining >= need) {
    remaining -= need
    level++
    need = Math.round(need * 1.18)
  }
  return { level, into: remaining, need, pct: remaining / need }
}

const RANKS = [
  '견습 측량사', '측량사', '지도공', '탐험가', '지리학자', '대지리학자', '산하의 주인',
]
const RANKS_EN = [
  'Apprentice Surveyor', 'Surveyor', 'Cartographer', 'Explorer',
  'Geographer', 'Master Geographer', 'Keeper of the Land',
]
export function rankFor(level: number) {
  const i = Math.min(RANKS.length - 1, Math.floor((level - 1) / 3))
  return { ko: RANKS[i], en: RANKS_EN[i] }
}

export function recordAnswer(p: Progress, id: number, correct: boolean, gained: number) {
  const s = statOf(p, id)
  const next: ItemStat = {
    box: correct ? Math.min(MAX_BOX, s.box + 1) : Math.max(0, s.box - 1),
    seen: s.seen + 1,
    correct: s.correct + (correct ? 1 : 0),
    wrong: s.wrong + (correct ? 0 : 1),
    lastSeen: Date.now(),
  }
  p.items[id] = next
  p.totalAnswered++
  if (correct) p.totalCorrect++
  p.xp += gained
  p.lastPlayed = Date.now()
  return next
}

export interface CategoryMastery {
  mastered: number
  touched: number // seen at least once
  total: number
  pct: number // average box / MAX_BOX
}

export function categoryMastery(p: Progress, cat: Category): CategoryMastery {
  const items = PLACES_BY_CATEGORY[cat]
  let sumBox = 0
  let mastered = 0
  let touched = 0
  for (const it of items) {
    const s = statOf(p, it.id)
    sumBox += s.box
    if (isMastered(s)) mastered++
    if (s.seen > 0) touched++
  }
  return {
    mastered,
    touched,
    total: items.length,
    pct: items.length ? sumBox / (items.length * MAX_BOX) : 0,
  }
}

export function overallExplored(p: Progress) {
  let touched = 0
  for (const x of PLACES) if (statOf(p, x.id).seen > 0) touched++
  return { touched, total: PLACES.length, pct: touched / PLACES.length }
}
