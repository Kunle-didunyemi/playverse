"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, BookOpen, Play, RotateCcw } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Leaderboard from "@/components/games/Leaderboard";
import GameRulesModal from "@/components/games/GameRulesModal";
import { submitScore } from "@/lib/api";
import { TARGET_GALLERY_GAME_ID } from "@/lib/games/target-gallery/engine";
import { useTargetGallery } from "@/lib/games/target-gallery/useTargetGallery";

const TargetGalleryScene = dynamic(
  () => import("@/components/games/target-gallery/Scene"),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center bg-[#10081c]">
        <div className="h-14 w-14 animate-pulse rounded-full bg-pink-500/30" />
      </div>
    ),
  },
);

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex min-w-[68px] flex-col items-center rounded-xl bg-[#1a1128] px-3 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      <span className="text-base font-bold tabular-nums text-white">{value}</span>
    </div>
  );
}

export default function TargetGalleryGameShell() {
  const { state, stateRef, bestScore, begin, onHit, reset } =
    useTargetGallery();
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
    submitScore(TARGET_GALLERY_GAME_ID, state.score).then(() =>
      setRefreshKey((k) => k + 1),
    );
  }, [state.phase, state.score, isSignedIn]);

  const accuracy =
    state.shots > 0 ? Math.round((state.hits / state.shots) * 100) : 0;

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#10081c] px-4 py-6 pb-16">
      <div className="w-full max-w-[520px]">
        <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Link
            href="/games"
            className="flex w-fit items-center gap-1.5 text-sm text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Games
          </Link>
          <h1 className="justify-self-center text-xl font-bold text-white sm:text-2xl">
            Target Gallery
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
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          <Stat label="Score" value={state.score} />
          <Stat label="Best" value={bestScore} />
          <Stat label="Time" value={Math.ceil(state.timeLeft)} />
          <Stat label="Acc" value={`${accuracy}%`} />
        </div>
      </div>

      <div
        className="relative w-full max-w-[520px] overflow-hidden rounded-2xl ring-1 ring-white/10"
        style={{ aspectRatio: "5 / 4" }}
      >
        <TargetGalleryScene stateRef={stateRef} onHit={onHit} />
        {state.phase === "ready" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/65 backdrop-blur-sm">
            <button
              type="button"
              onClick={begin}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900"
            >
              <Play className="h-4 w-4 fill-current" />
              Start round
            </button>
            <p className="mt-3 text-xs text-zinc-400">
              Click glowing orbs to score · 45 seconds
            </p>
          </div>
        )}
        {state.phase === "won" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 px-6 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-white">Time&apos;s up!</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Score {state.score} · {state.hits} hits · {accuracy}% accuracy
            </p>
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

      <p className="mt-6 max-w-[440px] text-center text-xs text-zinc-500">
        Pop as many floating targets as you can before the clock runs out.
        Smaller orbs are worth more.
      </p>

      <GameRulesModal
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title="How to play · Target Gallery"
      >
        <ul className="list-disc space-y-2 pl-4 marker:text-pink-400">
          <li>
            You have <strong className="text-zinc-200">45 seconds</strong> per
            round.
          </li>
          <li>Click / tap glowing orbs to destroy them and score points.</li>
          <li>Misses count against accuracy. Smaller targets pay more.</li>
        </ul>
      </GameRulesModal>

      <div className="mt-8 w-full max-w-[400px]">
        <Leaderboard gameId={TARGET_GALLERY_GAME_ID} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
