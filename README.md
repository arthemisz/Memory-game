# 🧠 Memory Match — Pokémon Memory Card Game

A memory card game built with React + Vite. Click a card to score a point — but click the **same card twice** and it's game over. Cards reshuffle after every click using the Fisher-Yates algorithm, so you're never clicking in a predictable order.

Built for **Nexus Front-End Boot Camp — Project 4** (State, Side Effects & Game Logic), inspired by [The Odin Project's Memory Card lesson](https://www.theodinproject.com/lessons/node-path-react-new-memory-card).

---

## 🎮 How to Play

1. A grid of Pokémon cards loads from [PokéAPI](https://pokeapi.co/).
2. Click any card to score **+1 point**.
3. After every click, **all cards reshuffle** into a new random order.
4. Click a card you've **already clicked this round** → **Game Over**.
5. Click **every card exactly once** → **You Win**.
6. Your **best score** is saved across sessions (localStorage).

---

## ✅ Requirements Checklist

| # | Requirement | Where it lives |
|---|---|---|
| 1 | Cards fetched from PokéAPI using `useEffect` | `hooks/useMemoryGame.js` (effect calls `loadNewDeck`) |
| 2 | Loading spinner while fetching | `components/LoadingSpinner.jsx` |
| 3 | Responsive card grid | `styles/index.css` → `.board` (CSS Grid, `auto-fill`) |
| 4 | Cards shuffle on every click | `utils/shuffle.js` (Fisher-Yates), called in `handleCardClick` |
| 5 | Score increments on each new card click | `hooks/useMemoryGame.js` → `handleCardClick` |
| 6 | Game over when same card clicked twice | `hooks/useMemoryGame.js` → `handleCardClick` (checks `clickedIds`) |
| 7 | Win state when all cards clicked once | `hooks/useMemoryGame.js` → `handleCardClick` (`nextClicked.size === cards.length`) |
| 8 | Best score tracked across rounds/sessions | `hooks/useMemoryGame.js` → `readBestScore` / `writeBestScore` (localStorage) |
| 9 | Difficulty selector (8 / 12 / 20 cards) | `components/DifficultySelector.jsx` + `DIFFICULTIES` config |
| 10 | Game over and win modals | `components/GameOverModal.jsx`, `components/WinModal.jsx` |
| 11 | Proper key prop (Pokémon `id`, not array index) | `components/GameBoard.jsx` — see "The Shuffle Trap" below |
| 12 | Deployed to Vercel or Netlify | See [Deployment](#-deployment) below |
| 13 | GitHub with meaningful commits | This repo ships with staged commits — see [Push to GitHub](#-push-to-github) |

---

## 📁 Project Structure

```
memory-card-game/
├── index.html
├── package.json
├── vite.config.js
├── .eslintrc.cjs
├── .gitignore
├── public/
│   └── pokeball.svg
└── src/
    ├── main.jsx                     # React entry point
    ├── App.jsx                      # Wires everything together
    ├── components/
    │   ├── Header.jsx                # Title + current/best score
    │   ├── DifficultySelector.jsx    # Easy / Medium / Hard
    │   ├── GameBoard.jsx             # Renders the card grid
    │   ├── Card.jsx                  # Single reusable card
    │   ├── GameOverModal.jsx         # Shown when you repeat a card
    │   ├── WinModal.jsx              # Shown when you clear the board
    │   ├── LoadingSpinner.jsx        # Shown while fetching PokéAPI
    │   └── ErrorState.jsx            # Shown if the fetch fails
    ├── hooks/
    │   └── useMemoryGame.js          # ALL game state + core click logic
    ├── utils/
    │   ├── shuffle.js                # Fisher-Yates shuffle
    │   └── pokeApi.js                # PokéAPI fetch logic
    └── styles/
        └── index.css                 # Full design system
```

This matches the brief's component tree:

```
App
  ├── Header (title + scores)
  ├── DifficultySelector
  ├── GameBoard
  │  └── Card (reusable, per pokemon)
  ├── GameOverModal
  └── WinModal
```

`hooks/`and `utils/` are added alongside it to keep the game logic and API/shuffle logic testable and out of the UI components — `App.jsx` stays a thin wiring layer.

---

## 🃏 The Shuffle Trap (why `key={pokemon.id}`)

In `GameBoard.jsx`, each `<Card>` is keyed by `pokemon.id`, **never** by array index:

```jsx
{cards.map((pokemon) => (
  <Card key={pokemon.id} pokemon={pokemon} ... />
))}
```

After a shuffle, the *array order* changes but the *set of Pokémon* doesn't. If you keyed by index, React would see "index 0 is still index 0" and reuse the same DOM node for whatever Pokémon now happens to sit there — swapping the image out from under an element that CSS thinks hasn't changed. That breaks transitions and can cause visually "stuck" cards. Keying by the Pokémon's own `id` tells React "this is the *same* card, just moved," so it correctly animates the move instead of mutating the wrong node in place.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ and npm

### Install & run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Build for production

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build locally
```

### Lint

```bash
npm run lint
```

No API key or `.env` file is required — PokéAPI is free and public.

---

## ☁️ Deployment

### Option A: Vercel

1. Push this project to a GitHub repo (see below).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel auto-detects Vite. Confirm:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**.

Or via CLI:
```bash
npm install -g vercel
vercel --prod
```

### Option B: Netlify

1. Push this project to a GitHub repo (see below).
2. Go to [app.netlify.com/start](https://app.netlify.com/start) and pick the repo.
3. Set:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
4. Click **Deploy site**.

Or via CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## 📦 Push to GitHub

This project already includes a local git repo with staged, meaningful commits (scaffold → utilities → game logic → components → styling → docs). To publish it:

```bash
# 1. Create a new empty repo on github.com (no README/gitignore — this project already has them)

# 2. Point this local repo at it and push
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git branch -M main
git push -u origin main
```

Check your history any time with:
```bash
git log --oneline
```

---

## 🛠️ Tech Stack

- **React 18** — UI and state
- **Vite** — dev server & build tool
- **PokéAPI** — Pokémon data + official artwork
- **Fisher-Yates shuffle** — unbiased card reshuffling
- **localStorage** — best-score persistence across sessions
- Plain CSS (no framework) — custom design system in `styles/index.css`

---

## 🙏 Credits

Pokémon data and artwork via [PokéAPI](https://pokeapi.co/). Not affiliated with Nintendo, Game Freak, or The Pokémon Company. Project brief adapted from [The Odin Project](https://www.theodinproject.com/lessons/node-path-react-new-memory-card).
