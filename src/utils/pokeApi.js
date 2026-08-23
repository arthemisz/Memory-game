// PokéAPI has 1025 canonical species as of Gen 9. We sample from the first
// 898 (through Gen 8) to stay clear of any still-shifting newer entries and
// keep artwork consistently available on the official-artwork endpoint.
const MAX_POKEMON_ID = 898
const POKEAPI_BASE = 'https://pokeapi.co/api/v2/pokemon'

/**
 * Generates `count` unique random Pokémon IDs in the range [1, MAX_POKEMON_ID].
 * @param {number} count
 * @returns {number[]}
 */
function getRandomUniqueIds(count) {
  const ids = new Set()
  while (ids.size < count) {
    const id = Math.floor(Math.random() * MAX_POKEMON_ID) + 1
    ids.add(id)
  }
  return [...ids]
}

/**
 * Fetches a single Pokémon's display data from PokéAPI.
 * @param {number} id
 * @returns {Promise<{id:number,name:string,image:string}|null>}
 */
async function fetchPokemon(id) {
  const res = await fetch(`${POKEAPI_BASE}/${id}`)
  if (!res.ok) {
    throw new Error(`PokéAPI responded with status ${res.status} for id ${id}`)
  }
  const data = await res.json()

  const image =
    data.sprites?.other?.['official-artwork']?.front_default ||
    data.sprites?.front_default

  if (!image) return null // skip entries with no usable artwork

  return {
    id: data.id,
    name: data.name,
    image,
  }
}

/**
 * Fetches `count` unique, randomly-selected Pokémon in parallel.
 * If a fetched entry has no artwork, it's replaced with a fresh random pick
 * so the caller always gets exactly `count` usable cards back.
 *
 * @param {number} count
 * @returns {Promise<Array<{id:number,name:string,image:string}>>}
 */
export async function fetchRandomPokemon(count) {
  const seen = new Set()
  const results = []
  let candidateIds = getRandomUniqueIds(count)

  // Keep topping up until we have `count` valid, unique cards.
  // Bounded to a handful of passes so a bad run can't loop forever.
  for (let attempt = 0; attempt < 5 && results.length < count; attempt++) {
    const needed = candidateIds.filter((id) => !seen.has(id))
    const fetched = await Promise.all(
      needed.map((id) =>
        fetchPokemon(id).catch(() => null) // tolerate a single dropped call
      )
    )

    for (const pokemon of fetched) {
      if (pokemon && !seen.has(pokemon.id) && results.length < count) {
        seen.add(pokemon.id)
        results.push(pokemon)
      }
    }

    if (results.length < count) {
      candidateIds = getRandomUniqueIds(count - results.length)
    }
  }

  if (results.length < count) {
    throw new Error('Could not load enough Pokémon. Please try again.')
  }

  return results
}
