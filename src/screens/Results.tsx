import { motion } from 'framer-motion'
import { screenV, stagger } from './_motion'
import { mediaUrl } from '../data'
import { levelFromXp, rankFor, accuracyPct, type Progress } from '../lib/progress'
import { modeById, type ModeId } from '../modes'
import type { RoundResult } from './Play'
import { sfx } from '../lib/sound'

export function Results({
  mode, result, progress, onAgain, onHome,
}: {
  mode: ModeId
  result: RoundResult
  progress: Progress
  onAgain: () => void
  onHome: () => void
}) {
  const m = modeById(mode)
  const acc = accuracyPct(result.correct, result.total)
  const lvl = levelFromXp(progress.xp)
  const rank = rankFor(lvl.level)
  const grade = acc === 100 ? 'S' : acc >= 90 ? 'A' : acc >= 70 ? 'B' : acc >= 50 ? 'C' : 'D'

  return (
    <motion.main className="wrap results" variants={screenV} initial="initial" animate="animate" exit="exit">
      <motion.div className="results-grade" {...stagger(0)}>
        <span className={'grade grade-' + grade}>{grade}</span>
        <div>
          <div className="eyebrow">{m.korean} · 측량 완료</div>
          <h2 className="results-title">Survey complete</h2>
          <div className="dim mono">{rank.ko} · Lv {lvl.level}</div>
        </div>
      </motion.div>

      <motion.div className="results-stats" {...stagger(1)}>
        <Big label="SCORE" value={result.score.toLocaleString()} accent="var(--hwang)" />
        <Big label="ACCURACY" value={`${acc}%`} sub={`${result.correct}/${result.total}`} accent="var(--jade)" />
        <Big label="BEST STREAK" value={`${result.maxStreak}×`} accent="var(--seal-bright)" />
        <Big label="XP GAINED" value={`+${result.gainedXp}`} accent="var(--cheong-bright)" />
      </motion.div>

      {result.newlyMastered > 0 && (
        <motion.div className="mastered-note" {...stagger(2)}>
          ★ {result.newlyMastered} new {result.newlyMastered === 1 ? 'region' : 'regions'} mastered
        </motion.div>
      )}

      <motion.div className="recap" {...stagger(3)}>
        {result.answers.map((a, i) => (
          <div key={i} className={'recap-row ' + (a.correct ? 'ok' : 'no')}>
            <span className="recap-map paper"><img src={mediaUrl(a.place.image)} alt="" /></span>
            <span className="recap-ko">{a.place.korean}</span>
            <span className="recap-en dim">{a.place.english}</span>
            <span className="recap-mark">{a.correct ? '✓' : '×'}</span>
          </div>
        ))}
      </motion.div>

      <motion.div className="results-actions" {...stagger(4)}>
        <button className="btn btn-ghost" onClick={() => { sfx.click(); onHome() }}>← 본부로</button>
        <button className="btn btn-primary" onClick={() => { sfx.click(); onAgain() }}>
          다시 측량 · Survey again →
        </button>
      </motion.div>
    </motion.main>
  )
}

function Big({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  return (
    <div className="big-stat card" style={{ ['--accent' as any]: accent }}>
      <div className="eyebrow">{label}</div>
      <div className="big-val">{value}</div>
      {sub && <div className="big-sub mono dim">{sub}</div>}
    </div>
  )
}
