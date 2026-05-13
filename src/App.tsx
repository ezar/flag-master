import { useGameStore } from './store/gameStore'
import { HomeScreen }   from './screens/HomeScreen'
import { GameScreen }   from './screens/GameScreen'
import { ResultScreen } from './screens/ResultScreen'

export default function App() {
  const screen = useGameStore(s => s.screen)

  return (
    <div className="app">
      {screen === 'home'    && <HomeScreen />}
      {screen === 'game'    && <GameScreen />}
      {screen === 'results' && <ResultScreen />}
    </div>
  )
}
