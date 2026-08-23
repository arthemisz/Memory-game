const MAX_POKEMON_ID = 898
const POKEAPI_BASE = 'https://pokeapi.co/api/v2/pokemon'

// Helper to get a random number between 1 and MAX_POKEMON_ID
function getRandomId() {
  return Math.floor(Math.random() * MAX_POKEMON_ID) + 1
}

// Fetch a single Pokemon by ID
async function fetchSinglePokemon(id) {
  const response = await fetch(`${POKEAPI_BASE}/${id}`)
  if (!response.ok) return null

  const data = await response.json()

  // Grab the official artwork, or fallback to the default sprite
  const image =
    data.sprites?.other?.['official-artwork']?.front_default ||
    data.sprites?.front_default

  if (!image) return null

  return {
    id: data.id,
    name: data.name,
    image,
  }
}

// Main function to fetch 'count' unique Pokemon
export async function fetchRandomPokemon(count) {
  const pokemonList = []
  const usedIds = new Set()

  while (pokemonList.length < count) {
    const randomId = getRandomId()

    // Skip if we already picked this ID
    if (usedIds.has(randomId)) continue

    usedIds.add(randomId)

    try {
      const pokemon = await fetchSinglePokemon(randomId)
      if (pokemon) {
        pokemonList.push(pokemon)
      }
    } catch (error) {
      console.error(`Failed to fetch Pokemon #${randomId}:`, error)
    }
  }

  return pokemonList
}