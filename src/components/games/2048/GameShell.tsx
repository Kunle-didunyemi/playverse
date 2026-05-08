"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Board from "./Board";
import Leaderboard from "@/components/games/Leaderboard";
import { use2048 } from "@/lib/games/2048/use2048";
import { useSwipe } from "@/lib/hooks/useSwipe";
import { submitScore } from "@/lib/api";

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

export default function GameShell() {
  const { tiles, score, bestScore, gameOver, won, move, reset, keepPlaying } =
    use2048();
  const { onTouchStart, onTouchEnd } = useSwipe(move);
  const { isSignedIn } = useUser();
  const submittedRef = useRef(false);
  const refreshKeyRef = useRef(0);

  useEffect(() => {
    if (gameOver && score > 0 && isSignedIn && !submittedRef.current) {
      submittedRef.current = true;
      submitScore("2048", score).then(() => {
        refreshKeyRef.current += 1;
      });
    }
    if (!gameOver) {
      submittedRef.current = false;
    }
  }, [gameOver, score, isSignedIn]);

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
            2048
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
          <ScoreBox label="Score" value={score} />
          <ScoreBox label="Best" value={bestScore} />
        </div>
      </div>

      {/* Board */}
      <div className="relative w-full max-w-[400px]">
        <Board
          tiles={tiles}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        />

        {/* Game over overlay */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-2xl bg-black/70 backdrop-blur-sm"
            >
              <h2 className="mb-2 text-4xl font-bold text-white">
                Game Over
              </h2>
              <p className="mb-1 text-lg text-zinc-300">
                Score: {score.toLocaleString()}
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

        {/* Win overlay */}
        <AnimatePresence>
          {won && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-2xl bg-black/70 backdrop-blur-sm"
            >
              <h2 className="mb-2 text-4xl font-bold text-amber-300">
                You win!
              </h2>
              <p className="mb-6 text-lg text-zinc-300">
                You reached 2048!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={keepPlaying}
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  Keep playing
                </button>
                <button
                  onClick={reset}
                  className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 shadow-lg transition-transform hover:-translate-y-0.5"
                >
                  New game
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <p className="mt-8 max-w-[400px] text-center text-xs text-zinc-500">
        Use arrow keys or swipe to slide tiles. Merge matching numbers to
        reach 2048.
      </p>

      {/* Leaderboard */}
      <div className="mt-8">
        <Leaderboard gameId="2048" refreshKey={refreshKeyRef.current} />
      </div>
    </div>
  );
}
