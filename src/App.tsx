import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from './store/gameStore'
import { HomeScreen }    from './screens/HomeScreen'
import { GameScreen }    from './screens/GameScreen'
import { ResultScreen }  from './screens/ResultScreen'
import { StatsScreen }   from './screens/StatsScreen'
import { ReviewScreen }  from './screens/ReviewScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { StudyScreen }   from './screens/StudyScreen'
import { DailyScreen }  from './screens/DailyScreen'
import { ErrorBoundary }     from './components/ErrorBoundary'
import { AchievementToast } from './components/AchievementToast'
import { useRegisterSW }    from 'virtual:pwa-register/react'

export default function App() {
  const screen        = useGameStore(s => s.screen)
  const darkMode      = useGameStore(s => s.darkMode)
  const notifEnabled  = useGameStore(s => s.notifEnabled)
  const dailyStreak   = useGameStore(s => s.dailyStreak)
  const lastPlayed    = useGameStore(s => s.lastPlayedDate)
  const language      = useGameStore(s => s.language)

  // PWA update notification
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  // Apply / remove dark class on body
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
  }, [darkMode])

  // Streak-at-risk notification: fires at 19:00 if user hasn't played today
  useEffect(() => {
    if (!notifEnabled || !dailyStreak || Notification.permission !== 'granted') return
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
    if (lastPlayed !== yesterday) return  // already played today or no streak to protect
    const now     = new Date()
    const msTo7pm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0, 0).getTime() - now.getTime()
    const delay   = msTo7pm > 0 ? msTo7pm : 0
    const timer   = setTimeout(() => {
      if (document.visibilityState === 'hidden') {
        const body = language === 'en'
          ? `Your ${dailyStreak}-day streak is at risk! Play a round today.`
          : `¡Tu racha de ${dailyStreak} días está en peligro! Juega una partida hoy.`
        new Notification('🧭 FlagMaster', { body, icon: '/flag-master/icon-192.png' })
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [notifEnabled, dailyStreak, lastPlayed, language])

  return (
    <div className="app">
      <AchievementToast />
      {needRefresh && (
        <div style={{ position:'fixed', bottom:16, left:'50%', transform:'translateX(-50%)', zIndex:300, background:'var(--chrome-bg)', color:'var(--chrome-text)', border:'1px solid var(--gold)', padding:'12px 18px', display:'flex', alignItems:'center', gap:14, boxShadow:'var(--shadow)', whiteSpace:'nowrap' }}>
          <span style={{ fontFamily:"'DM Mono', monospace", fontSize:9.5, letterSpacing:'0.18em', textTransform:'uppercase' }}>
            {language === 'en' ? 'Update available' : 'Nueva versión disponible'}
          </span>
          <button onClick={() => updateServiceWorker(true)} style={{ background:'var(--gold)', color:'var(--chrome-bg)', border:'none', padding:'6px 14px', fontFamily:"'DM Mono', monospace", fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', cursor:'pointer' }}>
            {language === 'en' ? 'Update' : 'Actualizar'}
          </button>
        </div>
      )}
      <ErrorBoundary>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: 'easeInOut' }}
          style={{ width: '100%' }}
        >
          {screen === 'profiles' && <ProfileScreen />}
          {screen === 'home'     && <HomeScreen />}
          {screen === 'game'     && <GameScreen />}
          {screen === 'study'    && <StudyScreen />}
          {screen === 'results'  && <ResultScreen />}
          {screen === 'stats'    && <StatsScreen />}
          {screen === 'review'   && <ReviewScreen />}
          {screen === 'daily'    && <DailyScreen />}
        </motion.div>
      </AnimatePresence>
      </ErrorBoundary>
    </div>
  )
}
