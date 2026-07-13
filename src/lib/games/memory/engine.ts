export const MEMORY_GAME_ID = "memory" as const;

export const COLS = 4;
export const ROWS = 4;
export const PAIR_COUNT = (COLS * ROWS) / 2;
export const FLIP_BACK_MS = 650;

export const SYMBOLS = [
  "◆",
  "●",
  "▲",
  "★",
  "■",
  "✦",
  "◈",
  "❖",
] as const;

export type Card = {
  id: number;
  symbol: string;
  matched: boolean;
};

export type MemoryPhase = "ready" | "playing" | "won";

export type MemoryState = {
  cards: Card[];
  flipped: number[];
  moves: number;
  matches: number;
  phase: MemoryPhase;
  score: number;
  locked: boolean;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function createDeck(): Card[] {
  const symbols = SYMBOLS.slice(0, PAIR_COUNT);
  const doubled = [...symbols, ...symbols];
  return shuffle(doubled).map((symbol, id) => ({
    id,
    symbol,
    matched: false,
  }));
}

export function createInitialState(): MemoryState {
  return {
    cards: createDeck(),
    flipped: [],
    moves: 0,
    matches: 0,
    phase: "ready",
    score: 0,
    locked: false,
  };
}

export function startGame(): MemoryState {
  return {
    ...createInitialState(),
    phase: "playing",
  };
}

/** Points: faster + fewer moves = higher score. */
export function finalScore(moves: number): number {
  const base = 800;
  const penalty = Math.max(0, moves - PAIR_COUNT) * 18;
  return Math.max(50, base - penalty);
}

export function flipCard(state: MemoryState, index: number): MemoryState {
  if (state.phase !== "playing" || state.locked) return state;
  const card = state.cards[index];
  if (!card || card.matched) return state;
  if (state.flipped.includes(index)) return state;
  if (state.flipped.length >= 2) return state;

  const flipped = [...state.flipped, index];
  return { ...state, flipped };
}

export function resolveFlip(state: MemoryState): MemoryState {
  if (state.flipped.length !== 2) return state;
  const [a, b] = state.flipped;
  const ca = state.cards[a!];
  const cb = state.cards[b!];
  if (!ca || !cb) return { ...state, flipped: [], locked: false };

  const moves = state.moves + 1;
  if (ca.symbol === cb.symbol) {
    const cards = state.cards.map((c, i) =>
      i === a || i === b ? { ...c, matched: true } : c,
    );
    const matches = state.matches + 1;
    const won = matches >= PAIR_COUNT;
    const score = won ? finalScore(moves) : state.score;
    return {
      ...state,
      cards,
      flipped: [],
      moves,
      matches,
      locked: false,
      score,
      phase: won ? "won" : "playing",
    };
  }

  return {
    ...state,
    flipped: [],
    moves,
    locked: false,
  };
}

export function lockBoard(state: MemoryState): MemoryState {
  return { ...state, locked: true };
}
