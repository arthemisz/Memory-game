/**
 * Fisher-Yates (Knuth) shuffle.
 * Returns a NEW shuffled array — never mutates the input.
 * This is the industry-standard unbiased shuffle algorithm:
 * every permutation of the array is equally likely.
 *
 * @template T
 * @param {T[]} array
 * @returns {T[]} a new, shuffled array
 */
export function shuffleArray(array) {
  const result = [...array]

  for (let i = result.length - 1; i > 0; i--) {
    // Pick a random index from 0..i (inclusive)
    const j = Math.floor(Math.random() * (i + 1))
    // Swap result[i] and result[j]
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}
