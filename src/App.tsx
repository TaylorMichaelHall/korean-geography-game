import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ContourBg } from './components/ContourBg'
import { Home } from './screens/Home'
import { Setup } from './screens/Setup'
import { Play, type RoundResult } from './screens/Play'
import { Results } from './screens/Results'
import { Atlas } from './screens/Atlas'
import { Credits } from './screens/Credits'
import { PLACES, type Category } from './data'
import {
  load, save, resetAllInPlace, resetCategoryInPlace, type Progress,
} from './lib/progress'
import { setSfxEnabled } from './lib/sound'
import { buildRound, ROUND_LEN, type Question } from './lib/quiz'
import { modeById, type ModeId } from './modes'

type Screen =
  | { name: 'home' }
  | { name: 'setup'; mode: ModeId }
  | { name: 'play'; mode: ModeId; questions: Question[] }
  | { name: 'results'; mode: ModeId; result: RoundResult }
  | { name: 'atlas' }
  | { name: 'credits' }

export function App() {
  const [progress, setProgress] = useState<Progress>(() => load())
  const [screen, setScreen] = useState<Screen>({ name: 'home' })

  useEffect(() => { save(progress) }, [progress])
  useEffect(() => { setSfxEnabled(progress.settings.sound) }, [progress.settings.sound])

  const update = useCallback((fn: (p: Progress) => void) => {
    setProgress((prev) => {
      // shallow copy + fresh item/settings maps; mutators only replace whole
      // entries, so cloning the 102-item map deeply isn't needed
      const next: Progress = {
        ...prev,
        items: { ...prev.items },
        settings: { ...prev.settings },
      }
      fn(next)
      return next
    })
  }, [])

  const startRound = useCallback(
    (mode: ModeId, cats: Category[]) => {
      const pool = cats.length
        ? PLACES.filter((p) => cats.includes(p.category))
        : PLACES
      const questions = buildRound(
        { pool, types: modeById(mode).types, count: ROUND_LEN },
        progress,
        PLACES,
      )
      setScreen({ name: 'play', mode, questions })
    },
    [progress],
  )

  const finishRound = useCallback(
    (mode: ModeId, result: RoundResult) => {
      update((p) => { p.rounds += 1 })
      setScreen({ name: 'results', mode, result })
    },
    [update],
  )

  const go = useMemo(
    () => ({
      home: () => setScreen({ name: 'home' }),
      setup: (mode: ModeId) => setScreen({ name: 'setup', mode }),
      atlas: () => setScreen({ name: 'atlas' }),
      credits: () => setScreen({ name: 'credits' }),
    }),
    [],
  )

  return (
    <div className="app">
      <ContourBg />
      <AnimatePresence mode="wait">
        {screen.name === 'home' && (
          <Home key="home" progress={progress} onMode={go.setup} onAtlas={go.atlas}
            onCredits={go.credits}
            onResetAll={() => update(resetAllInPlace)}
            onResetCategory={(cat) => update((p) => resetCategoryInPlace(p, cat))}
            onToggleSound={() => update((p) => { p.settings.sound = !p.settings.sound })} />
        )}
        {screen.name === 'setup' && (
          <Setup key="setup" mode={screen.mode} progress={progress}
            onBack={go.home} onStart={(cats) => startRound(screen.mode, cats)} />
        )}
        {screen.name === 'play' && (
          <Play key="play" mode={screen.mode} questions={screen.questions}
            onAnswer={update} onQuit={go.home}
            onFinish={(r) => finishRound(screen.mode, r)} />
        )}
        {screen.name === 'results' && (
          <Results key="results" mode={screen.mode} result={screen.result} progress={progress}
            onAgain={() => go.setup(screen.mode)} onHome={go.home} />
        )}
        {screen.name === 'atlas' && (
          <Atlas key="atlas" progress={progress} onBack={go.home} />
        )}
        {screen.name === 'credits' && (
          <Credits key="credits" onBack={go.home} />
        )}
      </AnimatePresence>
    </div>
  )
}
