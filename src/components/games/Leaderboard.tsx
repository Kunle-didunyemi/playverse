"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { type LeaderboardEntry, fetchLeaderboard } from "@/lib/api";

interface LeaderboardProps {
  gameId: string;
  refreshKey?: number;
}

export default function Leaderboard({ gameId, refreshKey }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(gameId).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [gameId, refreshKey]);

  return (
    <div className="w-full max-w-[400px] rounded-2xl border border-white/10 bg-white/2 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-300">
          Leaderboard
        </h3>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-lg bg-white/5"
            />
          ))}
        </div>
      )}

      {!loading && entries.length === 0 && (
        <p className="py-6 text-center text-sm text-zinc-500">
          No scores yet. Be the first!
        </p>
      )}

      {!loading && entries.length > 0 && (
        <div className="space-y-1">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/5"
            >
              <span
                className={`w-6 text-right text-sm font-bold tabular-nums ${
                  i === 0
                    ? "text-amber-400"
                    : i === 1
                      ? "text-zinc-300"
                      : i === 2
                        ? "text-amber-700"
                        : "text-zinc-500"
                }`}
              >
                {i + 1}
              </span>

              {entry.user.avatarUrl ? (
                <img
                  src={entry.user.avatarUrl}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-300">
                  {entry.user.username.charAt(0).toUpperCase()}
                </div>
              )}

              <span className="flex-1 truncate text-sm text-zinc-200">
                {entry.user.username}
              </span>

              <span className="text-sm font-semibold tabular-nums text-white">
                {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
