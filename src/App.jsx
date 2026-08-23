import { useEffect, useState } from 'react'
import Header from './components/Header'
import DifficultySelector from './components/DifficultySelector'
import GameBoard from './components/GameBoard'
import GameOverModal from './components/GameOverModal'
import WinModal from './components/WinModal'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorState from './components/ErrorState'
import { useMemoryGame, GAME_STATUS } from './hooks/useMemoryGame'

export default function App() {
  const {
    difficulty,
    difficulties,
    changeDifficulty,
    cards,
    score,
    bestScore,
    status,
    error,
    lastClickedId,
    handleCardClick,
    restartRound,
    newDeck,
  } = useMemoryGame('medium')

  // Briefly flag the just-clicked (repeated) card so the Card component
  // can play a "shake" animation before the game-over modal appears.
  const [shakeId, setShakeId] = useState(null)

  useEffect(() => {
    if (status === GAME_STATUS.LOST && lastClickedId != null) {
      setShakeId(lastClickedId)
      const timeout = setTimeout(() => setShakeId(null), 500)
      return () => clearTimeout(timeout)
    }
  }, [status, lastClickedId])

  const repeatedPokemon = cards.find((p) => p.id === lastClickedId)
  const isBoardInteractive = status === GAME_STATUS.PLAYING
  const isBusy = status === GAME_STATUS.LOADING

  return (
    <div className="app">
      <div className="app__container">
        <Header score={score} bestScore={bestScore} totalCards={cards.length} />

        <DifficultySelector
          difficulties={difficulties}
          current={difficulty}
          onChange={changeDifficulty}
          disabled={isBusy}
        />

        <main className="app__main">
          {status === GAME_STATUS.LOADING && <LoadingSpinner />}

          {status === GAME_STATUS.ERROR && (
            <ErrorState message={error} onRetry={newDeck} />
          )}

          {status !== GAME_STATUS.LOADING && status !== GAME_STATUS.ERROR && (
            <GameBoard
              cards={cards}
              onCardClick={handleCardClick}
              disabled={!isBoardInteractive}
              shakeId={shakeId}
            />
          )}
        </main>

        {status === GAME_STATUS.LOST && (
          <GameOverModal
            score={score}
            bestScore={bestScore}
            repeatedName={repeatedPokemon?.name}
            onPlayAgain={restartRound}
            onNewDeck={newDeck}
          />
        )}

        {status === GAME_STATUS.WON && (
          <WinModal
            score={score}
            bestScore={bestScore}
            onPlayAgain={restartRound}
            onNewDeck={newDeck}
          />
        )}

        <footer className="app__footer">
          <p>
            Pokémon data from{' '}
            <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">
              PokéAPI
            </a>
            . Not affiliated with Nintendo, Game Freak, or The Pokémon Company.
          </p>
        </footer>
      </div>
    </div>
  )
}
