# Games Platform — Build Roadmap

A platform where anyone can come and play different types of games (2D and 3D), in the browser, with accounts, leaderboards, and eventually real-time multiplayer.

---

## 1. Vision

A single web platform that hosts many small games — from classic 2D puzzlers (2048, Tetris, Snake) to 3D experiences (mini golf, racing, shooters) — with a unified shell: one login, one profile, global leaderboards, friends, and matchmaking.

Core principles:
- **Browser-first** — no installs. Anyone with a URL can play.
- **Modular games** — each game is a self-contained module behind a shared contract, so adding a game never breaks the platform.
- **Ship fast, polish later** — start with single-player 2D, layer in 3D and multiplayer over time.

---

## 2. Tech Stack

### Frontend (platform shell)
- **Next.js (App Router) + React + TypeScript** — pages, routing, SSR
- **Tailwind CSS** + **shadcn/ui** — styling and components
- **Zustand** or **React Context** — light client state
- **TanStack Query** — server state / API calls

### 2D game engines
- **HTML5 Canvas** (raw) — for tiny games like Tic-Tac-Toe, Snake
- **PixiJS** — high-performance 2D rendering for sprite-heavy games
- **Phaser 3** — full 2D framework with physics, input, scenes (use for Tetris, Breakout, platformers)

### 3D game engines
- **Three.js** — low-level 3D rendering
- **react-three-fiber (R3F)** + **@react-three/drei** — React-friendly Three.js, fits naturally into Next.js
- **@react-three/rapier** — physics (Rapier WASM physics engine)
- **@react-three/cannon** — alternative physics (older but simpler)

### Backend
- **Next.js API routes** (start here) → graduate to a dedicated **Node.js (Fastify)** service when needed
- **Socket.IO** or native **WebSockets** — real-time multiplayer
- **PostgreSQL** + **Prisma** (or **Drizzle**) — users, games, scores, matches
- **Redis** — sessions, matchmaking queues, ephemeral game state, sorted-set leaderboards

### Auth & infra
- **Clerk** or **Auth.js (NextAuth)** — auth (Google, GitHub, email)
- **Vercel** — frontend hosting
- **Railway / Fly.io / Render** — backend, Postgres, Redis
- **Cloudflare R2 / S3** — game assets (sprites, models, audio)

---

## 3. Architecture

```
┌────────────────────────────────────────────────────────┐
│   Platform Shell (Next.js + React)                     │
│   • Landing page                                       │
│   • Auth (sign in / up / profile)                      │
│   • Game library (2D + 3D categories)                  │
│   • Leaderboards, friends, achievements                │
│   • In-game HUD overlay (pause, exit, share)           │
└─────────────────────────┬──────────────────────────────┘
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
  ┌────▼─────┐      ┌─────▼──────┐     ┌─────▼──────┐
  │ 2D Games │      │  3D Games  │     │   API      │
  │ (Phaser, │      │  (R3F +    │     │  /scores   │
  │  Pixi,   │      │  Three.js) │     │  /users    │
  │  Canvas) │      │            │     │  /matches  │
  └────┬─────┘      └─────┬──────┘     │  /lobbies  │
       │                  │            └─────┬──────┘
       └──── shared ──────┘                  │
            game contract                    │
                                       ┌─────▼──────┐
                                       │  Postgres  │
                                       │  + Redis   │
                                       └─────┬──────┘
                                             │
                                       ┌─────▼──────┐
                                       │ WebSocket  │
                                       │  Server    │
                                       │ (Socket.IO)│
                                       └────────────┘
```

### Game module contract
Every game (2D or 3D) implements the same interface so the platform can host them uniformly:

```ts
export interface GameModule {
  id: string;                       // "2048", "tetris", "minigolf-3d"
  title: string;
  category: "2d" | "3d";
  thumbnail: string;
  multiplayer: boolean;

  mount(container: HTMLElement, ctx: GameContext): GameInstance;
}

export interface GameContext {
  user: { id: string; username: string };
  onScore: (score: number) => void;
  onAchievement: (key: string) => void;
  onEnd: (result: { score: number; won?: boolean; meta?: any }) => void;
  socket?: Socket;                  // present for multiplayer games
}

export interface GameInstance {
  pause(): void;
  resume(): void;
  destroy(): void;
}
```

This way, swapping a 2D Phaser game for a 3D R3F game is just a different `mount()` implementation — the platform shell never changes.

---

## 4. Folder Structure

