"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, BookOpen, Play, RotateCcw } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Leaderboard from "@/components/games/Leaderboard";
import GameRulesModal from "@/components/games/GameRulesModal";
import { submitScore } from "@/lib/api";
import { CUBE_STACK_GAME_ID } from "@/lib/games/cube-stack/engine";
import { useCubeStack } from "@/lib/games/cube-stack/useCubeStack";

const CubeStackScene = dynamic(
  () => import("@/components/games/cube-stack/Scene"),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center bg-[#08020f]">
        <div className="h-14 w-14 animate-pulse rounded-lg bg-violet-500/30" />
      </div>
    ),
  },
);

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

export default function CubeStackGameShell() {
  const { state, stateRef, bestScore, begin, place, reset } = useCubeStack();
  const { isSignedIn } = useUser();
  const submittedRef = useRef(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rulesOpen, setRulesOpen] = useState(false);

  useEffect(() => {
    if (state.phase !== "lost") {
      submittedRef.current = false;
      return;
    }
    if (!isSignedIn || submittedRef.current || state.score <= 0) return;
    submittedRef.current = true;
    submitScore(CUBE_STACK_GAME_ID, state.score).then(() =>
      setRefreshKey((k) => k + 1),
    );
  }, [state.phase, state.score, isSignedIn]);

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#08020f] px-4 py-6 pb-16">
      <div className="w-full max-w-[480px]">
        <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Link
            href="/games"
            className="flex w-fit items-center gap-1.5 text-sm text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Games
          </Link>
          <h1 className="justify-self-center text-2xl font-bold text-white">
            Cube Stack
          </h1>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRulesOpen(true)}
              className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/10"
            >
              <BookOpen className="inline h-3.5 w-3.5" /> Rules
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/10"
            >
              <RotateCcw className="inline h-3.5 w-3.5" /> New
            </button>
          </div>
        </div>
        <div className="mb-4 flex justify-center gap-2">
          <Stat label="Score" value={state.score} />
          <Stat label="Best" value={bestScore} />
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        className="relative w-full max-w-[480px] overflow-hidden rounded-2xl ring-1 ring-white/10"
        style={{ aspectRatio: "5 / 4" }}
        onPointerDown={(e) => {
          e.preventDefault();
          place();
        }}
      >
        <CubeStackScene stateRef={stateRef} />
        {state.phase === "ready" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/65 backdrop-blur-sm">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                begin();
              }}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900"
            >
              <Play className="h-4 w-4 fill-current" />
              Start stacking
            </button>
            <p className="mt-3 text-xs text-zinc-400">
              Tap / Space to drop each slab
            </p>
          </div>
        )}
        {state.phase === "lost" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 px-6 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-white">Tower fell!</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Stacked {state.score} layers
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900"
            >
              Play again
            </button>
          </div>
        )}
      </div>

      <p className="mt-6 max-w-[420px] text-center text-xs text-zinc-500">
        Drop each moving slab onto the tower. Miss the overlap and it&apos;s
        over.
      </p>

      <GameRulesModal
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title="How to play · Cube Stack"
      >
        <ul className="list-disc space-y-2 pl-4 marker:text-violet-400">
          <li>A colored slab slides back and forth above the tower.</li>
          <li>
            Tap or press <strong className="text-zinc-200">Space</strong> to
            drop it.
          </li>
          <li>
            Only the overlapping part stays. Stack as high as you can before you
            miss.
          </li>
        </ul>
      </GameRulesModal>

      <div className="mt-8 w-full max-w-[400px]">
        <Leaderboard gameId={CUBE_STACK_GAME_ID} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
