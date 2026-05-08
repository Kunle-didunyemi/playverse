import { EXTRA_GUESSES, SOLUTION_WORDS } from "./words-data";

const VALID_WORD_SET = new Set<string>();

for (const w of SOLUTION_WORDS) {
  VALID_WORD_SET.add(w.toUpperCase());
}
for (const w of EXTRA_GUESSES) {
  VALID_WORD_SET.add(w.toUpperCase());
}

export function isValidWord(word: string): boolean {
  return VALID_WORD_SET.has(word.toUpperCase());
}

export function solutionCount(): number {
  return SOLUTION_WORDS.length;
}
