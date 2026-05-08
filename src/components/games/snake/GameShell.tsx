"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Play } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useSnake } from "@/lib/games/snake/useSnake";
import { useSwipe } from "@/lib/hooks/useSwipe";
import { submitScore } from "@/lib/api";
import Leaderboard from "@/components/games/Leaderboard";

const CANVAS_PX = 400;

function ScoreBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-[#1a1128] px-5 py-2.5 min-w-[90px]">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </span>
      <motion.span
        key={value}
        initial={{ scale: 1.3, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-xl font-bold text-white tabular-nums"
      >
        {value.toLocaleString()}
      </motion.span>
    </div>
  );
}

export default function SnakeGameShell() {
  const { canvasRef, state, bestScore, started, start, reset, handleDirection } =
    useSnake();
  const { onTouchStart, onTouchEnd } = useSwipe(handleDirection);
  const { isSignedIn } = useUser();
  const submittedRef = useRef(false);
  const refreshKeyRef = useRef(0);

  useEffect(() => {
    if (state.gameOver && state.score > 0 && isSignedIn && !submittedRef.current) {
      submittedRef.current = true;
      submitScore("snake", state.score).then(() => {
        refreshKeyRef.current += 1;
      });
    }
    if (!state.gameOver) {
      submittedRef.current = false;
    }
  }, [state.gameOver, state.score, isSignedIn]);

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#08020f] px-4 py-6">
      {/* Header */}
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/games"
            className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Games
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Snake
          </h1>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New
          </button>
        </div>

        <div className="mb-6 flex items-center justify-center gap-3">
          <ScoreBox label="Score" value={state.score} />
          <ScoreBox label="Best" value={bestScore} />
        </div>
      </div>

      {/* Canvas board */}
      <div
        className="relative mx-auto w-full max-w-[400px] aspect-square select-none touch-none rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#0d0618" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_PX}
          height={CANVAS_PX}
          className="h-full w-full"
          style={{ imageRendering: "pixelated" }}
        />

        {/* Start overlay */}
        <AnimatePresence>
          {!started && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <button
                onClick={start}
                className="group flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-zinc-900 shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <Play className="h-5 w-5 fill-zinc-900" />
                Start game
              </button>
              <p className="mt-4 text-xs text-zinc-400">
                Or press any arrow key
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game over overlay */}
        <AnimatePresence>
          {state.gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
            >
              <h2 className="mb-2 text-4xl font-bold text-white">
                Game Over
              </h2>
              <p className="mb-1 text-lg text-zinc-300">
                Score: {state.score.toLocaleString()}
              </p>
              {isSignedIn && (
                <p className="mb-5 text-xs text-emerald-400">
                  Score saved to leaderboard
                </p>
              )}
              {!isSignedIn && (
                <p className="mb-5 text-xs text-zinc-500">
                  Sign in to save your score
                </p>
              )}
              <button
                onClick={reset}
                className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <p className="mt-8 max-w-[400px] text-center text-xs text-zinc-500">
        Use arrow keys or swipe to steer the snake. Eat the pink food to grow.
        Don&apos;t hit the walls or yourself.
      </p>

      {/* Leaderboard */}
      <div className="mt-8">
        <Leaderboard gameId="snake" refreshKey={refreshKeyRef.current} />
      </div>

      {/* Mobile d-pad */}
      <div className="mt-6 grid grid-cols-3 gap-2 sm:hidden">
        <div />
        <button
          onPointerDown={() => { if (!started) start(); else handleDirection("up"); }}
          className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 text-white active:bg-white/15"
        >
          <span className="text-lg">&#9650;</span>
        </button>
        <div />
        <button
          onPointerDown={() => { if (!started) start(); else handleDirection("left"); }}
          className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 text-white active:bg-white/15"
        >
          <span className="text-lg">&#9664;</span>
        </button>
        <button
          onPointerDown={() => { if (!started) start(); else handleDirection("down"); }}
          className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 text-white active:bg-white/15"
        >
          <span className="text-lg">&#9660;</span>
        </button>
        <button
          onPointerDown={() => { if (!started) start(); else handleDirection("right"); }}
          className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 text-white active:bg-white/15"
        >
          <span className="text-lg">&#9654;</span>
        </button>
      </div>
    </div>
  );
}
