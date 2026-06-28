import { motion } from 'framer-motion'
import { screenV, stagger } from './_motion'
import { sfx } from '../lib/sound'

const DECK_URL = 'https://ankiweb.net/shared/info/345739205'

export function Credits({ onBack }: { onBack: () => void }) {
  return (
    <motion.main className="wrap credits" variants={screenV} initial="initial" animate="animate" exit="exit">
      <button className="back" onClick={() => { sfx.click(); onBack() }}>← 본부로</button>

      <motion.header className="credits-head" {...stagger(0)}>
        <div className="eyebrow">출처 · Sources & licensing</div>
        <h2 className="credits-title">Credits</h2>
        <p className="dim">
          This is a free, non-commercial study aid covering the geography of South Korea.
        </p>
      </motion.header>

      <motion.section className="credit-card card" {...stagger(1)}>
        <h3>Locator maps</h3>
        <p>
          The region maps are from <strong>Wikimedia Commons</strong>. Individual files are
          licensed under <strong>Creative Commons BY-SA</strong> or released into the public
          domain by their authors; reuse here is under those same terms (attribution +
          share-alike). See each file's page on Commons for its specific author and license.
        </p>
        <a className="mono ref-link" href="https://commons.wikimedia.org/" target="_blank" rel="noreferrer">
          commons.wikimedia.org ↗
        </a>
      </motion.section>

      <motion.section className="credit-card card" {...stagger(2)}>
        <h3>Facts & descriptions</h3>
        <p>
          The notes shown on each region are summarised from <strong>English Wikipedia</strong>,
          available under <strong>CC BY-SA 4.0</strong>. Each entry links to its source article.
        </p>
        <a className="mono ref-link" href="https://en.wikipedia.org/wiki/Geography_of_South_Korea" target="_blank" rel="noreferrer">
          en.wikipedia.org ↗
        </a>
      </motion.section>

      <motion.section className="credit-card card" {...stagger(3)}>
        <h3>Pronunciation</h3>
        <p>
          The Korean audio was generated for this project with a neural text-to-speech voice.
        </p>
      </motion.section>

      <motion.section className="credit-card card" {...stagger(4)}>
        <h3>Source dataset</h3>
        <p>
          The set of regions, hanja and groupings is adapted from the community-made
          <em> Ultimate Korean Geography</em> Anki deck. This game is an independent
          reinterpretation and is not affiliated with or endorsed by the deck's author.
        </p>
        <a className="mono ref-link" href={DECK_URL} target="_blank" rel="noreferrer">
          AnkiWeb deck page ↗
        </a>
      </motion.section>
    </motion.main>
  )
}
