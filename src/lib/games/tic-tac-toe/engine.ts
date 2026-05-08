export type Cell = "X" | "O" | null;
export type Outcome = "X" | "O" | "draw";

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

/**
 * Optimal AI move for player O vs human X.
 * Among ties at best minimax value, picks uniformly — variation without weakening play.
 */
export function pickAiMove(board: readonly Cell[]): number | null {
  const empties: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) empties.push(i);
  }
  if (empties.length === 0) return null;

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

  return candidates[Math.floor(Math.random() * candidates.length)]!;
}

export function leaderboardPoints(outcome: Outcome): number {
  if (outcome === "X") return 320;
  if (outcome === "draw") return 140;
  return 60;
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
