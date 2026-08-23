export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <p className="error-state__text">{message || 'Something went wrong.'}</p>
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Try Again
      </button>
    </div>
  )
}
