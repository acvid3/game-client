# Game Client

A dark-themed browser-based casino game platform with six mini-games, Event Pass progression system, crystal economy, and premium features. Built with Next.js 14, TypeScript, styled-components, and framer-motion.

## Features

### Games

| Game | Description |
|------|-------------|
| **Dice Roll** | Roll two dice — win multipliers based on sum (7 = x3, 2/12 = x5) |
| **Spin Wheel** | Probability-based wheel with 6 segments (Jackpot → Lose) |
| **Lucky Spin** | 5-reel slot machine with streak-based payouts |
| **Crash** | Rising multiplier — cash out before it crashes |
| **Blackjack** | Full blackjack with Hit/Stand, dealer AI, bet system |
| **Collection Match** | Memory card game with 4 item rarities |

### Crystal Economy

- Start with **10 free crystals**
- Free crystals regenerate **every 5 minutes** (max 10)
- Use crystals to **restore attempts** in games
- **Premium bonus**: +20% crystals on purchase

### Event Pass

- **30 levels** with Free and Premium reward tracks
- Activate premium with code: `acvid3`
- Each level rewards coins, items, and XP

### Design

- **Dark theme** (`#0d0d14` background)
- **Indigo accent** (`#6366f1`)
- **Frosted glass** cards with `backdrop-filter: blur(16px)`
- **Sharp corners** — no border-radius throughout
- **Parallax effect** on game cards (background shifts on mouse move)
- **Casino-themed backgrounds** (gaming setups, neon, slot machines)
- **Font Awesome icons** for UI elements
- **Space Grotesk** font

### Sound Effects

All sounds generated via Web Audio API (no audio files needed):
- Dice roll, card deal, wheel spin, reel spin
- Win, lose, jackpot, cashout sounds
- Tick sounds during Crash multiplier growth

### Animated Game Previews

Each dashboard card shows an animated preview of its game:
- Dice Roll — bouncing dice with dots
- Spin Wheel — spinning wheel indicator
- Crash — animated bar chart
- Blackjack — flipping cards
- Lucky Spin — spinning reel strips
- Collection Match — pulsing items

## Tech Stack

- **Framework**: Next.js 14 (App Router, client-side)
- **Language**: TypeScript
- **Styling**: styled-components, CSS Modules
- **Animation**: framer-motion
- **Icons**: lucide-react, react-icons (Font Awesome)
- **State**: React Context + useReducer + localStorage
- **Sounds**: Web Audio API

## Getting Started

```bash
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Pages (App Router)
│   ├── games/[slug]/       # Individual game pages
│   ├── event-pass/         # Event Pass page
│   └── monetization/       # Monetization page
├── components/
│   ├── games/              # 6 game components + GameLegend
│   └── ...                 # Dashboard, EventCard, EventPass, etc.
├── context/                # GameContext provider
├── hooks/                  # useGameState, useLocalStorage
├── styles/                 # CSS Modules
├── types/                  # TypeScript interfaces
└── utils/                  # Sounds, event pass progression
```

## Configuration

- **Premium code**: `acvid3` (activate in Event Pass or Monetization)
- **Free crystal regen**: 5 minutes (max 10)
- **Event pass levels**: 30
- **Game attempts**: vary by game (2–5)

## Keys

- `acvid3` — Premium activation code
