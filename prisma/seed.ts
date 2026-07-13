import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const GAMES = [
  { id: "2048", title: "2048", category: "2d", multiplayer: false },
  { id: "snake", title: "Snake", category: "2d", multiplayer: false },
  { id: "wordle", title: "Wordle", category: "2d", multiplayer: false },
  { id: "tic-tac-toe", title: "Tic-Tac-Toe", category: "2d", multiplayer: false },
  { id: "ball-roller", title: "Ball Roller", category: "3d", multiplayer: false },
  { id: "minigolf", title: "Mini Golf", category: "3d", multiplayer: false },
  { id: "memory", title: "Memory", category: "2d", multiplayer: false },
  { id: "breakout", title: "Breakout", category: "2d", multiplayer: false },
  { id: "sky-dash", title: "Sky Dash", category: "2d", multiplayer: false },
  { id: "cube-stack", title: "Cube Stack", category: "3d", multiplayer: false },
  { id: "tunnel-rush", title: "Tunnel Rush", category: "3d", multiplayer: false },
  { id: "target-gallery", title: "Target Gallery", category: "3d", multiplayer: false },
];

async function main() {
  for (const game of GAMES) {
    await prisma.game.upsert({
      where: { id: game.id },
      update: {},
      create: game,
    });
  }
  console.log("Seeded games:", GAMES.map((g) => g.id).join(", "));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
