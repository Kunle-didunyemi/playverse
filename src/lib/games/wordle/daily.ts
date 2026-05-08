import { SOLUTION_WORDS } from "./words-data";

/** UTC calendar days since Unix epoch (stable daily boundary). */
export function utcDayIndex(d = new Date()): number {
  return Math.floor(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) /
      86_400_000,
  );
}

/** Deterministic pick — same calendar UTC day → same word for everyone */
export function pickDailySolution(dayIndex = utcDayIndex()): string {
  const list = SOLUTION_WORDS;
  let x = Math.imul(dayIndex ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  const idx = Math.abs(x) % list.length;
  return list[idx].toUpperCase();
}

/** Random answer for practice; never returns `exclude` when other options exist. */
export function pickRandomPracticeSolution(exclude: string): string {
  const excludeU = exclude.toUpperCase();
  const pool = SOLUTION_WORDS.filter((w) => w.toUpperCase() !== excludeU);
  const list = pool.length > 0 ? pool : SOLUTION_WORDS;
  const idx = Math.floor(Math.random() * list.length);
  return list[idx].toUpperCase();
}
