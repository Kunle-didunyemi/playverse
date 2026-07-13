"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Play, RotateCcw } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Leaderboard from "@/components/games/Leaderboard";
import GameRulesModal from "@/components/games/GameRulesModal";
import { submitScore } from "@/lib/api";
import {
  BIRD_R,
  BIRD_X,
  H,
  PIPE_GAP,
  PIPE_W,
  SKY_DASH_GAME_ID,
  W,
} from "@/lib/games/sky-dash/engine";
import { useSkyDash } from "@/lib/games/sky-dash/useSkyDash";

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

export default function SkyDashGameShell() {
  const { state, bestScore, doFlap, begin, reset } = useSkyDash();
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
    submitScore(SKY_DASH_GAME_ID, state.score).then(() =>
      setRefreshKey((k) => k + 1),
    );
  }, [state.phase, state.score, isSignedIn]);

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#08020f] px-4 py-6 pb-16">
      <div className="w-full max-w-[360px]">
        <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Link
            href="/games"
            className="flex w-fit items-center gap-1.5 justify-self-start text-sm text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Games
          </Link>
          <h1 className="justify-self-center text-2xl font-bold text-white sm:text-3xl">
            Sky Dash
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
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        className="relative w-full max-w-[360px] touch-none overflow-hidden rounded-2xl ring-1 ring-white/10"
        style={{ aspectRatio: `${W} / ${H}` }}
        onPointerDown={(e) => {
          e.preventDefault();
          doFlap();
        }}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            doFlap();
          }
        }}
        aria-label="Flap"
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          <rect width={W} height={H} fill="url(#sky)" />
          {state.pipes.map((p, i) => (
            <g key={i}>
              <rect
                x={p.x}
                y={0}
                width={PIPE_W}
                height={p.gapY}
                rx={6}
                fill="#34d399"
              />
              <rect
                x={p.x}
                y={p.gapY + PIPE_GAP}
                width={PIPE_W}
                height={H - (p.gapY + PIPE_GAP)}
                rx={6}
                fill="#34d399"
              />
            </g>
          ))}
          <circle
            cx={BIRD_X}
            cy={state.y}
            r={BIRD_R}
            fill="#fbbf24"
            stroke="#f59e0b"
            strokeWidth={2}
          />
          <text
            x={W / 2}
            y={48}
            textAnchor="middle"
            fill="white"
            fontSize={28}
            fontWeight={700}
            opacity={0.9}
          >
            {state.score}
          </text>
        </svg>

        {state.phase === "ready" && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/40">
            <span className="pointer-events-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  begin();
                }}
                className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900"
              >
                <Play className="h-4 w-4 fill-current" />
                Start dash
              </button>
            </span>
            <p className="mt-3 text-xs text-zinc-300">Tap / Space to flap</p>
          </div>
        )}

        {state.phase === "lost" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 px-6 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-white">Crashed!</h2>
            <p className="mt-2 text-sm text-zinc-400">Score {state.score}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      <p className="mt-8 max-w-[360px] text-center text-xs text-zinc-500">
        Flap through the gates. One hit and you&apos;re done — how far can you
        go?
      </p>

      <GameRulesModal
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title="How to play · Sky Dash"
      >
        <ul className="list-disc space-y-2 pl-4 marker:text-amber-400">
          <li>
            Tap the screen or press{" "}
            <strong className="text-zinc-200">Space</strong> to flap upward.
          </li>
          <li>
            Fly through the gaps in the green columns without touching them.
          </li>
          <li>
            Each gate you pass adds <strong className="text-zinc-200">1</strong>{" "}
            to your score. Speed ramps up as you go.
          </li>
        </ul>
      </GameRulesModal>

      <div className="mt-8 w-full max-w-[360px]">
        <Leaderboard gameId={SKY_DASH_GAME_ID} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
