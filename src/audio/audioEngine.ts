let ctx: AudioContext | null = null
let audioEnabled = true

export function setAudioEnabled(v: boolean): void { audioEnabled = v }

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.3,
): void {
  try {
    const ac  = getCtx()
    const osc = ac.createOscillator()
    const env = ac.createGain()
    osc.connect(env)
    env.connect(ac.destination)
    osc.frequency.value = freq
    osc.type = type
    env.gain.setValueAtTime(gain, ac.currentTime)
    env.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration)
    osc.start()
    osc.stop(ac.currentTime + duration)
  } catch {
    // AudioContext unavailable (test env / SSR)
  }
}

export const playCorrect = (): void => { if (audioEnabled) tone(880, 0.15) }
export const playWrong   = (): void => { if (audioEnabled) tone(220, 0.2, 'sawtooth', 0.2) }
export const playStreak  = (): void => {
  if (!audioEnabled) return
  tone(660, 0.1)
  setTimeout(() => tone(880, 0.15), 100)
}
export const playTimeout = (): void => { if (audioEnabled) tone(110, 0.3, 'square', 0.15) }

// ── Ambient music (menu only) ─────────────────────────────────────────────
let ambientMaster: GainNode | null = null
let chimeTimer: ReturnType<typeof setTimeout> | null = null

function scheduleChime(ac: AudioContext, dest: GainNode): void {
  const delay = 9000 + Math.random() * 14000
  chimeTimer = setTimeout(() => {
    if (!ambientMaster) return
    const freqs = [523, 659, 784, 1047, 1319]
    const freq  = freqs[Math.floor(Math.random() * freqs.length)]
    const osc   = ac.createOscillator()
    const g     = ac.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    g.gain.setValueAtTime(0.055, ac.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 3.5)
    osc.connect(g); g.connect(dest)
    osc.start(); osc.stop(ac.currentTime + 3.5)
    scheduleChime(ac, dest)
  }, delay)
}

export function startAmbient(): void {
  if (ambientMaster) return
  try {
    const ac = getCtx()
    // iOS suspends AudioContext until user gesture — resume silently
    if (ac.state === 'suspended') { ac.resume().catch(() => {}) }

    ambientMaster = ac.createGain()
    ambientMaster.gain.setValueAtTime(0, ac.currentTime)
    ambientMaster.gain.linearRampToValueAtTime(0.12, ac.currentTime + 3)
    ambientMaster.connect(ac.destination)

    // Bass drone
    const d1 = ac.createOscillator(); d1.type = 'sine'; d1.frequency.value = 82
    const g1 = ac.createGain(); g1.gain.value = 1
    d1.connect(g1); g1.connect(ambientMaster); d1.start()

    // Fifth above — slightly detuned for warmth
    const d2 = ac.createOscillator(); d2.type = 'sine'; d2.frequency.value = 123.5
    const g2 = ac.createGain(); g2.gain.value = 0.55
    d2.connect(g2); g2.connect(ambientMaster); d2.start()

    // Slow LFO on volume for breathing effect
    const lfo = ac.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.08
    const lfoG = ac.createGain(); lfoG.gain.value = 0.04
    lfo.connect(lfoG); lfoG.connect(ambientMaster.gain); lfo.start()

    scheduleChime(ac, ambientMaster)
  } catch { /* AudioContext unavailable */ }
}

export function stopAmbient(): void {
  if (!ambientMaster) return
  if (chimeTimer) { clearTimeout(chimeTimer); chimeTimer = null }
  const dying = ambientMaster
  ambientMaster = null  // clear immediately so startAmbient can restart
  try {
    const ac = getCtx()
    dying.gain.linearRampToValueAtTime(0, ac.currentTime + 1.5)
  } catch { /* ignore */ }
}
