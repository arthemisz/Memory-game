export default function DifficultySelector({ difficulties, current, onChange, disabled }) {
  return (
    <div className="difficulty" role="radiogroup" aria-label="Select difficulty">
      {Object.entries(difficulties).map(([key, { label, cardCount }]) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={current === key}
          className={`difficulty__option${current === key ? ' difficulty__option--active' : ''}`}
          onClick={() => onChange(key)}
          disabled={disabled}
        >
          <span className="difficulty__label">{label}</span>
          <span className="difficulty__count">{cardCount} cards</span>
        </button>
      ))}
    </div>
  )
}
