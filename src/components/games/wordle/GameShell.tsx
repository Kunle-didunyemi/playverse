"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import Leaderboard from "@/components/games/Leaderboard";
import GameRulesModal from "@/components/games/GameRulesModal";
import { submitScore } from "@/lib/api";
import {
  leaderboardScoreWin,
  MAX_GUESSES,
  WORDLE_GAME_ID,
  WORDLE_LOSS_POINTS,
  WORD_LENGTH,
  type LetterResult,
} from "@/lib/games/wordle/engine";
import { utcDayIndex } from "@/lib/games/wordle/daily";
import { useWordle } from "@/lib/games/wordle/useWordle";

const KB_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"] as const;

/** Local testing: `next dev`, or `.env.local`: NEXT_PUBLIC_WORDLE_DEV_REVEAL=true (omit in real prod). */
const SHOW_DEV_SOLUTION =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_WORDLE_DEV_REVEAL === "true";

function tileClasses(state: LetterResult | "empty" | "typing"): string {
  switch (state) {
    case "correct":
      return "border-emerald-600 bg-emerald-600 text-white shadow-[inset_0_-3px_0_rgba(0,0,0,0.2)]";
    case "present":
      return "border-amber-500 bg-amber-500 text-white shadow-[inset_0_-3px_0_rgba(0,0,0,0.2)]";
    case "absent":
      return "border-zinc-600 bg-zinc-700 text-zinc-100";
    case "typing":
      return "border-zinc-500 bg-transparent text-white";
    default:
      return "border-zinc-700 bg-[#251d3a]/90 text-transparent";
  }
}

function keyCapClasses(hint?: LetterResult): string {
  const base =
    "relative flex min-h-11 min-w-[2.1rem] flex-1 items-center justify-center rounded-lg text-sm font-bold uppercase tracking-wide transition-colors sm:min-h-12 sm:min-w-[2.35rem] sm:text-[15px]";
  if (!hint) return `${base} bg-[#2e2548] text-white hover:bg-[#3a3058] active:scale-[0.96]`;
  if (hint === "correct")
    return `${base} bg-emerald-600 text-white hover:bg-emerald-500`;
  if (hint === "present")
    return `${base} bg-amber-600 text-white hover:bg-amber-500`;
  return `${base} bg-zinc-700 text-zinc-200 hover:bg-zinc-600`;
}

