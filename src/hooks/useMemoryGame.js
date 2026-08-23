import { useCallback, useEffect, useRef, useState } from 'react'
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
    return 0
  }
}

function writeBestScore(value) {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(value))
  } catch {
    // ¯\_(ツ)_/¯
  }
}

export function useMemoryGame(initialDifficulty = 'medium') {
  // State
  const [difficulty, setDifficulty] = useState(initialDifficulty)
  const [cards, setCards] = useState([])
  const [clickedIds, setClickedIds] = useState(() => new Set())
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(readBestScore)
  const [status, setStatus] = useState(GAME_STATUS.LOADING)
  const [error, setError] = useState(null)
  const [lastClickedId, setLastClickedId] = useState(null)

  // HACK: Prevents spam clicking during shuffle
  const isProcessingRef = useRef(false)
  // TODO: This should probably be cleaned up on unmount
  const timeoutRef = useRef(null)

  const cardCount = DIFFICULTIES[difficulty].cardCount

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
      console.error('Failed to load deck:', err) // Keep for debugging
      setError(err instanceof Error ? err.message : 'Something went wrong loading Pokémon.')
      setStatus(GAME_STATUS.ERROR)
    }
  }, [])

  useEffect(() => {
    loadNewDeck(cardCount)
  }, [difficulty])

  const handleCardClick = useCallback(
    (pokemonId) => {
      // FIXME: This doesn't work properly on mobile sometimes
      if (isProcessingRef.current) return
      
      if (status !== GAME_STATUS.PLAYING) return

      if (clickedIds.has(pokemonId)) {
        setLastClickedId(pokemonId)
        setStatus(GAME_STATUS.LOST)
        
        setBestScore((prevBest) => {
          const nextBest = Math.max(prevBest, score)
          if (nextBest !== prevBest) writeBestScore(nextBest)
          return nextBest
        })
        return
      }

      // Lock to prevent double clicks
      isProcessingRef.current = true
      clearTimeout(timeoutRef.current)
      
      const nextClicked = new Set(clickedIds)
      nextClicked.add(pokemonId)
      const nextScore = score + 1

      setClickedIds(nextClicked)
      setScore(nextScore)
      setLastClickedId(pokemonId)
      setCards((prevCards) => shuffleArray(prevCards))

      // Unlock after shuffle animation
      timeoutRef.current = setTimeout(() => {
        isProcessingRef.current = false
      }, 250)

      if (nextClicked.size === cards.length) {
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

  // cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const restartRound = useCallback(() => {
    setCards((prevCards) => shuffleArray(prevCards))
    setClickedIds(new Set())
    setScore(0)
    setLastClickedId(null)
    setStatus(GAME_STATUS.PLAYING)
    // Reset the lock just in case
    isProcessingRef.current = false
  }, [])

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