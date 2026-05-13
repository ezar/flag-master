import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from './store/gameStore'
import { HomeScreen }   from './screens/HomeScreen'
import { GameScreen }   from './screens/GameScreen'
import { ResultScreen } from './screens/ResultScreen'
import { StatsScreen }  from './screens/StatsScreen'
import { ReviewScreen } from './screens/ReviewScreen'

export default function App() {
  const screen = useGameStore(s => s.screen)

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: 'easeInOut' }}
        >
          {screen === 'home'    && <HomeScreen />}
          {screen === 'game'    && <GameScreen />}
          {screen === 'results' && <ResultScreen />}
          {screen === 'stats'   && <StatsScreen />}
          {screen === 'review'  && <ReviewScreen />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
