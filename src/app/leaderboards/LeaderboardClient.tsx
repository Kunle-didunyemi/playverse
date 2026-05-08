"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Crown, Flame } from "lucide-react";

interface ScoreEntry {
  id: string;
  value: number;
  createdAt: string;
  user: { username: string; avatarUrl: string | null };
  game: { id: string; title: string };
}

interface GameOption {
  id: string;
  title: string;
}

export default function LeaderboardClient() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [games, setGames] = useState<GameOption[]>([]);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = activeGame ? `?game=${activeGame}` : "";
    fetch(`/api/leaderboards${params}`)
      .then((res) => res.json())
      .then((data) => {
        setScores(data.scores ?? []);
        setGames(data.games ?? []);
      })
      .finally(() => setLoading(false));
  }, [activeGame]);

  return (
    <div>
      {/* Game filter tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveGame(null)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
            activeGame === null
              ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
          }`}
        >
          All Games
        </button>
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
              activeGame === game.id
                ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
            }`}
          >
            {game.title}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-white/5"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && scores.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Trophy className="mb-4 h-12 w-12 text-zinc-700" />
          <p className="text-lg font-medium text-zinc-400">
            No scores yet
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Be the first to play and claim the top spot!
          </p>
        </div>
      )}

      {/* Scores table */}
      {!loading && scores.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/2">
          {/* Header */}
          <div className="grid grid-cols-[3rem_1fr_1fr_6rem] items-center gap-4 border-b border-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:grid-cols-[3rem_1fr_1fr_8rem]">
            <span className="text-center">#</span>
            <span>Player</span>
            <span>Game</span>
            <span className="text-right">Score</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/5">
            {scores.map((entry, i) => (
              <div
                key={entry.id}
                className={`grid grid-cols-[3rem_1fr_1fr_6rem] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/5 sm:grid-cols-[3rem_1fr_1fr_8rem] ${
                  i === 0 ? "bg-amber-500/3" : ""
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center">
                  {i === 0 && <Crown className="h-5 w-5 text-amber-400" />}
                  {i === 1 && <Medal className="h-5 w-5 text-zinc-300" />}
                  {i === 2 && <Medal className="h-5 w-5 text-amber-700" />}
                  {i > 2 && (
                    <span className="text-sm font-bold tabular-nums text-zinc-500">
                      {i + 1}
                    </span>
                  )}
                </div>

                {/* Player */}
                <div className="flex items-center gap-3 overflow-hidden">
                  {entry.user.avatarUrl ? (
                    <img
                      src={entry.user.avatarUrl}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-300">
                      {entry.user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="truncate text-sm font-medium text-zinc-200">
                    {entry.user.username}
                  </span>
                </div>

                {/* Game */}
                <span className="truncate text-sm text-zinc-400">
                  {entry.game.title}
                </span>

                {/* Score */}
                <div className="flex items-center justify-end gap-1.5">
                  {i < 3 && (
                    <Flame className="h-3.5 w-3.5 text-orange-400" />
                  )}
                  <span className="text-sm font-semibold tabular-nums text-white">
                    {entry.value.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
