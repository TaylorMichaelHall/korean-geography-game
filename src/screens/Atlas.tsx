import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { screenV } from './_motion'
import { Modal } from '../components/Modal'
import { CATEGORIES, PLACES, mediaUrl, type Category, type Place } from '../data'
import { statOf, type Progress, MAX_BOX } from '../lib/progress'
import { pronounce, sfx } from '../lib/sound'

export function Atlas({ progress, onBack }: { progress: Progress; onBack: () => void }) {
  const [cat, setCat] = useState<Category | 'all'>('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<Place | null>(null)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PLACES.filter((p) => cat === 'all' || p.category === cat).filter((p) => {
      if (!q) return true
      return (
        p.english.toLowerCase().includes(q) ||
        p.korean.includes(q) ||
        p.hanja.includes(q) ||
        p.title.toLowerCase().includes(q)
      )
    })
  }, [cat, query])

  return (
    <motion.main className="wrap atlas" variants={screenV} initial="initial" animate="animate" exit="exit">
      <div className="atlas-head">
        <button className="back" onClick={() => { sfx.click(); onBack() }}>← 본부로</button>
        <h2 className="atlas-h2">자료실 · The Atlas</h2>
        <input className="atlas-search" placeholder="search 검색…" value={query}
          onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="atlas-tabs">
        <button className={'tab' + (cat === 'all' ? ' on' : '')} onClick={() => { sfx.click(); setCat('all') }}>
          전체 · All <span className="mono">{PLACES.length}</span>
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} className={'tab' + (cat === c.id ? ' on' : '')}
            style={{ ['--accent' as any]: c.accent }}
            onClick={() => { sfx.click(); setCat(c.id) }}>
            {c.korean}
          </button>
        ))}
      </div>

      <div className="atlas-grid">
        {list.map((p) => {
          const s = statOf(progress, p.id)
          return (
            <button key={p.id} className="atlas-cell card" onClick={() => { sfx.click(); setOpen(p) }}>
              <span className="atlas-cell-map paper"><img src={mediaUrl(p.image)} alt="" loading="lazy" /></span>
              <span className="atlas-cell-ko">{p.korean}</span>
              <span className="atlas-cell-en dim">{p.english}</span>
              <span className="atlas-cell-pips" aria-label={`mastery ${s.box} of ${MAX_BOX}`}>
                {Array.from({ length: MAX_BOX }, (_, i) => (
                  <i key={i} className={i < s.box ? 'on' : ''} />
                ))}
              </span>
            </button>
          )
        })}
        {list.length === 0 && <div className="atlas-empty dim">No regions match “{query}”.</div>}
      </div>

      <AnimatePresence>
        {open && <Detail place={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </motion.main>
  )
}

function Detail({ place, onClose }: { place: Place; onClose: () => void }) {
  return (
    <Modal className="detail" onClose={onClose}>
        <div className="detail-map paper"><img src={mediaUrl(place.image)} alt={`Map of ${place.english}`} /></div>
        <div className="detail-body">
          <div className="eyebrow">{place.category}</div>
          <div className="detail-id">
            <span className="detail-ko">{place.korean}</span>
          </div>
          <div className="detail-meta">
            <span className="detail-en">{place.english}</span>
            {place.hanja && <span className="detail-hanja">{place.hanja}</span>}
            <button className="play-pill mono" onClick={() => pronounce(place.id)}>▶ 발음</button>
          </div>
          {place.notes && <p className="detail-notes">{place.notes}</p>}
          {place.reference && (
            <a className="mono ref-link" href={place.reference} target="_blank" rel="noreferrer">위키백과 ↗</a>
          )}
        </div>
    </Modal>
  )
}
