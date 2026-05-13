let ctx: AudioContext | null = null

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

export const playCorrect = (): void => tone(880, 0.15)
export const playWrong   = (): void => tone(220, 0.2, 'sawtooth', 0.2)
export const playStreak  = (): void => {
  tone(660, 0.1)
  setTimeout(() => tone(880, 0.15), 100)
}
export const playTimeout = (): void => tone(110, 0.3, 'square', 0.15)
