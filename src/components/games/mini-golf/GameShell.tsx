"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, BookOpen, Play, RotateCcw } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Leaderboard from "@/components/games/Leaderboard";
import GameRulesModal from "@/components/games/GameRulesModal";
import { submitScore } from "@/lib/api";
import {
  HOLES,
  MAX_POWER,
  MINI_GOLF_GAME_ID,
  currentHole,
} from "@/lib/games/mini-golf/engine";
import { useMiniGolf } from "@/lib/games/mini-golf/useMiniGolf";

const MiniGolfScene = dynamic(
  () => import("@/components/games/mini-golf/Scene"),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center bg-[#07140c]">
        <div className="h-16 w-16 animate-pulse rounded-full bg-gradient-to-br from-emerald-500/40 to-indigo-500/40 blur-xl" />
      </div>
    ),
  },
);

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex min-w-[68px] flex-col items-center rounded-xl bg-[#122016] px-3 py-2 ring-1 ring-white/5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      <span className="text-base font-bold tabular-nums text-white">{value}</span>
    </div>
  );
}

export default function MiniGolfGameShell() {
  const {
    state,
    stateRef,
    bestScore,
    start,
    nextHole,
    retry,
    skipHole,
    reset,
    chargeStart,
    chargeEnd,
    aimToward,
  } = useMiniGolf();
  const { isSignedIn } = useUser();
  const submittedRef = useRef(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rulesOpen, setRulesOpen] = useState(false);
  const hole = currentHole(state);

  useEffect(() => {
    if (state.phase !== "course_done") {
      submittedRef.current = false;
      return;
    }
    if (!isSignedIn || submittedRef.current || state.score <= 0) return;
    submittedRef.current = true;
    submitScore(MINI_GOLF_GAME_ID, state.score).then(() => {
      setRefreshKey((k) => k + 1);
    });
  }, [state.phase, state.score, isSignedIn]);

  const headline =
    state.phase === "ready"
      ? "Aim, charge, putt — sink all ten holes"
      : state.phase === "aiming"
        ? `${hole.name} · Par ${hole.par}`
        : state.phase === "rolling"
          ? "Ball in motion…"
          : state.phase === "hole_done"
            ? "Hole complete!"
            : state.phase === "hole_fail"
              ? "Too many strokes"
              : "Course finished!";

  const powerPct = Math.min(100, (state.power / MAX_POWER) * 100);

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#07140c] px-4 py-6 pb-16">
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
            Mini Golf
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
          <StatPill
            label="Hole"
            value={`${state.holeIndex + 1}/${HOLES.length}`}
          />
          <StatPill label="Strokes" value={state.strokes} />
          <StatPill label="Par" value={hole.par} />
        </div>

        <p className="mb-3 text-center text-sm text-zinc-400">{headline}</p>

        {(state.phase === "aiming" || state.charging) && (
          <div className="mx-auto mb-4 h-2 w-full max-w-[280px] overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-[width] duration-75"
              style={{ width: `${state.charging ? powerPct : 8}%` }}
            />
          </div>
        )}
      </div>

      <div className="relative w-full max-w-[520px] overflow-hidden rounded-2xl ring-1 ring-white/10">
        <div className="relative aspect-[4/3] w-full sm:aspect-[5/4]">
          <MiniGolfScene
            stateRef={stateRef}
            holeIndex={state.holeIndex}
            onAim={aimToward}
            onChargeStart={chargeStart}
            onChargeEnd={chargeEnd}
          />

          {state.phase === "ready" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
              <button
                type="button"
                onClick={start}
                className="flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-zinc-900 shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <Play className="h-4 w-4 fill-current" />
                Start course
              </button>
              <p className="mt-4 max-w-xs text-center text-xs text-zinc-400">
                Move the pointer to aim. Hold Space (or Hold to putt) to charge,
                release to hit. ← → rotate aim.
              </p>
            </div>
          )}

          {state.phase === "hole_done" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-white">
                {state.strokes === 1
                  ? "Hole in one!"
                  : state.strokes <= hole.par
                    ? "Nice putt!"
                    : "In the cup"}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                {state.strokes} stroke{state.strokes === 1 ? "" : "s"} · Par{" "}
                {hole.par} · Score {state.score}
              </p>
              <button
                type="button"
                onClick={nextHole}
                className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Next hole
              </button>
            </div>
          )}

          {state.phase === "hole_fail" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm px-6">
              <h2 className="text-3xl font-bold text-white">Stroke limit</h2>
              <p className="mt-2 text-center text-sm text-zinc-400">
                This hole caps at 8 strokes. Retry or skip with a small score.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={retry}
                  className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 shadow-lg transition-transform hover:-translate-y-0.5"
                >
                  Retry hole
                </button>
                <button
                  type="button"
                  onClick={skipHole}
                  className="rounded-full bg-white/10 px-6 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/15"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {state.phase === "course_done" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm px-6">
              <h2 className="text-3xl font-bold text-white">Course complete!</h2>
              <p className="mt-3 text-sm text-zinc-400">
                Final score{" "}
                <span className="font-semibold tabular-nums text-zinc-200">
                  {state.score}
                </span>
                {" · "}
                {state.totalStrokes} total strokes
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
            </div>
          )}
        </div>
      </div>

      {state.phase === "aiming" && (
        <button
          type="button"
          className="mt-5 rounded-full bg-emerald-500/20 px-8 py-3 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-400/40 active:bg-emerald-500/35"
          onPointerDown={(e) => {
            e.preventDefault();
            chargeStart();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            chargeEnd();
          }}
          onPointerLeave={chargeEnd}
        >
          Hold to putt
        </button>
      )}

      <p className="mt-6 max-w-[480px] text-center text-xs leading-relaxed text-zinc-500">
        Ten creative greens. Beat par when you can — hole-in-ones pay big on
        the leaderboard. Lower strokes, higher score.
      </p>

      <GameRulesModal
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title="How to play · Mini Golf"
      >
        <ul className="list-disc space-y-2 pl-4 marker:text-emerald-400">
          <li>
            Move the pointer over the green to{" "}
            <strong className="text-zinc-200">aim</strong>. Use{" "}
            <strong className="text-zinc-200">← →</strong> (or A/D) to fine-tune.
          </li>
          <li>
            Hold <strong className="text-zinc-200">Space</strong> (or the putt
            button on mobile) to charge power, then{" "}
            <strong className="text-zinc-200">release</strong> to hit.
          </li>
          <li>
            Sink the ball in the cup. Stay under{" "}
            <strong className="text-zinc-200">par</strong> for more points; a{" "}
            <strong className="text-zinc-200">hole-in-one</strong> is a big bonus.
          </li>
          <li>
            Each hole allows up to{" "}
            <strong className="text-zinc-200">8 strokes</strong>. After that you
            can retry or skip.
          </li>
          <li>
            Finish all ten holes to post your course score to the leaderboard.
          </li>
        </ul>
      </GameRulesModal>

      <div className="mt-8 w-full max-w-[400px]">
        <Leaderboard gameId={MINI_GOLF_GAME_ID} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
