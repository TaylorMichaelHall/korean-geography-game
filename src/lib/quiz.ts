import { type Place } from '../data'
import { MAX_BOX, statOf, type Progress } from './progress'

/** Questions per round. */
export const ROUND_LEN = 10
/** Answer choices shown per question (1 target + distractors). */
export const OPTION_COUNT = 4
const DISTRACTORS = OPTION_COUNT - 1

export type QType = 'locate' | 'pronounce' | 'script' | 'name2map'

export interface Question {
  type: QType
  target: Place
  options: Place[] // includes target, shuffled
}

export interface RoundConfig {
  pool: Place[]
  types: QType[]
  count: number
}

function mulberry(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Weighted pick of `n` distinct targets, favouring low mastery + long-unseen. */
function pickTargets(pool: Place[], n: number, p: Progress, rnd: () => number): Place[] {
  const now = Date.now()
  const weighted = pool.map((place) => {
    const s = statOf(p, place.id)
    const masteryGap = MAX_BOX - s.box // 0..MAX_BOX
    const idleHrs = s.lastSeen ? (now - s.lastSeen) / 3.6e6 : 72
    const dueness = Math.min(3, idleHrs / 24)
    const freshBonus = s.seen === 0 ? 2.5 : 0
    const weight = 1 + masteryGap * 1.4 + dueness + freshBonus
    return { place, weight }
  })

  const chosen: Place[] = []
  const used = new Set<number>()
  const take = Math.min(n, pool.length)
  while (chosen.length < take) {
    const avail = weighted.filter((w) => !used.has(w.place.id))
    const total = avail.reduce((s, w) => s + w.weight, 0)
    let r = rnd() * total
    let picked = avail[avail.length - 1]
    for (const w of avail) {
      r -= w.weight
      if (r <= 0) {
        picked = w
        break
      }
    }
    used.add(picked.place.id)
    chosen.push(picked.place)
  }
  return chosen
}

/** 3 distractors close to the target: same subtype first, then category. */
function distractorsFor(target: Place, pool: Place[], all: Place[], rnd: () => number): Place[] {
  const label = (x: Place) => x.korean + x.english
  const exclude = new Set([label(target)])
  const tiers = [
    pool.filter((x) => x.id !== target.id && x.subtype === target.subtype),
    pool.filter((x) => x.id !== target.id && x.category === target.category),
    all.filter((x) => x.id !== target.id),
  ]
  const out: Place[] = []
  for (const tier of tiers) {
    for (const c of shuffle(tier, rnd)) {
      if (out.length >= DISTRACTORS) break
      if (exclude.has(label(c))) continue
      exclude.add(label(c))
      out.push(c)
    }
    if (out.length >= DISTRACTORS) break
  }
  return out.slice(0, DISTRACTORS)
}

export function buildRound(
  cfg: RoundConfig,
  p: Progress,
  all: Place[],
  seed = Math.floor(Math.random() * 1e9),
): Question[] {
  const rnd = mulberry(seed)
  const targets = pickTargets(cfg.pool, cfg.count, p, rnd)
  return targets.map((target) => {
    // pick a question type this target supports
    const supported = cfg.types.filter((t) => {
      if (t === 'script') return !!target.hanja
      return true // 'locate', 'name2map' and 'pronounce' work for every entry
    })
    const type = supported.length
      ? supported[Math.floor(rnd() * supported.length)]
      : 'locate'
    const options = shuffle(
      [target, ...distractorsFor(target, cfg.pool, all, rnd)],
      rnd,
    )
    return { type, target, options }
  })
}

/** Points for a correct answer given the current streak and answer time (ms). */
export function scoreAnswer(streak: number, ms: number): number {
  const base = 100
  const streakBonus = Math.min(150, (streak - 1) * 15)
  const speedBonus = ms < 6000 ? Math.round((1 - ms / 6000) * 60) : 0
  return base + streakBonus + speedBonus
}
