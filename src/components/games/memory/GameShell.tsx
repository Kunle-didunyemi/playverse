"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Play, RotateCcw } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Leaderboard from "@/components/games/Leaderboard";
import GameRulesModal from "@/components/games/GameRulesModal";
import { submitScore } from "@/lib/api";
import { COLS, MEMORY_GAME_ID, PAIR_COUNT } from "@/lib/games/memory/engine";
import { useMemory } from "@/lib/games/memory/useMemory";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex min-w-[72px] flex-col items-center rounded-xl bg-[#1a1128] px-3 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      <span className="text-base font-bold tabular-nums text-white">{value}</span>
    </div>
  );
}

export default function MemoryGameShell() {
  const { state, bestScore, start, reset, onCardClick } = useMemory();
  const { isSignedIn } = useUser();
  const submittedRef = useRef(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rulesOpen, setRulesOpen] = useState(false);

  useEffect(() => {
    if (state.phase !== "won") {
      submittedRef.current = false;
      return;
    }
    if (!isSignedIn || submittedRef.current || state.score <= 0) return;
    submittedRef.current = true;
    submitScore(MEMORY_GAME_ID, state.score).then(() =>
      setRefreshKey((k) => k + 1),
    );
  }, [state.phase, state.score, isSignedIn]);

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#08020f] px-4 py-6 pb-16">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Link
            href="/games"
            className="flex w-fit items-center gap-1.5 justify-self-start text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Games
          </Link>
          <h1 className="justify-self-center text-2xl font-bold text-white sm:text-3xl">
            Memory
          </h1>
          <div className="flex items-center justify-end gap-2 justify-self-end">
            <button
              type="button"
              onClick={() => setRulesOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Rules
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              New
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap justify-center gap-2">
          <Stat label="Score" value={state.score} />
          <Stat label="Best" value={bestScore} />
          <Stat label="Moves" value={state.moves} />
          <Stat label="Pairs" value={`${state.matches}/${PAIR_COUNT}`} />
        </div>
      </div>

      <div className="relative w-full max-w-[400px]">
        <div
          className="grid gap-2.5 rounded-2xl bg-[#12081f] p-3 ring-1 ring-white/10"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {state.cards.map((card, i) => {
            const show =
              card.matched || state.flipped.includes(i) || state.phase === "ready";
            return (
              <button
                key={card.id}
                type="button"
                disabled={
                  state.phase !== "playing" ||
                  state.locked ||
                  card.matched ||
                  state.flipped.includes(i)
                }
                onClick={() => onCardClick(i)}
                className={`flex aspect-square items-center justify-center rounded-xl text-2xl font-black transition-all sm:text-3xl ${
                  show
                    ? card.matched
                      ? "bg-emerald-500/25 text-emerald-200 ring-1 ring-emerald-400/40"
                      : "bg-[#2a1f45] text-cyan-200"
                    : "bg-[#1a1128] text-transparent hover:bg-[#231733] active:scale-[0.97]"
                }`}
              >
                {show ? card.symbol : "?"}
              </button>
            );
          })}
        </div>

        {state.phase === "ready" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-black/70 backdrop-blur-sm">
            <button
              type="button"
              onClick={start}
              className="flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-zinc-900 shadow-lg hover:-translate-y-0.5"
            >
              <Play className="h-4 w-4 fill-current" />
              Start match
            </button>
            <p className="mt-3 max-w-[240px] text-center text-xs text-zinc-400">
              Flip two cards at a time. Match all {PAIR_COUNT} pairs in as few
              moves as you can.
            </p>
          </div>
        )}

        {state.phase === "won" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-black/75 backdrop-blur-sm px-6">
            <h2 className="text-3xl font-bold text-white">Board cleared!</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {state.moves} moves · Score {state.score}
            </p>
            {isSignedIn ? (
              <p className="mt-2 text-xs text-emerald-400">Saved to leaderboard</p>
            ) : (
              <p className="mt-2 text-xs text-zinc-500">Sign in to save scores</p>
            )}
            <button
              type="button"
              onClick={start}
              className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900"
            >
              Play again
            </button>
          </div>
        )}
      </div>

      <p className="mt-8 max-w-[400px] text-center text-xs text-zinc-500">
        Classic memory pairs. Fewer moves earn a higher score.
      </p>

      <GameRulesModal
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title="How to play · Memory"
      >
        <ul className="list-disc space-y-2 pl-4 marker:text-cyan-400">
          <li>
            The board has <strong className="text-zinc-200">{PAIR_COUNT} pairs</strong>{" "}
            of matching symbols, face down.
          </li>
          <li>
            Flip <strong className="text-zinc-200">two cards</strong> per turn.
            Matching pairs stay revealed.
          </li>
          <li>
            Clear the board in as few moves as possible for a higher score.
          </li>
        </ul>
      </GameRulesModal>

      <div className="mt-8 w-full max-w-[400px]">
        <Leaderboard gameId={MEMORY_GAME_ID} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
