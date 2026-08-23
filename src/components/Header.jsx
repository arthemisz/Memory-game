export default function Header({ score, bestScore, totalCards }) {
  return (
    <header className="header">
      <div className="header__title-group">
        <img src="/pokeball.svg" alt="" className="header__logo" aria-hidden="true" />
        <h1 className="header__title">Memory Match</h1>
      </div>
      <p className="header__subtitle">
        Click every card once — click one twice and it&rsquo;s game over.
      </p>
      <div className="header__scores" role="status" aria-live="polite">
        <div className="score-pill score-pill--current">
          <span className="score-pill__label">Score</span>
          <span className="score-pill__value">
            {score}
            <span className="score-pill__value-muted"> / {totalCards}</span>
          </span>
        </div>
        <div className="score-pill score-pill--best">
          <span className="score-pill__label">Best</span>
          <span className="score-pill__value">{bestScore}</span>
        </div>
      </div>
    </header>
  )
}
