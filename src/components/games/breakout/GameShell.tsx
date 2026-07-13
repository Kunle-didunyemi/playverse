"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Play, RotateCcw } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Leaderboard from "@/components/games/Leaderboard";
import GameRulesModal from "@/components/games/GameRulesModal";
import { submitScore } from "@/lib/api";
import {
  BALL_R,
  BREAKOUT_GAME_ID,
  H,
  PADDLE_H,
  PADDLE_W,
  W,
} from "@/lib/games/breakout/engine";
import { useBreakout } from "@/lib/games/breakout/useBreakout";

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

export default function BreakoutGameShell() {
  const { state, bestScore, start, reset, movePaddleTo } = useBreakout();
  const { isSignedIn } = useUser();
  const submittedRef = useRef(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rulesOpen, setRulesOpen] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ended = state.phase === "won" || state.phase === "lost";
    if (!ended) {
      submittedRef.current = false;
      return;
    }
    if (!isSignedIn || submittedRef.current || state.score <= 0) return;
    submittedRef.current = true;
    submitScore(BREAKOUT_GAME_ID, state.score).then(() =>
      setRefreshKey((k) => k + 1),
    );
  }, [state.phase, state.score, isSignedIn]);

  const onPointer = (clientX: number) => {
    const el = boardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    movePaddleTo(clientX, rect.left, rect.width);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#08020f] px-4 py-6 pb-16">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Link
            href="/games"
            className="flex w-fit items-center gap-1.5 justify-self-start text-sm text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Games
          </Link>
          <h1 className="justify-self-center text-2xl font-bold text-white sm:text-3xl">
            Breakout
          </h1>
          <div className="flex items-center justify-end gap-2 justify-self-end">
            <button
              type="button"
              onClick={() => setRulesOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/10"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Rules
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/10"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              New
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap justify-center gap-2">
          <Stat label="Score" value={state.score} />
          <Stat label="Best" value={bestScore} />
          <Stat label="Lives" value={state.lives} />
        </div>
      </div>

      <div
        ref={boardRef}
        className="relative w-full max-w-[400px] touch-none overflow-hidden rounded-2xl ring-1 ring-white/10"
        style={{ aspectRatio: `${W} / ${H}` }}
        onPointerMove={(e) => onPointer(e.clientX)}
        onPointerDown={(e) => {
          onPointer(e.clientX);
          if (state.phase === "ready") start();
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full bg-[#0d0618]">
          {state.bricks.map(
            (b, i) =>
              b.alive && (
                <rect
                  key={i}
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={b.h}
                  rx={3}
                  fill={b.color}
                />
              ),
          )}
          <rect
            x={state.paddleX}
            y={H - 28}
            width={PADDLE_W}
            height={PADDLE_H}
            rx={6}
            fill="#e2e8f0"
          />
          <circle
            cx={state.ballX}
            cy={state.ballY}
            r={BALL_R}
            fill="#f472b6"
          />
        </svg>

        {state.phase === "ready" && state.vx === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/45">
            <button
              type="button"
              onClick={start}
              className="pointer-events-auto flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900"
            >
              <Play className="h-4 w-4 fill-current" />
              Launch ball
            </button>
            <p className="mt-3 text-xs text-zinc-400">
              ← → or drag to move · Space to launch
            </p>
          </div>
        )}

        {(state.phase === "won" || state.phase === "lost") && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 px-6 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-white">
              {state.phase === "won" ? "All clear!" : "Ball lost"}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">Score {state.score}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900"
            >
              Play again
            </button>
          </div>
        )}
      </div>

      <p className="mt-8 max-w-[400px] text-center text-xs text-zinc-500">
        Break every brick. Keep the pink ball alive with your paddle.
      </p>

      <GameRulesModal
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title="How to play · Breakout"
      >
        <ul className="list-disc space-y-2 pl-4 marker:text-pink-400">
          <li>
            Move the paddle with <strong className="text-zinc-200">← →</strong>,{" "}
            <strong className="text-zinc-200">A/D</strong>, or by dragging.
          </li>
          <li>
            Press <strong className="text-zinc-200">Space</strong> (or tap) to
            launch the ball.
          </li>
          <li>
            Clear all bricks to win. You have{" "}
            <strong className="text-zinc-200">3 lives</strong>.
          </li>
        </ul>
      </GameRulesModal>

      <div className="mt-8 w-full max-w-[400px]">
        <Leaderboard gameId={BREAKOUT_GAME_ID} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
