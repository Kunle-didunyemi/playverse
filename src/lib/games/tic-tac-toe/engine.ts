export type Cell = "X" | "O" | null;
export type Outcome = "X" | "O" | "draw";
export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTIES: readonly Difficulty[] = [
  "easy",
  "medium",
  "hard",
] as const;

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export const DIFFICULTY_BLURBS: Record<Difficulty, string> = {
  easy: "Mostly casual moves — great for warming up.",
  medium: "Solid play with occasional mistakes.",
  hard: "Full minimax — optimal defense.",
};

/** Chance the AI ignores the optimal move and plays randomly instead. */
const RANDOM_MOVE_CHANCE: Record<Difficulty, number> = {
  easy: 0.72,
  medium: 0.32,
  hard: 0,
};

export const WIN_LINES: readonly number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function emptyBoard(): Cell[] {
  return Array.from({ length: 9 }, () => null);
}

/** Winner X/O, draw when board full, or null if play continues */
export function getOutcome(board: readonly Cell[]): Outcome | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    const v = board[a];
    if (v !== null && v === board[b] && v === board[c]) {
      return v;
    }
  }
  if (board.every((c) => c !== null)) return "draw";
  return null;
}

/** Score from AI (O) perspective: positive favors O */
function minimax(board: Cell[], depth: number, aiTurn: boolean): number {
  const terminal = getOutcome(board);
  if (terminal === "O") return 10 - depth;
  if (terminal === "X") return depth - 10;
  if (terminal === "draw") return 0;

  if (aiTurn) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] !== null) continue;
      board[i] = "O";
      const score = minimax(board, depth + 1, false);
      board[i] = null;
      best = Math.max(best, score);
    }
    return best;
  }

  let best = Infinity;
  for (let i = 0; i < 9; i++) {
    if (board[i] !== null) continue;
    board[i] = "X";
    const score = minimax(board, depth + 1, true);
    board[i] = null;
    best = Math.min(best, score);
  }
  return best;
}

function emptyIndices(board: readonly Cell[]): number[] {
  const empties: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) empties.push(i);
  }
  return empties;
}

function pickRandom(indices: number[]): number {
  return indices[Math.floor(Math.random() * indices.length)]!;
}

/**
 * AI move for player O vs human X.
 * Hard = optimal minimax. Medium/Easy sometimes pick a random legal move.
 */
export function pickAiMove(
  board: readonly Cell[],
  difficulty: Difficulty = "hard",
): number | null {
  const empties = emptyIndices(board);
  if (empties.length === 0) return null;

  if (Math.random() < RANDOM_MOVE_CHANCE[difficulty]) {
    return pickRandom(empties);
  }

  let bestScore = -Infinity;
  const candidates: number[] = [];
  const scratch = [...board] as Cell[];

  for (const i of empties) {
    scratch[i] = "O";
    const score = minimax(scratch, 0, false);
    scratch[i] = null;
    if (score > bestScore) {
      bestScore = score;
      candidates.length = 0;
      candidates.push(i);
    } else if (score === bestScore) {
      candidates.push(i);
    }
  }

  return pickRandom(candidates);
}

export function leaderboardPoints(
  outcome: Outcome,
  difficulty: Difficulty = "hard",
): number {
  const scale =
    difficulty === "easy" ? 0.45 : difficulty === "medium" ? 0.7 : 1;
  const base = outcome === "X" ? 320 : outcome === "draw" ? 140 : 60;
  return Math.max(10, Math.round(base * scale));
}

export function winningLineIndices(
  board: readonly Cell[],
  winner: "X" | "O",
): number[] | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (
      board[a] === winner &&
      board[b] === winner &&
      board[c] === winner
    ) {
      return [a, b, c];
    }
  }
  return null;
}

export const TIC_TAC_TOE_GAME_ID = "tic-tac-toe" as const;
