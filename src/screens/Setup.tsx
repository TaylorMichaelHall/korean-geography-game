import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { screenV, stagger } from './_motion'
import { Ring } from '../components/Ring'
import { CATEGORIES, PLACES, type Category } from '../data'
import { categoryMastery, type Progress } from '../lib/progress'
import { OPTION_COUNT, ROUND_LEN } from '../lib/quiz'
import { modeById, type ModeId } from '../modes'
import { sfx } from '../lib/sound'

const ALL_CATS = CATEGORIES.map((c) => c.id)

export function Setup({
  mode, progress, onBack, onStart,
}: {
  mode: ModeId
  progress: Progress
  onBack: () => void
  onStart: (cats: Category[]) => void
}) {
  const m = modeById(mode)
  const [selected, setSelected] = useState<Set<Category>>(() => new Set(ALL_CATS))

  const toggle = (c: Category) => {
    sfx.click()
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(c)) next.delete(c)
      else next.add(c)
      return next
    })
  }

  const poolSize = useMemo(
    () => PLACES.filter((p) => selected.has(p.category)).length,
    [selected],
  )

  const allOn = selected.size === CATEGORIES.length
  const canStart = poolSize >= OPTION_COUNT

  return (
    <motion.main className="wrap setup" variants={screenV} initial="initial" animate="animate" exit="exit">
      <button className="back" onClick={() => { onBack(); sfx.click() }}>← 돌아가기</button>

      <motion.header className="setup-head" {...stagger(0)}>
        <span className="setup-glyph" style={{ color: m.accent }} aria-hidden>{m.glyph}</span>
        <div>
          <div className="eyebrow">측량 준비 · Plan the survey</div>
          <h2 className="setup-title">{m.korean} <span className="dim">· {m.name}</span></h2>
          <p className="dim">{m.tagline}</p>
        </div>
      </motion.header>

      <motion.div className="setup-bar" {...stagger(1)}>
        <span className="eyebrow">측량 지역 · Survey regions</span>
        <button className="link-btn mono" onClick={() => {
          sfx.click()
          setSelected(allOn ? new Set() : new Set(ALL_CATS))
        }}>
          {allOn ? 'clear all' : 'select all'}
        </button>
      </motion.div>

      <div className="cat-grid">
        {CATEGORIES.map((c, i) => {
          const mm = categoryMastery(progress, c.id)
          const on = selected.has(c.id)
          return (
            <motion.button key={c.id} {...stagger(2 + i)}
              className={`cat-card card ${on ? 'on' : 'off'}`}
              style={{ ['--accent' as any]: c.accent }}
              aria-pressed={on}
              onClick={() => toggle(c.id)}>
              <Ring pct={mm.pct} size={44} stroke={5} color={c.accent}>
                {mm.mastered}
              </Ring>
              <div className="cat-meta">
                <div className="cat-ko">{c.korean}</div>
                <div className="cat-en">{c.id}</div>
                <div className="cat-sub dim mono">{mm.total} entries · {mm.mastered} mastered</div>
              </div>
              <span className="cat-check" aria-hidden>{on ? '✓' : ''}</span>
            </motion.button>
          )
        })}
      </div>

      <motion.div className="setup-foot" {...stagger(9)}>
        <div className="mono dim">{poolSize} regions in pool · {ROUND_LEN} questions</div>
        <button className="btn btn-primary" disabled={!canStart}
          onClick={() => { sfx.click(); onStart([...selected]) }}>
          측량 시작 · Begin survey →
        </button>
        {!canStart && <div className="setup-warn mono">pick at least 4 regions worth of entries</div>}
      </motion.div>
    </motion.main>
  )
}
