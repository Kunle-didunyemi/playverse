"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Play, RotateCcw } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Leaderboard from "@/components/games/Leaderboard";
import GameRulesModal from "@/components/games/GameRulesModal";
import { submitScore } from "@/lib/api";
import {
  BALL_ROLLER_GAME_ID,
  LEVELS,
  currentLevel,
} from "@/lib/games/ball-roller/engine";
import { useBallRoller } from "@/lib/games/ball-roller/useBallRoller";

const BallRollerScene = dynamic(
  () => import("@/components/games/ball-roller/Scene"),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center bg-[#08020f]">
        <div className="h-16 w-16 animate-pulse rounded-full bg-gradient-to-br from-pink-500/40 to-violet-500/40 blur-xl" />
      </div>
    ),
  },
);

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex min-w-[72px] flex-col items-center rounded-xl bg-[#1a1128] px-3 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      <span className="text-base font-bold tabular-nums text-white">{value}</span>
    </div>
  );
}

export default function BallRollerGameShell() {
  const {
    state,
    stateRef,
    bestScore,
    start,
    continueNextLevel,
    reset,
    setTiltFromPad,
  } = useBallRoller();
  const { isSignedIn } = useUser();
  const submittedRef = useRef(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rulesOpen, setRulesOpen] = useState(false);
  const level = currentLevel(state);

  useEffect(() => {
    const ended = state.phase === "won_game" || state.phase === "lost";
    if (!ended) {
      submittedRef.current = false;
      return;
    }
    if (!isSignedIn || submittedRef.current || state.score <= 0) return;
    submittedRef.current = true;
    submitScore(BALL_ROLLER_GAME_ID, state.score).then(() => {
      setRefreshKey((k) => k + 1);
    });
  }, [state.phase, state.score, isSignedIn]);

  const headline =
    state.phase === "ready"
      ? "Tilt the maze — reach the green flag"
      : state.phase === "playing"
        ? `${level.name} · Level ${state.levelIndex + 1}/${LEVELS.length}`
        : state.phase === "won_level"
          ? "Level clear!"
          : state.phase === "won_game"
            ? "Course complete!"
            : "Ball lost";

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#08020f] px-4 py-6 pb-16">
      <div className="w-full max-w-[520px]">
        <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Link
            href="/games"
            className="flex w-fit items-center gap-1.5 justify-self-start text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Games
          </Link>
          <h1 className="justify-self-center text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ball Roller
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

        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          <StatPill label="Score" value={state.score} />
          <StatPill label="Best" value={bestScore} />
          <StatPill label="Lives" value={state.lives} />
          <StatPill label="Time" value={Math.ceil(state.timeLeft)} />
        </div>

        <p className="mb-4 text-center text-sm text-zinc-400">{headline}</p>
      </div>

      <div className="relative w-full max-w-[520px] overflow-hidden rounded-2xl ring-1 ring-white/10">
        <div className="aspect-[4/3] w-full sm:aspect-[5/4]">
          <BallRollerScene
            stateRef={stateRef}
            levelIndex={state.levelIndex}
          />
        </div>

        <AnimatePresence>
          {state.phase === "ready" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/65 backdrop-blur-sm"
            >
              <button
                type="button"
                onClick={start}
                className="flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-zinc-900 shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <Play className="h-4 w-4 fill-current" />
                Start rolling
              </button>
              <p className="mt-4 max-w-xs text-center text-xs text-zinc-400">
                Arrow keys or WASD tilt the platform. Reach the green flag
                before time runs out.
              </p>
            </motion.div>
          )}

          {state.phase === "won_level" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
            >
              <h2 className="text-3xl font-bold text-white">Nice roll!</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Level {state.levelIndex + 1} cleared · Score {state.score}
              </p>
              <button
                type="button"
                onClick={continueNextLevel}
                className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Next level
              </button>
            </motion.div>
          )}

          {(state.phase === "won_game" || state.phase === "lost") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm px-6"
            >
              <h2 className="text-3xl font-bold text-white">
                {state.phase === "won_game" ? "You cleared the course!" : "Out of lives"}
              </h2>
              <p className="mt-3 text-sm text-zinc-400">
                Final score{" "}
                <span className="font-semibold tabular-nums text-zinc-200">
                  {state.score}
                </span>
              </p>
              {isSignedIn ? (
                <p className="mt-2 text-xs text-emerald-400">
                  {state.score > 0
                    ? "Saved to leaderboard"
                    : "Score 0 — nothing to save"}
                </p>
              ) : (
                <p className="mt-2 text-xs text-zinc-500">
                  Sign in to save scores
                </p>
              )}
              <button
                type="button"
                onClick={reset}
                className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Play again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile tilt pad */}
      <div className="mt-5 grid w-full max-w-[280px] grid-cols-3 gap-2 sm:hidden">
        <div />
        <button
          type="button"
          className="rounded-xl bg-white/5 py-3 text-zinc-300 active:bg-white/15"
          onTouchStart={(e) => {
            e.preventDefault();
            setTiltFromPad(0, -1);
          }}
          onTouchEnd={() => setTiltFromPad(0, 0)}
          onMouseDown={() => setTiltFromPad(0, -1)}
          onMouseUp={() => setTiltFromPad(0, 0)}
          onMouseLeave={() => setTiltFromPad(0, 0)}
        >
          ↑
        </button>
        <div />
        <button
          type="button"
          className="rounded-xl bg-white/5 py-3 text-zinc-300 active:bg-white/15"
          onTouchStart={(e) => {
            e.preventDefault();
            setTiltFromPad(-1, 0);
          }}
          onTouchEnd={() => setTiltFromPad(0, 0)}
          onMouseDown={() => setTiltFromPad(-1, 0)}
          onMouseUp={() => setTiltFromPad(0, 0)}
          onMouseLeave={() => setTiltFromPad(0, 0)}
        >
          ←
        </button>
        <button
          type="button"
          className="rounded-xl bg-white/5 py-3 text-zinc-300 active:bg-white/15"
          onTouchStart={(e) => {
            e.preventDefault();
            setTiltFromPad(0, 1);
          }}
          onTouchEnd={() => setTiltFromPad(0, 0)}
          onMouseDown={() => setTiltFromPad(0, 1)}
          onMouseUp={() => setTiltFromPad(0, 0)}
          onMouseLeave={() => setTiltFromPad(0, 0)}
        >
          ↓
        </button>
        <button
          type="button"
          className="rounded-xl bg-white/5 py-3 text-zinc-300 active:bg-white/15"
          onTouchStart={(e) => {
            e.preventDefault();
            setTiltFromPad(1, 0);
          }}
          onTouchEnd={() => setTiltFromPad(0, 0)}
          onMouseDown={() => setTiltFromPad(1, 0)}
          onMouseUp={() => setTiltFromPad(0, 0)}
          onMouseLeave={() => setTiltFromPad(0, 0)}
        >
          →
        </button>
      </div>

      <p className="mt-6 max-w-[480px] text-center text-xs leading-relaxed text-zinc-500">
        Guide the pink ball through five 3D mazes. Fall off the platform or run
        out of time and you lose a life. Clear all levels for the high score.
      </p>

      <GameRulesModal
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title="How to play · Ball Roller"
      >
        <ul className="list-disc space-y-2 pl-4 marker:text-pink-400">
          <li>
            Use <strong className="text-zinc-200">arrow keys</strong> or{" "}
            <strong className="text-zinc-200">WASD</strong> to tilt the maze
            (on mobile, use the on-screen pad).
          </li>
          <li>
            Roll the ball into the{" "}
            <strong className="text-zinc-200">green goal</strong> before the
            timer hits zero.
          </li>
          <li>
            Falling off the edge or timing out costs a{" "}
            <strong className="text-zinc-200">life</strong>. You start with{" "}
            <strong className="text-zinc-200">3 lives</strong>.
          </li>
          <li>
            Each cleared level adds points based on the level number and leftover
            time. Finish all five mazes for the top score.
          </li>
          <li>
            <strong className="text-zinc-200">New</strong> restarts the whole
            course from level 1.
          </li>
        </ul>
      </GameRulesModal>

      <div className="mt-8 w-full max-w-[400px]">
        <Leaderboard gameId={BALL_ROLLER_GAME_ID} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
