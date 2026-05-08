"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Play, RotateCcw } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useSnake } from "@/lib/games/snake/useSnake";
import { useSwipe } from "@/lib/hooks/useSwipe";
import { submitScore } from "@/lib/api";
import Leaderboard from "@/components/games/Leaderboard";
import GameRulesModal from "@/components/games/GameRulesModal";

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
  const [rulesOpen, setRulesOpen] = useState(false);

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
        <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Link
            href="/games"
            className="flex w-fit items-center gap-1.5 justify-self-start text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Games
          </Link>
          <h1 className="justify-self-center text-3xl font-bold tracking-tight text-white">
            Snake
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

      <GameRulesModal
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title="How to play · Snake"
      >
        <ul className="list-disc space-y-2 pl-4 marker:text-emerald-400">
          <li>
            Control the snake with{" "}
            <strong className="text-zinc-200">arrow keys</strong>,{" "}
            <strong className="text-zinc-200">swipes</strong> on the board, or
            the on-screen <strong className="text-zinc-200">D-pad</strong> on
            small screens.
          </li>
          <li>
            Press <strong className="text-zinc-200">Start game</strong> (or any
            arrow) to begin a run.
          </li>
          <li>
            Move onto the <strong className="text-zinc-200">food</strong> to
            eat it: you grow longer and your{" "}
            <strong className="text-zinc-200">score</strong> increases.
          </li>
          <li>
            If your head hits a{" "}
            <strong className="text-zinc-200">wall</strong> or your own{" "}
            <strong className="text-zinc-200">body</strong>, the game ends.
          </li>
          <li>
            <strong className="text-zinc-200">New</strong> restarts from a
            fresh snake and score (your session best is tracked separately).
          </li>
        </ul>
      </GameRulesModal>

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
