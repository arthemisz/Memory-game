export default function LoadingSpinner() {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="loading__spinner" aria-hidden="true" />
      <p className="loading__text">Catching Pokémon…</p>
    </div>
  )
}
