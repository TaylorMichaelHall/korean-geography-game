import type { Variants } from 'framer-motion'

export const EASE = [0.2, 0.8, 0.2, 1] as const

export const screenV: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.22 } },
}

export const stagger = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.06 + i * 0.06, duration: 0.45, ease: EASE },
})
