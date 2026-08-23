import Card from './Card'

export default function GameBoard({ cards, onCardClick, disabled, shakeId }) {
  return (
    <div className="board" role="group" aria-label="Pokémon card grid">
      {cards.map((pokemon) => (
        // pokemon.id (not array index!) is the key — see README "The Shuffle
        // Trap" note. Cards physically reorder every click; an index key
        // would make React reuse the wrong DOM node for the wrong Pokémon
        // and silently break the shuffle animation.
        <Card
          key={pokemon.id}
          pokemon={pokemon}
          onClick={onCardClick}
          disabled={disabled}
          isShaking={shakeId === pokemon.id}
        />
      ))}
    </div>
  )
}
