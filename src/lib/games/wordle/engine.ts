export type LetterResult = "correct" | "present" | "absent";

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

/** Classic Wordle scoring: greens first, then yellows with leftover letter counts */
export function scoreGuess(answer: string, guess: string): LetterResult[] {
  const a = answer.toUpperCase();
  const g = guess.toUpperCase();
  const result: LetterResult[] = Array.from({ length: WORD_LENGTH }, () => "absent");
  const avail = new Map<string, number>();

  for (const ch of a) {
    avail.set(ch, (avail.get(ch) ?? 0) + 1);
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (g[i] === a[i]) {
      result[i] = "correct";
      const k = g[i];
      avail.set(k, (avail.get(k) ?? 0) - 1);
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue;
    const ch = g[i];
    const left = avail.get(ch) ?? 0;
    if (left > 0) {
      result[i] = "present";
      avail.set(ch, left - 1);
    }
  }

  return result;
}

export function betterLetterResult(
  a: LetterResult | undefined,
  b: LetterResult,
): LetterResult {
  const rank: Record<LetterResult, number> = {
    correct: 3,
    present: 2,
    absent: 1,
  };
  if (!a) return b;
  return rank[b] > rank[a] ? b : a;
}

export function leaderboardScoreWin(rowIndexZeroBased: number): number {
  return 920 - rowIndexZeroBased * 130;
}

export const WORDLE_LOSS_POINTS = 70;

export const WORDLE_GAME_ID = "wordle" as const;
