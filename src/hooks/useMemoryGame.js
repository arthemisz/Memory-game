import { useCallback, useEffect, useState } from 'react'
import { shuffleArray } from '../utils/shuffle'
import { fetchRandomPokemon } from '../utils/pokeApi'

export const DIFFICULTIES = {
  easy: { label: 'Easy', cardCount: 8 },
  medium: { label: 'Medium', cardCount: 12 },
  hard: { label: 'Hard', cardCount: 20 },
}

export const GAME_STATUS = {
  LOADING: 'loading',
  ERROR: 'error',
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost',
}

const BEST_SCORE_KEY = 'memoryGame.bestScore'

function readBestScore() {
  try {
    const stored = window.localStorage.getItem(BEST_SCORE_KEY)
    const parsed = stored ? parseInt(stored, 10) : 0
    return Number.isFinite(parsed) ? parsed : 0
  } catch {
    // localStorage can throw in private-browsing / disabled-storage contexts
    return 0
  }
}

function writeBestScore(value) {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(value))
  } catch {
    // Best-effort only — losing best-score persistence shouldn't break the game
  }
}

/**
 * Encapsulates all state and logic for the Memory Card game:
 *  - fetching a fresh Pokémon deck from PokéAPI whenever difficulty changes
 *  - the click handler that scores, shuffles, detects repeats, and detects wins
 *  - best-score persistence across sessions via localStorage
 */
export function useMemoryGame(initialDifficulty = 'medium') {
  const [difficulty, setDifficulty] = useState(initialDifficulty)
  const [cards, setCards] = useState([]) // shuffled deck currently on screen
  const [clickedIds, setClickedIds] = useState(() => new Set())
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(readBestScore)
  const [status, setStatus] = useState(GAME_STATUS.LOADING)
  const [error, setError] = useState(null)
  const [lastClickedId, setLastClickedId] = useState(null) // for the "you repeated this one" message

  const cardCount = DIFFICULTIES[difficulty].cardCount

  // Fetch a brand-new deck any time difficulty changes (or on demand via loadNewDeck).
  const loadNewDeck = useCallback(async (count) => {
    setStatus(GAME_STATUS.LOADING)
    setError(null)
    try {
      const pokemon = await fetchRandomPokemon(count)
      setCards(shuffleArray(pokemon))
      setClickedIds(new Set())
      setScore(0)
      setLastClickedId(null)
      setStatus(GAME_STATUS.PLAYING)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong loading Pokémon.')
      setStatus(GAME_STATUS.ERROR)
    }
  }, [])

  useEffect(() => {
    loadNewDeck(cardCount)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only re-fetch on difficulty change
  }, [difficulty])

  // The core game logic: click a card to score, shuffle, or lose.
  const handleCardClick = useCallback(
    (pokemonId) => {
      if (status !== GAME_STATUS.PLAYING) return

      if (clickedIds.has(pokemonId)) {
        // Repeat click — game over.
        setLastClickedId(pokemonId)
        setStatus(GAME_STATUS.LOST)
        setBestScore((prevBest) => {
          const nextBest = Math.max(prevBest, score)
          if (nextBest !== prevBest) writeBestScore(nextBest)
          return nextBest
        })
        return
      }

      const nextClicked = new Set(clickedIds)
      nextClicked.add(pokemonId)
      const nextScore = score + 1

      setClickedIds(nextClicked)
      setScore(nextScore)
      setLastClickedId(pokemonId)
      setCards((prevCards) => shuffleArray(prevCards))

      if (nextClicked.size === cards.length) {
        // Every card clicked exactly once — win!
        setStatus(GAME_STATUS.WON)
        setBestScore((prevBest) => {
          const nextBest = Math.max(prevBest, nextScore)
          if (nextBest !== prevBest) writeBestScore(nextBest)
          return nextBest
        })
      }
    },
    [status, clickedIds, score, cards.length]
  )

  // Reset with the SAME deck (used by "Play Again" so difficulty doesn't have to refetch).
  const restartRound = useCallback(() => {
    setCards((prevCards) => shuffleArray(prevCards))
    setClickedIds(new Set())
    setScore(0)
    setLastClickedId(null)
    setStatus(GAME_STATUS.PLAYING)
  }, [])

  // Fetch a brand-new deck of the same size (used by "New Deck").
  const newDeck = useCallback(() => {
    loadNewDeck(cardCount)
  }, [loadNewDeck, cardCount])

  const changeDifficulty = useCallback((nextDifficulty) => {
    setDifficulty(nextDifficulty)
  }, [])

  return {
    difficulty,
    difficulties: DIFFICULTIES,
    changeDifficulty,
    cards,
    clickedIds,
    score,
    bestScore,
    status,
    error,
    lastClickedId,
    handleCardClick,
    restartRound,
    newDeck,
  }
}
