import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const prisma = getDb();

    const scores = await prisma.score.findMany({
      where: { gameId },
      orderBy: { value: "desc" },
      take: 50,
      include: {
        user: {
          select: { username: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({ scores });
  } catch (error) {
    console.error("GET /api/scores/[gameId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
