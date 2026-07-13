"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, RotateCcw } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Leaderboard from "@/components/games/Leaderboard";
import GameRulesModal from "@/components/games/GameRulesModal";
import { submitScore } from "@/lib/api";
import {
  DIFFICULTIES,
  DIFFICULTY_BLURBS,
  DIFFICULTY_LABELS,
  leaderboardPoints,
  winningLineIndices,
  TIC_TAC_TOE_GAME_ID,
  type Difficulty,
} from "@/lib/games/tic-tac-toe/engine";
import { useTicTacToe } from "@/lib/games/tic-tac-toe/useTicTacToe";

function pillClass(active: boolean) {
  return active
    ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/35"
    : "bg-white/5 text-zinc-500";
}

function difficultyAccent(d: Difficulty): string {
  if (d === "easy") return "hover:border-emerald-400/50 hover:bg-emerald-500/10";
  if (d === "medium") return "hover:border-amber-400/50 hover:bg-amber-500/10";
  return "hover:border-rose-400/50 hover:bg-rose-500/10";
}

export default function TicTacToeGameShell() {
  const { difficulty, board, outcome, aiThinking, playHumanCell, start, reset } =
    useTicTacToe();
  const { isSignedIn } = useUser();
  const submittedRef = useRef(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rulesOpen, setRulesOpen] = useState(false);

  const highlight = useMemo(() => {
    if (outcome === "X" || outcome === "O") {
      return new Set(winningLineIndices(board, outcome) ?? []);
    }
    return null;
  }, [board, outcome]);

  useEffect(() => {
    if (outcome === null) {
      submittedRef.current = false;
      return;
    }
    if (!isSignedIn || submittedRef.current || !difficulty) return;
    submittedRef.current = true;
    submitScore(
      TIC_TAC_TOE_GAME_ID,
      leaderboardPoints(outcome, difficulty),
    ).then(() => {
      setRefreshKey((k) => k + 1);
    });
  }, [outcome, isSignedIn, difficulty]);

  const headline =
    difficulty === null
      ? "Pick a difficulty to start"
      : outcome === null
        ? aiThinking
          ? "AI is thinking…"
          : "Your move — you are X"
        : outcome === "X"
          ? "You win!"
          : outcome === "O"
            ? "AI wins"
            : "Draw";

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#08020f] px-4 py-6 pb-16">
      <div className="w-full max-w-[400px]">
        <Link
          href="/games"
          className="mb-4 flex w-fit items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white sm:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Games
        </Link>
        <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Link
            href="/games"
            className="hidden w-fit items-center gap-1.5 justify-self-start text-sm text-zinc-400 transition-colors hover:text-white sm:flex"
          >
            <ArrowLeft className="h-4 w-4" />
            Games
          </Link>
          <h1 className="justify-self-center text-center text-2xl font-bold tracking-tight text-white whitespace-nowrap sm:text-3xl">
            Tic-Tac-Toe
          </h1>
          <div className="flex items-center justify-end gap-2 justify-self-end">
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
              onClick={reset}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              New
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap justify-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${pillClass(outcome === "X")}`}
          >
            X — You
          </span>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${pillClass(outcome === "O")}`}
          >
            O — AI
            {difficulty ? ` · ${DIFFICULTY_LABELS[difficulty]}` : ""}
          </span>
        </div>

        <p className="mb-6 text-center text-sm text-zinc-400">{headline}</p>
      </div>

      <div className="relative w-full max-w-[340px] select-none">
        <div
          className={`grid grid-cols-3 gap-2 rounded-2xl bg-[#12081f] p-3 ring-1 ring-white/10 ${aiThinking || outcome !== null || difficulty === null ? "opacity-90" : ""}`}
          aria-busy={aiThinking}
        >
          {board.map((cell, i) => {
            const winCell = highlight?.has(i) ?? false;
            const canPlay =
              difficulty !== null &&
              cell === null &&
              outcome === null &&
              !aiThinking;
            return (
              <button
                key={i}
                type="button"
                disabled={!canPlay}
                onClick={() => playHumanCell(i)}
                className={`flex aspect-square items-center justify-center rounded-xl text-4xl font-black transition-colors sm:text-5xl ${
                  winCell
                    ? "bg-emerald-500/25 ring-2 ring-emerald-400/60 text-white"
                    : "bg-[#1a1128] text-white hover:bg-[#231733]"
                } ${canPlay ? "cursor-pointer active:scale-[0.97]" : "cursor-default"}`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {cell !== null && (
                    <motion.span
                      key={`${i}-${cell}`}
                      initial={{ scale: 0.35, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.35, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 22,
                      }}
                      className={
                        cell === "X"
                          ? "text-cyan-300 drop-shadow-[0_0_12px_rgba(103,232,249,0.35)]"
                          : "text-violet-300 drop-shadow-[0_0_12px_rgba(167,139,250,0.35)]"
                      }
                    >
                      {cell}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {difficulty === null && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-2xl bg-black/78 px-5 backdrop-blur-sm">
              <h2 className="mb-1 text-2xl font-bold text-white">Difficulty</h2>
              <p className="mb-5 text-center text-xs text-zinc-400">
                Choose how strong the AI should play
              </p>
              <div className="flex w-full flex-col gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => start(d)}
                    className={`rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-colors ${difficultyAccent(d)}`}
                  >
                    <span className="block text-sm font-semibold text-white">
                      {DIFFICULTY_LABELS[d]}
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-400">
                      {DIFFICULTY_BLURBS[d]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {outcome !== null && difficulty !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-2xl bg-black/72 px-5 backdrop-blur-sm"
            >
              <h2 className="mb-2 text-3xl font-bold text-white">
                {outcome === "X"
                  ? "Nice one!"
                  : outcome === "O"
                    ? "AI takes this round"
                    : "Even match"}
              </h2>
              <p className="mb-1 text-center text-sm text-zinc-300">
                {outcome === "draw"
                  ? `Draw on ${DIFFICULTY_LABELS[difficulty]}.`
                  : outcome === "X"
                    ? `You beat ${DIFFICULTY_LABELS[difficulty]} AI.`
                    : `${DIFFICULTY_LABELS[difficulty]} AI wins this round.`}
              </p>
              <p className="mb-5 text-xs text-zinc-500">
                Leaderboard points:{" "}
                <span className="font-semibold tabular-nums text-zinc-300">
                  {leaderboardPoints(outcome, difficulty)}
                </span>
              </p>
              {isSignedIn && (
                <p className="mb-4 text-xs text-emerald-400">
                  Score saved to leaderboard
                </p>
              )}
              {!isSignedIn && (
                <p className="mb-4 text-xs text-zinc-500">
                  Sign in to save your score
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => start(difficulty)}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow-lg transition-transform hover:-translate-y-0.5"
                >
                  Play again
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/15"
                >
                  Change difficulty
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-8 max-w-[400px] text-center text-xs leading-relaxed text-zinc-500">
        You play <strong className="text-zinc-400">X</strong> and move first.
        Pick <strong className="text-zinc-400">Easy</strong>,{" "}
        <strong className="text-zinc-400">Medium</strong>, or{" "}
        <strong className="text-zinc-400">Hard</strong> before each match. Hard
        uses full minimax; easier modes make more random mistakes. Harder wins
        score more on the leaderboard.
      </p>

      <GameRulesModal
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title="How to play · Tic-Tac-Toe"
      >
        <ul className="list-disc space-y-2 pl-4 marker:text-cyan-400">
          <li>
            Choose a <strong className="text-zinc-200">difficulty</strong>{" "}
            before the round starts: Easy, Medium, or Hard.
          </li>
          <li>
            The board is <strong className="text-zinc-200">3×3</strong>. You
            are <strong className="text-zinc-200">X</strong> and always{" "}
            <strong className="text-zinc-200">move first</strong>; the computer
            plays <strong className="text-zinc-200">O</strong>.
          </li>
          <li>
            Tap an <strong className="text-zinc-200">empty cell</strong> to
            place your mark. You cannot move after the AI starts thinking or
            once the round ends.
          </li>
          <li>
            Get <strong className="text-zinc-200">three X&apos;s in a row</strong>{" "}
            horizontally, vertically, or diagonally to win.
          </li>
          <li>
            <strong className="text-zinc-200">Hard</strong> uses optimal
            minimax. <strong className="text-zinc-200">Medium</strong> and{" "}
            <strong className="text-zinc-200">Easy</strong> sometimes play
            random moves so you can win more often.
          </li>
          <li>
            <strong className="text-zinc-200">New</strong> returns to the
            difficulty picker. Points scale with difficulty.
          </li>
        </ul>
      </GameRulesModal>

      <div className="mt-8 w-full max-w-[400px]">
        <Leaderboard gameId={TIC_TAC_TOE_GAME_ID} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
