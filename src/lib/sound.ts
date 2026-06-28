// UI blips are synthesized with WebAudio; place-name pronunciation plays the
// pre-generated neural clips in public/media/tts.
import { ttsUrl } from '../data'

let ctx: AudioContext | null = null
function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    if (AC) ctx = new AC()
  }
  if (ctx && ctx.state === 'suspended') ctx.resume()
  return ctx
}

let enabled = true
export function setSfxEnabled(v: boolean) { enabled = v }

function blip(freqs: number[], dur = 0.12, type: OscillatorType = 'sine', vol = 0.18) {
  if (!enabled) return
  const a = ac()
  if (!a) return
  const t0 = a.currentTime
  freqs.forEach((f, i) => {
    const o = a.createOscillator()
    const g = a.createGain()
    o.type = type
    o.frequency.value = f
    const start = t0 + i * dur * 0.7
    g.gain.setValueAtTime(0, start)
    g.gain.linearRampToValueAtTime(vol, start + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
    o.connect(g).connect(a.destination)
    o.start(start)
    o.stop(start + dur + 0.02)
  })
}

export const sfx = {
  click: () => blip([520], 0.05, 'triangle', 0.08),
  correct: () => blip([587.33, 880, 1174.66], 0.16, 'sine', 0.16),
  wrong: () => blip([196, 155.56], 0.22, 'sawtooth', 0.1),
  streak: () => blip([659.25, 987.77, 1318.51], 0.14, 'triangle', 0.14),
  finish: () => blip([523.25, 659.25, 783.99, 1046.5], 0.2, 'sine', 0.16),
}

// Pre-generated neural pronunciation clips live at media/tts/<id>.mp3.
// A single reused <audio> element means each play cancels the previous one,
// and clips are fetched lazily — only when a name is actually played.
let audioEl: HTMLAudioElement | null = null

/** Play the pronunciation clip for a place by id. Safe no-op on failure. */
export function pronounce(id: number) {
  if (typeof window === 'undefined') return
  if (!audioEl) audioEl = new Audio()
  audioEl.src = ttsUrl(id)
  audioEl.currentTime = 0
  audioEl.play().catch(() => {
    /* autoplay blocked or clip missing — ignore */
  })
}
