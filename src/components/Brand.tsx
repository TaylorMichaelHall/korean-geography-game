/** Obangsaek 2×2 mark — blue · vermilion · gold · ink. The PALDO signet. */
export function Paldo({ size = 28 }: { size?: number }) {
  const cell = Math.round(size * 0.46)
  const gap = Math.max(2, Math.round(size * 0.1))
  const radius = Math.max(1.5, cell * 0.21)
  const sq = (bg: string) => (
    <span style={{ background: bg, borderRadius: radius, display: 'block' }} />
  )
  return (
    <span aria-hidden style={{
      display: 'grid',
      gridTemplateColumns: `repeat(2, ${cell}px)`,
      gridTemplateRows: `repeat(2, ${cell}px)`,
      gap: `${gap}px`,
      flex: '0 0 auto',
    }}>
      {sq('var(--cheong)')}
      {sq('var(--seal)')}
      {sq('var(--hwang)')}
      {sq('var(--text)')}
    </span>
  )
}
