import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { screenV, stagger } from './_motion'
import { Paldo } from '../components/Brand'
import { Ring } from '../components/Ring'
import { ResetModal } from '../components/ResetModal'
import { MODES, type ModeId } from '../modes'
import { CATEGORIES, type Category } from '../data'
import {
  type Progress, levelFromXp, rankFor, overallExplored, categoryMastery, accuracyPct,
} from '../lib/progress'
import { sfx } from '../lib/sound'

export function Home({
  progress, onMode, onAtlas, onCredits, onResetAll, onResetCategory, onToggleSound,
}: {
  progress: Progress
  onMode: (m: ModeId) => void
  onAtlas: () => void
  onCredits: () => void
  onResetAll: () => void
  onResetCategory: (cat: Category) => void
  onToggleSound: () => void
}) {
  const [resetOpen, setResetOpen] = useState(false)
  const lvl = levelFromXp(progress.xp)
  const rank = rankFor(lvl.level)
  const explored = overallExplored(progress)
  const acc = accuracyPct(progress.totalCorrect, progress.totalAnswered)

  return (
    <motion.main className="wrap" variants={screenV} initial="initial" animate="animate" exit="exit">
      <header className="home-top">
        <div className="brandline">
          <Paldo />
          <span className="eyebrow">대한민국 · Field Survey</span>
        </div>
        <div className="home-top-actions">
          <button className="sound-toggle" onClick={() => { onToggleSound(); sfx.click() }}
            aria-pressed={progress.settings.sound}
            title={progress.settings.sound ? 'Sound on' : 'Sound off'}>
            {progress.settings.sound ? '◉ sound' : '○ muted'}
          </button>
          <button className="sound-toggle" onClick={() => { setResetOpen(true); sfx.click() }}
            title="Manage progress">
            ⌥ data
          </button>
        </div>
      </header>

      <section className="hero">
        <motion.h1 className="hero-title" {...stagger(0)}>
          <span className="hero-ko">한반도를</span>
          <span className="hero-ko">측량하라</span>
        </motion.h1>
        <motion.p className="hero-sub" {...stagger(1)}>
          Chart every province, district, peak and shore of Korea — by map, by
          voice, by character. Your survey advances with every answer.
        </motion.p>

        <motion.div className="surveyor card" {...stagger(2)}>
          <Ring pct={lvl.pct} size={62} stroke={6} color="var(--hwang)">
            {lvl.level}
          </Ring>
          <div className="surveyor-id">
            <div className="eyebrow">측량사 등급 · Rank</div>
            <div className="surveyor-rank">{rank.ko}</div>
            <div className="surveyor-rank-en mono">{rank.en} · Lv {lvl.level}</div>
          </div>
          <div className="surveyor-stats">
            <Stat label="EXPLORED" value={`${explored.touched}/${explored.total}`} sub={`${Math.round(explored.pct * 100)}%`} />
            <Stat label="ACCURACY" value={progress.totalAnswered ? `${acc}%` : '—'} sub={`${progress.totalAnswered} ans`} />
            <Stat label="BEST RUN" value={`${progress.bestStreak}×`} sub="streak" />
          </div>
        </motion.div>
      </section>

      <section className="modes">
        {MODES.map((m, i) => (
          <motion.button key={m.id} className="mode-card card" {...stagger(3 + i)}
            onClick={() => { onMode(m.id); sfx.click() }} style={{ ['--accent' as any]: m.accent }}>
            <span className="mode-glyph" aria-hidden>{m.glyph}</span>
            <span className="mode-ko">{m.korean}</span>
            <span className="mode-name">{m.name}</span>
            <span className="mode-tag dim">{m.tagline}</span>
            <span className="mode-go mono">시작 →</span>
          </motion.button>
        ))}
      </section>

      <motion.button className="atlas-strip card" {...stagger(7)}
        onClick={() => { onAtlas(); sfx.click() }}>
        <div>
          <div className="eyebrow">자료실 · Reference</div>
          <div className="atlas-title">Open the Atlas</div>
          <div className="dim">Browse all 102 entries — maps, hanja, audio & notes. No pressure, no clock.</div>
        </div>
        <div className="atlas-cats">
          {CATEGORIES.map((c) => {
            const m = categoryMastery(progress, c.id)
            return (
              <span key={c.id} className="atlas-cat" title={c.id}>
                <Ring pct={m.pct} size={34} stroke={4} color={c.accent}>{m.total}</Ring>
              </span>
            )
          })}
        </div>
      </motion.button>

      <footer className="home-foot dim">
        Maps from Wikimedia Commons · facts adapted from Wikipedia · pronunciation by generated
        {' '}neural voice · names adapted from the <em>Ultimate Korean Geography</em> deck.
        {' '}<button className="foot-link" onClick={() => { onCredits(); sfx.click() }}>Credits &amp; licenses →</button>
        {' · '}
        <a className="foot-link" href="https://github.com/TaylorMichaelHall/korean-geography-game"
          target="_blank" rel="noreferrer">Source on GitHub ↗</a>
      </footer>

      <AnimatePresence>
        {resetOpen && (
          <ResetModal progress={progress} onResetAll={onResetAll}
            onResetCategory={onResetCategory} onClose={() => setResetOpen(false)} />
        )}
      </AnimatePresence>
    </motion.main>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="stat">
      <div className="eyebrow">{label}</div>
      <div className="stat-val mono">{value}</div>
      <div className="stat-sub dim">{sub}</div>
    </div>
  )
}