export default function WordleGameShell() {
  const {
    solution,
    rows,
    draft,
    phase,
    shakeRow,
    keyHints,
    onKey,
    resetRound,
    newPracticeRound,
  } = useWordle();

  const { isSignedIn } = useUser();
  const submittedRef = useRef(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rulesOpen, setRulesOpen] = useState(false);

  const puzzleNum = utcDayIndex();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase !== "playing") return;
      const el = e.target as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      ) {
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        onKey("ENTER");
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        onKey("BACKSPACE");
        return;
      }
      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        onKey(e.key);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onKey, phase]);

  useEffect(() => {
    if (phase === "playing") {
      submittedRef.current = false;
      return;
    }
    if (!isSignedIn || submittedRef.current) return;
    submittedRef.current = true;
    const value =
      phase === "won"
        ? leaderboardScoreWin(rows.length - 1)
        : WORDLE_LOSS_POINTS;
    submitScore(WORDLE_GAME_ID, value).then(() =>
      setRefreshKey((k) => k + 1),
    );
  }, [phase, rows.length, isSignedIn]);

  const activeRow = rows.length;

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#08020f] px-4 py-6 pb-16">
      <div className="w-full max-w-[420px]">
        <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-start gap-2">
          <Link
            href="/games"
            className="flex w-fit items-center gap-1.5 justify-self-start pt-1 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Games
          </Link>
          <div className="justify-self-center text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Wordle
            </h1>
            <p className="mt-0.5 text-[11px] uppercase tracking-widest text-zinc-500">
              Daily #{puzzleNum.toLocaleString()} · UTC
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 justify-self-end pt-1">
            <button
              type="button"
              onClick={() => setRulesOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              Rules
            </button>
            <button
              type="button"
              onClick={resetRound}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {SHOW_DEV_SOLUTION && (
        <div
          className="mb-4 w-full max-w-[420px] rounded-xl border border-amber-500/35 bg-amber-950/35 px-4 py-3 text-center"
          aria-label="Developer-only answer reveal"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">
            Builder preview — today&apos;s word
          </p>
          <p className="mt-2 select-all font-mono text-lg font-bold tracking-[0.35em] text-amber-50">
            {solution}
          </p>
          <p className="mt-2 text-[11px] leading-snug text-zinc-500">
            Visible because you are in development (
            <span className="text-zinc-400">npm run dev</span>) or you set{" "}
            <span className="font-mono text-zinc-400">
              NEXT_PUBLIC_WORDLE_DEV_REVEAL=true
            </span>
            . Production builds hide this unless that flag is set.
          </p>
        </div>
      )}

      <motion.div
        animate={shakeRow ? { x: [0, -7, 7, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-8 grid w-full max-w-[350px] gap-2 sm:max-w-[380px]"
      >
        {Array.from({ length: MAX_GUESSES }).map((_, ri) => {
          const row = rows[ri];
          const isTypingRow = ri === activeRow && phase === "playing";

          return (
            <div
              key={ri}
              className="grid grid-cols-5 gap-2"
              aria-label={isTypingRow ? "Current guess" : undefined}
            >
              {Array.from({ length: WORD_LENGTH }).map((__, ci) => {
                let letter = "";
                let visual: LetterResult | "empty" | "typing" = "empty";

                if (row) {
                  letter = row.guess[ci] ?? "";
                  visual = row.scores[ci];
                } else if (isTypingRow) {
                  letter = draft[ci] ?? "";
                  visual = letter ? "typing" : "empty";
                }

                return (
                  <div
                    key={ci}
                    className={`flex aspect-square items-center justify-center rounded-xl border-2 text-3xl font-black uppercase sm:text-[34px] ${tileClasses(visual)}`}
                  >
                    {letter || "\u00a0"}
                  </div>
                );
              })}
            </div>
          );
        })}
      </motion.div>

      <div className="w-full max-w-[520px] space-y-2 px-1">
        {KB_ROWS.map((row, ri) => (
          <div key={row} className="flex w-full justify-center gap-[6px]">
            {ri === 2 && (
              <button
                type="button"
                className="mr-1 flex min-h-11 min-w-[52px] items-center justify-center rounded-lg bg-[#2e2548] px-2 text-[11px] font-bold uppercase text-white hover:bg-[#3a3058] active:scale-[0.96] sm:min-h-12 sm:min-w-[62px] sm:text-xs"
                onClick={() => onKey("ENTER")}
              >
                Enter
              </button>
            )}
            {row.split("").map((ch) => (
              <button
                key={ch}
                type="button"
                className={keyCapClasses(keyHints[ch])}
                onClick={() => onKey(ch)}
              >
                {ch}
              </button>
            ))}
            {ri === 2 && (
              <button
                type="button"
                aria-label="Backspace"
                className="ml-1 flex min-h-11 min-w-[52px] items-center justify-center rounded-lg bg-[#2e2548] px-2 text-[11px] font-bold uppercase text-white hover:bg-[#3a3058] active:scale-[0.96] sm:min-h-12 sm:min-w-[62px] sm:text-xs"
                onClick={() => onKey("BACKSPACE")}
              >
                ⌫
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="mt-8 max-w-[420px] text-center text-xs leading-relaxed text-zinc-500">
        Guess the five-letter word in six tries. Green = correct spot, yellow =
        wrong spot but in the word, gray = not in the word. Everyone gets the
        same secret word each UTC calendar day. Keyboard shortcuts supported.
      </p>

      <GameRulesModal
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title="How to play · Wordle"
      >
        <ul className="list-disc space-y-2 pl-4 marker:text-amber-400">
          <li>
            You have <strong className="text-zinc-200">six guesses</strong> to
            find the hidden{" "}
            <strong className="text-zinc-200">five-letter word</strong>.
          </li>
          <li>
            Each guess must be a real word from the game dictionary. Press{" "}
            <strong className="text-zinc-200">Enter</strong> to submit;{" "}
            <strong className="text-zinc-200">Backspace</strong> removes the
            last letter.
          </li>
          <li>
            After each guess, tiles update:{" "}
            <strong className="text-emerald-300">Green</strong> — correct
            letter and spot;{" "}
            <strong className="text-amber-300">Yellow</strong> — letter appears
            elsewhere in the word;{" "}
            <strong className="text-zinc-300">Gray</strong> — letter is not in
            the word (for that guess&apos;s evaluation).
          </li>
          <li>
            Repeated letters follow Wordle rules: each yellow/green uses up a
            matching letter from the answer until none are left for extra copies
            in your guess.
          </li>
          <li>
            The daily answer is the same for every player and switches at{" "}
            <strong className="text-zinc-200">UTC midnight</strong>.{" "}
            <strong className="text-zinc-200">Reset</strong> clears your grid
            so you can practice the same puzzle again.
          </li>
        </ul>
      </GameRulesModal>

      <AnimatePresence>
        {phase !== "playing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 px-6 backdrop-blur-sm"
          >
            <div className="max-w-sm rounded-2xl border border-white/10 bg-[#12081f] p-8 text-center shadow-2xl ring-1 ring-white/10">
              <h2 className="text-3xl font-bold text-white">
                {phase === "won" ? "Splendid!" : "Nice try"}
              </h2>
              <p className="mt-3 text-sm text-zinc-400">
                {phase === "won"
                  ? `You solved it in ${rows.length} guess${rows.length === 1 ? "" : "es"}.`
                  : `The word was ${solution}.`}
              </p>
              <p className="mt-4 text-xs text-zinc-500">
                Score submitted:{" "}
                <span className="font-semibold tabular-nums text-zinc-300">
                  {phase === "won"
                    ? leaderboardScoreWin(rows.length - 1)
                    : WORDLE_LOSS_POINTS}
                </span>
              </p>
              {isSignedIn ? (
                <p className="mt-2 text-xs text-emerald-400">
                  Saved to leaderboard
                </p>
              ) : (
                <p className="mt-2 text-xs text-zinc-500">
                  Sign in to save scores
                </p>
              )}
              <button
                type="button"
                onClick={newPracticeRound}
                className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Play again (practice)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-10 w-full max-w-[400px]">
        <Leaderboard gameId={WORDLE_GAME_ID} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
