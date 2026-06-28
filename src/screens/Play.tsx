import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { mediaUrl, type Place } from '../data'
import {
  recordAnswer, statOf, MASTERED_BOX, type Progress,
} from '../lib/progress'
import { scoreAnswer, type Question } from '../lib/quiz'
import { pronounce, sfx } from '../lib/sound'
import { modeById, type ModeId } from '../modes'
import { Paldo } from '../components/Brand'
import { EASE } from './_motion'

export interface RoundResult {
  score: number
  correct: number
  total: number
  maxStreak: number
  gainedXp: number
  newlyMastered: number
  answers: { place: Place; correct: boolean }[]
}

// Short Korean praise stamped on a correct answer; cycled per question.
// 최고 best · 잘한다 well done · 정답 correct · 멋져 awesome · 합격 pass
const SEAL_PHRASES = ['최고', '잘한다', '정답', '멋져', '합격']

export function Play({
  mode, questions, onAnswer, onFinish, onQuit,
}: {
  mode: ModeId
  questions: Question[]
  onAnswer: (fn: (p: Progress) => void) => void
  onFinish: (r: RoundResult) => void
  onQuit: () => void
}) {
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [streak, setStreak] = useState(0)
  const [score, setScore] = useState(0)
  const [lastGain, setLastGain] = useState<number | null>(null)
  const [revealOffscreen, setRevealOffscreen] = useState(false)

  const q = questions[index]
  const isLast = index === questions.length - 1
  const startRef = useRef(0)
  const revealRef = useRef<HTMLDivElement>(null)
  const acc = useRef<RoundResult>({
    score: 0, correct: 0, total: questions.length, maxStreak: 0,
    gainedXp: 0, newlyMastered: 0, answers: [],
  })

  useEffect(() => {
    startRef.current = performance.now()
    setLastGain(null)
    // Pronunciation clips always play — the mute toggle only silences UI
    // sounds, otherwise the Pronounce mode would be unplayable.
    if (q.type === 'pronounce') {
      const t = setTimeout(() => pronounce(q.target.id), 320)
      return () => clearTimeout(t)
    }
  }, [index, q])

  const answer = useCallback((optId: number) => {
    if (chosen !== null) return
    const correct = optId === q.target.id
    const ms = performance.now() - startRef.current
    const newStreak = correct ? streak + 1 : 0
    const gained = correct ? scoreAnswer(newStreak, ms) : 0

    setChosen(optId)
    setStreak(newStreak)
    setScore((s) => s + gained)
    setLastGain(correct ? gained : null)

    onAnswer((p) => {
      const before = statOf(p, q.target.id).box
      recordAnswer(p, q.target.id, correct, gained)
      const after = p.items[q.target.id].box
      if (after >= MASTERED_BOX && before < MASTERED_BOX) acc.current.newlyMastered++
      if (newStreak > p.bestStreak) p.bestStreak = newStreak
    })

    acc.current.correct += correct ? 1 : 0
    acc.current.maxStreak = Math.max(acc.current.maxStreak, newStreak)
    acc.current.answers.push({ place: q.target, correct })

    if (correct) {
      sfx.correct()
      if (newStreak >= 3) setTimeout(() => sfx.streak(), 150)
    } else {
      sfx.wrong()
    }
  }, [chosen, q, streak, onAnswer])

  // Show a "jump to card" button when the reveal scrolls below the fold.
  useEffect(() => {
    const el = revealRef.current
    if (chosen === null || !el) {
      setRevealOffscreen(false)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => setRevealOffscreen(!e.isIntersecting),
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [chosen, index])

  const scrollToReveal = useCallback(() => {
    revealRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const next = useCallback(() => {
    sfx.click()
    if (isLast) {
      sfx.finish()
      onFinish({ ...acc.current, score, gainedXp: score })
    } else {
      setChosen(null)
      setIndex((i) => i + 1)
    }
  }, [isLast, onFinish, score])

  // keyboard: 1-4 to answer, Enter/Space to advance
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (chosen === null) {
        const n = parseInt(e.key, 10)
        if (n >= 1 && n <= q.options.length) answer(q.options[n - 1].id)
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [chosen, q, answer, next])

  const m = modeById(mode)
  const correct = chosen !== null && chosen === q.target.id
  const mapOptions = q.type === 'name2map'
  const sealText = SEAL_PHRASES[index % SEAL_PHRASES.length]
  const sealFont = Math.min(30, Math.floor(64 / sealText.length))

  return (
    <motion.main className="wrap play"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* HUD */}
      <div className="hud">
        <span className="hud-brand">
          <Paldo size={16} />
          <button className="back" onClick={() => { sfx.click(); onQuit() }}>← 그만</button>
        </span>
        <div className="hud-dots">
          {questions.map((_, i) => (
            <span key={i} className={
              'dot' + (i < index ? ' done' : '') + (i === index ? ' now' : '') +
              (i < index && acc.current.answers[i]?.correct === false ? ' miss' : '')
            } />
          ))}
        </div>
        <div className="hud-right">
          <span className={'streak' + (streak >= 3 ? ' hot' : '')}>
            <span className="streak-flame" aria-hidden>{streak >= 3 ? '🔥' : '⟡'}</span>
            <span className="mono">{streak}</span>
          </span>
          <span className="score mono">{score.toLocaleString()}</span>
        </div>
      </div>

      <div className="prompt-label eyebrow">{promptLabel(q.type)}</div>

      {/* PROMPT */}
      <div className="prompt-area">
        <AnimatePresence mode="wait">
          <motion.div key={index} className="prompt"
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.3 }}>
            {q.type === 'locate' && (
              <div className="map-card paper">
                <img src={mediaUrl(q.target.image)} alt="Highlighted region of Korea" />
              </div>
            )}
            {q.type === 'name2map' && (
              <div className="name-prompt">
                <div className="name-prompt-ko">{q.target.korean}</div>
                <div className="name-prompt-en dim">{q.target.english}</div>
                <div className="name-prompt-hint mono dim">↓ pick its territory</div>
              </div>
            )}
            {q.type === 'pronounce' && (
              <button className="audio-orb" onClick={() => pronounce(q.target.id)}>
                <span className="audio-wave"><i /><i /><i /><i /><i /></span>
                <span className="audio-replay mono">다시 듣기 ↺</span>
              </button>
            )}
            {q.type === 'script' && (
              <div className="hanja-plaque">
                <span className="hanja-big">{q.target.hanja}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* dojang seal stamp on correct */}
        <AnimatePresence>
          {chosen !== null && correct && (
            <motion.div className="seal-stamp" key="seal"
              initial={{ opacity: 0, scale: 1.8, rotate: -22 }}
              animate={{ opacity: 1, scale: 1, rotate: -8 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 16 }}>
              <span className="seal-mark" style={{ fontSize: sealFont }}>
                {[...sealText].map((ch, i) => <i key={i}>{ch}</i>)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* OPTIONS */}
      <div className={'options' + (mapOptions ? ' options-map' : '')}>
        {q.options.map((opt, i) => {
          const isTarget = opt.id === q.target.id
          const isChosen = opt.id === chosen
          const state =
            chosen === null ? 'idle'
              : isTarget ? 'right'
                : isChosen ? 'wrong'
                  : 'dim'
          return (
            <button key={opt.id} className={`opt opt-${state}` + (mapOptions ? ' opt-map' : '')}
              disabled={chosen !== null} onClick={() => answer(opt.id)}>
              {!mapOptions && <span className="opt-key mono">{i + 1}</span>}
              {mapOptions ? (
                <span className="opt-map-img paper">
                  <img src={mediaUrl(opt.image)} alt="" />
                </span>
              ) : (
                <span className="opt-text">
                  <span className="opt-ko">{opt.korean}</span>
                  <span className="opt-en dim">{opt.english}</span>
                </span>
              )}
              {chosen !== null && isTarget && <span className="opt-badge" aria-hidden>✓</span>}
              {chosen !== null && isChosen && !isTarget && <span className="opt-badge" aria-hidden>×</span>}
            </button>
          )
        })}
      </div>

      {/* REVEAL */}
      <AnimatePresence>
        {chosen !== null && (
          <motion.div className="reveal card" ref={revealRef}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.32, ease: EASE }}>
            <div className="reveal-head">
              <div className={'verdict ' + (correct ? 'ok' : 'no')}>
                {correct ? '정답 · Correct' : '오답 · ' + q.target.english}
                {correct && lastGain !== null && <span className="gain mono">+{lastGain}</span>}
              </div>
            </div>
            <div className="reveal-id">
              <span className="reveal-ko">{q.target.korean}</span>
              {q.target.hanja && <span className="reveal-hanja">{q.target.hanja}</span>}
              <button className="play-pill mono" onClick={() => pronounce(q.target.id)}>
                ▶ 발음
              </button>
            </div>
            {q.target.notes && <p className="reveal-notes">{q.target.notes}</p>}
            <div className="reveal-foot">
              {q.target.reference && (
                <a className="mono ref-link" href={q.target.reference} target="_blank" rel="noreferrer">
                  위키백과 ↗
                </a>
              )}
              <button className="btn btn-primary next-btn" onClick={next} style={{ ['--accent' as any]: m.accent }}>
                {isLast ? '결과 보기 · Finish' : '다음 · Next'} →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* floating nudge to the reveal card when it's below the fold */}
      <AnimatePresence>
        {chosen !== null && revealOffscreen && (
          <motion.button className="jump-card" onClick={scrollToReveal}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }} transition={{ duration: 0.22, ease: EASE }}>
            정답 보기 · See result ↓
          </motion.button>
        )}
      </AnimatePresence>
    </motion.main>
  )
}

function promptLabel(t: Question['type']) {
  switch (t) {
    case 'locate': return '이 지역은? · Which region is highlighted?'
    case 'name2map': return '지도에서 찾기 · Find it on the map'
    case 'pronounce': return '들어보세요 · Listen & identify'
    case 'script': return '이 한자는? · Read the hanja'
  }
}
