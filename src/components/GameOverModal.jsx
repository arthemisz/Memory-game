export default function GameOverModal({ score, bestScore, repeatedName, onPlayAgain, onNewDeck }) {
  const isNewBest = score > 0 && score === bestScore

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal modal--lost">
        <p className="modal__eyebrow">Game Over</p>
        <h2 id="modal-title" className="modal__title">
          You clicked {repeatedName ? repeatedName : 'a card'} twice!
        </h2>
        <p className="modal__body">
          You scored <strong>{score}</strong> point{score === 1 ? '' : 's'} this round.
          {isNewBest ? ' That\'s a new best score! 🎉' : ` Best so far: ${bestScore}.`}
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