```
games-self/
├── apps/
│   ├── web/                    # Next.js platform shell
│   │   ├── app/
│   │   │   ├── (marketing)/
│   │   │   ├── (app)/
│   │   │   │   ├── games/
│   │   │   │   ├── leaderboard/
│   │   │   │   └── profile/
│   │   │   └── api/
│   │   ├── components/
│   │   └── lib/
│   └── realtime/               # Socket.IO server (later)
├── packages/
│   ├── game-sdk/               # Shared GameModule contract + helpers
│   ├── ui/                     # Shared UI components
│   └── db/                     # Prisma schema + client
├── games/
│   ├── 2d/
│   │   ├── 2048/
│   │   ├── tetris/
│   │   ├── snake/
│   │   └── tic-tac-toe/
│   └── 3d/
│       ├── minigolf/
│       ├── ball-roller/
│       └── kart-race/
├── package.json                # pnpm workspaces / turbo
└── ROADMAP.md
```

A monorepo (pnpm workspaces + Turborepo) keeps the platform and individual games independently buildable.

---

## 5. Database Schema (starter)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  avatarUrl String?
  createdAt DateTime @default(now())
  scores    Score[]
  matches   MatchPlayer[]
}

model Game {
  id          String  @id            // "2048", "minigolf-3d"
  title       String
  category    String                 // "2d" | "3d"
  multiplayer Boolean @default(false)
  scores      Score[]
}

model Score {
  id        String   @id @default(cuid())
  userId    String
  gameId    String
  value     Int
  meta      Json?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  game      Game     @relation(fields: [gameId], references: [id])

  @@index([gameId, value])
}

model Match {
  id        String        @id @default(cuid())
  gameId    String
  status    String         // "waiting" | "active" | "finished"
  winnerId  String?
  startedAt DateTime?
  endedAt   DateTime?
  players   MatchPlayer[]
}

