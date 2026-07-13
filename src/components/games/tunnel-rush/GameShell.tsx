"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, BookOpen, Play, RotateCcw } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Leaderboard from "@/components/games/Leaderboard";
import GameRulesModal from "@/components/games/GameRulesModal";
import { submitScore } from "@/lib/api";
import { TUNNEL_RUSH_GAME_ID } from "@/lib/games/tunnel-rush/engine";
import { useTunnelRush } from "@/lib/games/tunnel-rush/useTunnelRush";

const TunnelRushScene = dynamic(
  () => import("@/components/games/tunnel-rush/Scene"),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center bg-[#05010a]">
        <div className="h-14 w-14 animate-pulse rounded-full bg-cyan-500/30" />
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

export default function TunnelRushGameShell() {
  const { state, stateRef, bestScore, begin, go, reset } = useTunnelRush();
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
    submitScore(TUNNEL_RUSH_GAME_ID, state.score).then(() =>
      setRefreshKey((k) => k + 1),
    );
  }, [state.phase, state.score, isSignedIn]);

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#05010a] px-4 py-6 pb-16">
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
            Tunnel Rush
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
        className="relative w-full max-w-[480px] overflow-hidden rounded-2xl ring-1 ring-white/10"
        style={{ aspectRatio: "5 / 4" }}
      >
        <TunnelRushScene stateRef={stateRef} />
        {state.phase === "ready" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/65 backdrop-blur-sm">
            <button
              type="button"
              onClick={begin}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900"
            >
              <Play className="h-4 w-4 fill-current" />
              Enter tunnel
            </button>
            <p className="mt-3 text-xs text-zinc-400">← → change lanes</p>
          </div>
        )}
        {state.phase === "lost" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 px-6 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-white">Crashed!</h2>
            <p className="mt-2 text-sm text-zinc-400">Score {state.score}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900"
            >
              Run again
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3 sm:hidden">
        <button
          type="button"
          className="rounded-xl bg-white/10 px-8 py-3 text-white"
          onClick={() => go(-1)}
        >
          ←
        </button>
        <button
          type="button"
          className="rounded-xl bg-white/10 px-8 py-3 text-white"
          onClick={() => go(1)}
        >
          →
        </button>
      </div>

      <p className="mt-6 max-w-[420px] text-center text-xs text-zinc-500">
        Dodge red blocks in the neon tunnel. Speed climbs the farther you go.
      </p>

      <GameRulesModal
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title="How to play · Tunnel Rush"
      >
        <ul className="list-disc space-y-2 pl-4 marker:text-cyan-400">
          <li>
            Switch between <strong className="text-zinc-200">3 lanes</strong>{" "}
            with arrow keys or on-screen buttons.
          </li>
          <li>Avoid the red cubes rushing toward you.</li>
          <li>Score rises with distance; the tunnel gets faster over time.</li>
        </ul>
      </GameRulesModal>

      <div className="mt-8 w-full max-w-[400px]">
        <Leaderboard gameId={TUNNEL_RUSH_GAME_ID} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
