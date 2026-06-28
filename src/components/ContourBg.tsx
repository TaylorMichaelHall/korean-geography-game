import { useMemo } from 'react'

/** Procedural topographic contour lines — the ambient signature of the atlas. */
export function ContourBg() {
  const paths = useMemo(() => buildContours(), [])
  return (
    <div className="contour" aria-hidden>
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
        {paths.map((d, i) => (
          <path key={i} d={d} style={{ opacity: 0.35 + (i % 5) * 0.07 }} />
        ))}
      </svg>
    </div>
  )
}

function buildContours(): string[] {
  // deterministic pseudo-random so the terrain is stable across renders
  let seed = 1337
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
  const centers = [
    { x: 300, y: 360 },
    { x: 720, y: 620 },
    { x: 520, y: 180 },
  ]
  const out: string[] = []
  for (const c of centers) {
    const phase = centers.indexOf(c) * 1.7
    const amps = Array.from({ length: 6 }, () => 0.06 + rnd() * 0.16)
    for (let ring = 1; ring <= 11; ring++) {
      const baseR = ring * 46
      const pts: string[] = []
      const steps = 96
      for (let s = 0; s <= steps; s++) {
        const a = (s / steps) * Math.PI * 2
        let r = baseR
        for (let h = 0; h < amps.length; h++) {
          r += Math.sin(a * (h + 2) + phase + h) * amps[h] * baseR
        }
        const x = c.x + Math.cos(a) * r
        const y = c.y + Math.sin(a) * r * 0.82
        pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`)
      }
      out.push('M' + pts.join(' L') + 'Z')
    }
  }
  return out
}