model MatchPlayer {
  id      String  @id @default(cuid())
  matchId String
  userId  String
  score   Int     @default(0)
  match   Match   @relation(fields: [matchId], references: [id])
  user    User    @relation(fields: [userId], references: [id])

  @@unique([matchId, userId])
}
```

---

## 6. Build Phases

### Phase 1 — Platform Shell (Week 1)
- [ ] Init Next.js + TypeScript + Tailwind + shadcn/ui
- [ ] Set up monorepo (pnpm workspaces + Turborepo)
- [ ] Auth with Clerk (or Auth.js)
- [ ] Postgres + Prisma; deploy DB on Railway
- [ ] Landing page + game library grid (empty state)
- [ ] Profile page

### Phase 2 — First 2D Game + Score Pipeline (Week 2)
- [ ] Define `GameModule` contract in `packages/game-sdk`
- [ ] Build **2048** as the reference 2D game
- [ ] `POST /api/scores` endpoint
- [ ] Per-game leaderboard (top 100 via Postgres, hot scores via Redis sorted set)
- [ ] Game-end modal with score submit + share

### Phase 3 — More 2D Games (Week 3)
- [ ] **Wordle clone** (daily challenge variant)
- [ ] **Snake** (Canvas)
- [ ] **Tic-Tac-Toe** vs AI (minimax)
- [ ] Achievements table + unlock toasts

### Phase 4 — First 3D Game (Week 4–5)
- [ ] Add R3F + drei + Rapier
- [ ] Build **Ball Roller** (tilt-the-maze style) — easiest 3D MVP
- [ ] 3D-specific HUD overlay (FPS, controls hint, settings)
- [ ] Asset pipeline: glTF models in R2/S3

### Phase 5 — Multiplayer Foundation (Week 6–7)
- [ ] Stand up `apps/realtime` with Socket.IO
- [ ] Lobby + matchmaking via Redis
- [ ] **Tic-Tac-Toe online** as first networked game
- [ ] Friends + invites
- [ ] Reconnect handling, server-authoritative state

### Phase 6 — More 3D + Multiplayer (Week 8+)
- [ ] **3D Mini Golf** (single-player, then turn-based multi)
- [ ] **Kart racing** (3D, multiplayer, lap timer)
- [ ] Spectator mode
- [ ] Replays (record inputs, replay client-side)

### Phase 7 — Polish & Growth
- [ ] Daily challenges + streaks
- [ ] Seasonal leaderboards
- [ ] Discord-style chat
- [ ] Mobile-responsive controls (touch joystick for 3D games)
- [ ] PWA install
- [ ] Analytics (PostHog) and A/B testing

---

## 7. Game Catalog

### 2D Games — Tier 1 (Beginner, 1–3 days each, single-player)
1. **Tic-Tac-Toe** — also doubles as multiplayer pilot later
2. **2048** — number sliding puzzle
3. **Snake** — Canvas, classic game loop
4. **Memory / Concentration** — flip and match pairs
5. **Minesweeper** — grid logic
6. **Wordle clone** — daily word, great retention
7. **Connect Four** vs AI — minimax learning project
8. **Whack-a-Mole** — reaction game
9. **Typing Speed Test** — WPM leaderboard

### 2D Games — Tier 2 (Intermediate, 1–2 weeks each)
10. **Sudoku** — generator + solver
11. **Tetris** — Phaser-based
12. **Breakout / Brick Breaker** — physics + collisions
13. **Flappy Bird clone** — viral, simple
14. **Asteroids** — vector graphics, momentum
15. **Pac-Man-lite** — BFS/A* for ghosts
16. **Solitaire / Blackjack** — card games
17. **Trivia / Quiz** — Open Trivia DB

### 2D Games — Multiplayer (after Phase 5)
18. **Tic-Tac-Toe online**
19. **Connect Four online**
20. **Chess** (chess.js + chessboard.js)
21. **Checkers**
22. **Pictionary / Skribbl clone** — real-time drawing + chat
23. **Codenames clone**
24. **Battleship** — turn-based, hidden state
25. **Kahoot-style quiz battle royale**

### 3D Games — Tier 1 (Beginner R3F, 3–7 days each)
26. **Ball Roller** — tilt the maze, get the ball to the goal
27. **Cube Stacker** — drop falling blocks to build a tower (3D Stack)
28. **Hole.io clone** — move a hole that swallows objects
29. **3D Whack-a-Mole** — moles in a 3D scene
30. **Voxel Painter** — build with cubes, save creations

### 3D Games — Tier 2 (Intermediate)
31. **Mini Golf** — putt with physics, multiple holes
32. **Bowling**
33. **Endless Runner** (Subway Surfers / Temple Run-lite) — 3 lanes, dodge obstacles
34. **Tower Defense** — 3D grid, place towers, waves of enemies
35. **First-person Maze** — escape room style with puzzles
36. **3D Snake** — snake on a plane or wrapped sphere
37. **Skateboard Trick Park** — physics-based stunts

### 3D Games — Tier 3 (Ambitious, multiplayer)
38. **Kart Racing** — multiplayer, lap timer, items
39. **Arena Shooter** (top-down or first-person, low-poly)
40. **Battle Royale-lite** — small map, last-player-standing
41. **Co-op Dungeon Crawler** — top-down 3D
42. **Among Us-style social deduction in 3D**

---

## 8. Recommended MVP Path

For maximum learning + a shippable demo at every step:

1. **Platform shell** + Clerk auth + Postgres → Week 1
2. **2048** (2D) + leaderboard → Week 2
3. **Wordle clone** + **Tic-Tac-Toe vs AI** → Week 3
4. **Ball Roller** (3D, R3F + Rapier) → Week 4–5
5. **Tic-Tac-Toe online** (Socket.IO, your first multiplayer) → Week 6
6. **3D Mini Golf** → Week 7–8

By the end you'll have: 3 single-player 2D games, 2 single-player 3D games, 1 real-time multiplayer game, and a polished platform shell.

---

## 9. Useful Libraries Cheat Sheet

| Need                     | Pick                                       |
| ------------------------ | ------------------------------------------ |
| 2D framework             | Phaser 3                                   |
| 2D rendering             | PixiJS or raw Canvas                       |
| 3D framework             | react-three-fiber + drei                   |
| 3D physics               | @react-three/rapier                        |
| Chess rules              | chess.js                                   |
| Chess UI                 | react-chessboard                           |
| Card games               | Use SVG sprites + your own state machine   |
| Real-time                | Socket.IO                                  |
| Auth                     | Clerk (fastest) or Auth.js                 |
| ORM                      | Prisma or Drizzle                          |
| Leaderboards (hot)       | Redis sorted sets (`ZADD`, `ZREVRANGE`)    |
| Animations / UI motion   | Framer Motion                              |
| Audio                    | Howler.js                                  |
| State (game-side)        | XState (for complex games) or Zustand      |
| Asset loader             | drei `useGLTF`, `useTexture`               |

---

## 10. Open Questions to Decide Early

- [ ] Single domain or per-game subdomains? (recommend single domain, route-based)
- [ ] Free-only or premium tier? (cosmetics, ad-free, tournaments)
- [ ] Mobile strategy — responsive web first, native later via Capacitor?
- [ ] Anti-cheat — server-authoritative for multiplayer; for single-player highscores, sign + sanity-check on submit
- [ ] Content moderation for chat / drawing games
- [ ] Asset license — only use CC0 / self-made / properly licensed assets

---

## 11. Next Step

When you're ready to start building, the very first commands will be:

```bash
pnpm dlx create-next-app@latest apps/web --ts --tailwind --app
pnpm add -w turbo
pnpm add -D prisma && pnpm dlx prisma init
```

Then we wire up Clerk, build the game library page, and ship 2048 as the first game.
