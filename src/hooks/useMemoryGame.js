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

// --- Local Storage Helpers ---
const readBestScore = () => {
  const stored = window.localStorage.getItem(BEST_SCORE_KEY)
  const parsed = parseInt(stored, 10)
  return Number.isFinite(parsed) ? parsed : 0
}

const writeBestScore = (value) => {
  try { window.localStorage.setItem(BEST_SCORE_KEY, String(value)) } 
  catch { /* Ignore storage errors */ }
}

// --- Main Hook ---
export function useMemoryGame(initialDifficulty = 'medium') {
  
  // 1. Game Settings & UI State
  const [difficulty, setDifficulty] = useState(initialDifficulty)
  const [status, setStatus] = useState(GAME_STATUS.LOADING)
  const [error, setError] = useState(null)
  
  // 2. Deck & Player State
  const [cards, setCards] = useState([])
  const [clickedIds, setClickedIds] = useState(() => new Set())
  const [lastClickedId, setLastClickedId] = useState(null)
  
  // 3. Scores
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(readBestScore)

  // 4. Refs for Click Prevention
  const isProcessingRef = useRef(false)
  const timeoutRef = useRef(null)

  const cardCount = DIFFICULTIES[difficulty].cardCount

  // Helper to update and save the best score
  const updateBestScore = useCallback((currentScore) => {
    setBestScore((prevBest) => {
      const highest = Math.max(prevBest, currentScore)
      if (highest !== prevBest) writeBestScore(highest)
      return highest
    })
  }, [])

  // Fetches a fresh set of Pokémon
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
      setError(err instanceof Error ? err.message : 'Failed to load Pokémon.')
      setStatus(GAME_STATUS.ERROR)
    }
  }, [])

  // Load a new deck whenever the difficulty changes
  useEffect(() => {
    loadNewDeck(cardCount)
  }, [difficulty, cardCount, loadNewDeck])

  // Cleanup timeouts when the component unmounts
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  // Main gameplay logic
  const handleCardClick = useCallback((pokemonId) => {
      // Ignore clicks if animating or game is over
      if (isProcessingRef.current || status !== GAME_STATUS.PLAYING) return
      
      // Lock interactions
      isProcessingRef.current = true
      clearTimeout(timeoutRef.current)
      
      // CONDITION 1: Player clicked a card they already clicked (Loss)
      if (clickedIds.has(pokemonId)) {
        setStatus(GAME_STATUS.LOST)
        setLastClickedId(pokemonId)
        updateBestScore(score)
        return
      }

      // CONDITION 2: Player clicked a new card (Success)
      const nextClicked = new Set(clickedIds).add(pokemonId)
      const nextScore = score + 1

      setClickedIds(nextClicked)
      setScore(nextScore)
      setLastClickedId(pokemonId)
      setCards((prevCards) => shuffleArray(prevCards))

      // CONDITION 3: Player clicked all cards (Win)
      if (nextClicked.size === cards.length) {
        setStatus(GAME_STATUS.WON)
        updateBestScore(nextScore)
      }

      // Unlock interactions after the shuffle animation finishes
      timeoutRef.current = setTimeout(() => {
        isProcessingRef.current = false
      }, 250)

    },
    [status, clickedIds, score, cards.length, updateBestScore]
  )

  // Resets the current deck for another try
  const restartRound = useCallback(() => {
    setCards((prevCards) => shuffleArray(prevCards))
    setClickedIds(new Set())
    setScore(0)
    setLastClickedId(null)
    setStatus(GAME_STATUS.PLAYING)
    isProcessingRef.current = false
  }, [])

  return {
    difficulty,
    difficulties: DIFFICULTIES,
    changeDifficulty: setDifficulty, // Directly pass the setter here
    cards,
    clickedIds,
    score,
    bestScore,
    status,
    error,
    lastClickedId,
    handleCardClick,
    restartRound,
    newDeck: () => loadNewDeck(cardCount),
  }
}