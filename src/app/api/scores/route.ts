import { auth, currentUser } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { gameId, value } = body;

    if (!gameId || typeof value !== "number" || value < 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const prisma = getDb();

    const user = await currentUser();
    await prisma.user.upsert({
      where: { id: userId },
      update: {
        username: user?.username ?? user?.firstName ?? "Player",
        avatarUrl: user?.imageUrl,
      },
      create: {
        id: userId,
        username: user?.username ?? user?.firstName ?? "Player",
        avatarUrl: user?.imageUrl,
      },
    });

    const score = await prisma.score.create({
      data: {
        userId,
        gameId,
        value,
      },
    });

    return NextResponse.json({ score }, { status: 201 });
  } catch (error) {
    console.error("POST /api/scores error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
