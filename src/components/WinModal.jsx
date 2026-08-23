export default function WinModal({ score, bestScore, onPlayAgain, onNewDeck }) {
  const isNewBest = score === bestScore

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal modal--won">
        <p className="modal__eyebrow">You Win!</p>
        <h2 id="modal-title" className="modal__title">
          Perfect round — {score} for {score}!
        </h2>
        <p className="modal__body">
          You clicked every card exactly once.
          {isNewBest ? ' New best score! 🏆' : ` Best score: ${bestScore}.`}
        </p>
        <div className="modal__actions">
          <button type="button" className="btn btn--primary" onClick={onPlayAgain}>
            Play Again
          </button>
          <button type="button" className="btn btn--ghost" onClick={onNewDeck}>
            New Deck
          </button>
        </div>
      </div>
    </div>
  )
}
