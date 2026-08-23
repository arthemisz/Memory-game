import { memo } from 'react'

/**
 * A single flippable Pokémon card.
 * Keyed by pokemon.id at the call site (never array index) so React
 * tracks each physical card across shuffles instead of reusing whichever
 * DOM node happens to sit at a given position.
 */
function Card({ pokemon, onClick, disabled, isShaking }) {
  return (
    <button
      type="button"
      className={`card${isShaking ? ' card--shake' : ''}`}
      onClick={() => onClick(pokemon.id)}
      disabled={disabled}
      aria-label={`Score a point for ${pokemon.name}`}
    >
      <span className="card__inner">
        <img
          className="card__image"
          src={pokemon.image}
          alt={pokemon.name}
          loading="lazy"
          draggable={false}
        />
        <span className="card__name">{pokemon.name}</span>
      </span>
    </button>
  )
}

export default memo(Card)
