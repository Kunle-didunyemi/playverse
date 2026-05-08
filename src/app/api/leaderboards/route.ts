import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("game");

    const prisma = getDb();

    const where = gameId ? { gameId } : {};

    const scores = await prisma.score.findMany({
      where,
      orderBy: { value: "desc" },
      take: 100,
      include: {
        user: {
          select: { username: true, avatarUrl: true },
        },
        game: {
          select: { id: true, title: true },
        },
      },
    });

    const games = await prisma.game.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    });

    return NextResponse.json({ scores, games });
  } catch (error) {
    console.error("GET /api/leaderboards error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
