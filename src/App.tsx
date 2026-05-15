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

export default function App() {
  const screen        = useGameStore(s => s.screen)
  const darkMode      = useGameStore(s => s.darkMode)
  const notifEnabled  = useGameStore(s => s.notifEnabled)
  const dailyStreak   = useGameStore(s => s.dailyStreak)
  const lastPlayed    = useGameStore(s => s.lastPlayedDate)

  // Apply / remove dark class on body
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
  }, [darkMode])

  // Streak-at-risk notification: if it's after 19:00 and user hasn't played today
  useEffect(() => {
    if (!notifEnabled || !dailyStreak || Notification.permission !== 'granted') return
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
    if (lastPlayed !== yesterday) return  // already played today or no streak yesterday
    const now  = new Date()
    const msTo7pm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0, 0).getTime() - now.getTime()
    const delay = msTo7pm > 0 ? msTo7pm : 0
    const timer = setTimeout(() => {
      if (document.visibilityState === 'hidden' || true) {
        new Notification('🧭 FlagMaster', {
          body: `¡Tu racha de ${dailyStreak} días está en peligro! Juega una partida hoy.`,
          icon: '/flag-master/icon-192.png',
        })
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [notifEnabled, dailyStreak, lastPlayed])

  return (
    <div className="app">
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
    </div>
  )
}
