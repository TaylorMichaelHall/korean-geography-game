/** Compact progress ring used on category & stat cards. */
export function Ring({
  pct, size = 46, stroke = 5, color = 'var(--jade)', track = 'var(--hairline-strong)', children,
}: {
  pct: number; size?: number; stroke?: number; color?: string; track?: string
  children?: React.ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(1, pct))
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: '0 0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
          style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(.2,.8,.2,1)' }}
        />
      </svg>
      {children && (
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          fontFamily: 'var(--mono)', fontSize: size * 0.26, fontWeight: 600,
        }}>{children}</div>
      )}
    </div>
  )
}
