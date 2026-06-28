import { useState } from 'react'
import { Modal } from './Modal'
import { CATEGORIES, type Category } from '../data'
import { categoryMastery, overallExplored, type Progress } from '../lib/progress'
import { sfx } from '../lib/sound'

export function ResetModal({
  progress, onResetAll, onResetCategory, onClose,
}: {
  progress: Progress
  onResetAll: () => void
  onResetCategory: (cat: Category) => void
  onClose: () => void
}) {
  const [confirmAll, setConfirmAll] = useState(false)
  const [justCleared, setJustCleared] = useState<Category | 'all' | null>(null)
  const explored = overallExplored(progress)

  const clearCat = (cat: Category) => {
    sfx.click()
    onResetCategory(cat)
    setJustCleared(cat)
  }
  const clearAll = () => {
    sfx.wrong()
    onResetAll()
    setConfirmAll(false)
    setJustCleared('all')
  }

  return (
    <Modal className="reset" onClose={onClose}>
        <div className="eyebrow">자료 관리 · Manage progress</div>
        <h3 className="reset-title">Reset progress</h3>
        <p className="dim reset-intro">
          Progress lives only in this browser. Clearing a region group resets its mastery so
          it reads as unexplored — your overall rank and XP are kept. Resetting everything
          wipes rank, XP and all mastery.
        </p>

        <div className="reset-list">
          {CATEGORIES.map((c) => {
            const m = categoryMastery(progress, c.id)
            const empty = m.touched === 0
            return (
              <div key={c.id} className="reset-row">
                <span className="reset-dot" style={{ background: c.accent }} aria-hidden />
                <span className="reset-meta">
                  <span className="reset-ko">{c.korean}</span>
                  <span className="reset-sub dim mono">
                    {empty ? 'untouched' : `${m.touched}/${m.total} explored · ${m.mastered} mastered`}
                  </span>
                </span>
                <button className="reset-btn" disabled={empty} onClick={() => clearCat(c.id)}>
                  {justCleared === c.id ? 'cleared ✓' : 'reset'}
                </button>
              </div>
            )
          })}
        </div>

        <div className="reset-all">
          {!confirmAll ? (
            <button className="reset-all-btn" disabled={explored.touched === 0 && progress.xp === 0}
              onClick={() => { sfx.click(); setConfirmAll(true) }}>
              {justCleared === 'all' ? 'All progress cleared ✓' : 'Reset everything'}
            </button>
          ) : (
            <div className="reset-confirm">
              <span className="reset-warn">Erase rank, XP and all mastery? This can’t be undone.</span>
              <div className="reset-confirm-actions">
                <button className="reset-btn" onClick={() => { sfx.click(); setConfirmAll(false) }}>cancel</button>
                <button className="reset-danger" onClick={clearAll}>Yes, reset all</button>
              </div>
            </div>
          )}
        </div>
    </Modal>
  )
}
