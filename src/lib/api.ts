export async function submitScore(gameId: string, value: number) {
  const res = await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId, value }),
  });
  if (!res.ok) return null;
  return res.json();
}

export interface LeaderboardEntry {
  id: string;
  value: number;
  createdAt: string;
  user: {
    username: string;
    avatarUrl: string | null;
  };
}

export async function fetchLeaderboard(
  gameId: string
): Promise<LeaderboardEntry[]> {
  const res = await fetch(`/api/scores/${gameId}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.scores ?? [];
}
