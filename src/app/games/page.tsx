import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Games | Playverse",
  description: "Browse and play 2D classics, 3D worlds, and multiplayer games on Playverse.",
};

interface GameCard {
  title: string;
  description: string;
  href: string;
  category: "2D" | "3D" | "Multiplayer";
  accent: string;
  available: boolean;
}

const GAMES: GameCard[] = [
  {
    title: "2048",
    description: "Slide tiles and merge matching numbers. How high can you go?",
    href: "/games/2048",
    category: "2D",
    accent: "from-violet-500 to-fuchsia-500",
    available: true,
  },
  {
    title: "Snake",
    description: "Guide the snake, eat the food, grow longer. Don't hit the walls.",
    href: "/games/snake",
    category: "2D",
    accent: "from-emerald-500 to-teal-500",
    available: true,
  },
  {
    title: "Wordle",
    description: "Guess the five-letter word in six tries. Daily challenge mode.",
    href: "#",
    category: "2D",
    accent: "from-amber-500 to-orange-500",
    available: false,
  },
  {
    title: "Tic-Tac-Toe",
    description: "Classic X and O. Play against AI or challenge a friend.",
    href: "#",
    category: "2D",
    accent: "from-cyan-500 to-blue-500",
    available: false,
  },
  {
    title: "Ball Roller",
    description: "Tilt the maze and guide the ball to the goal. 3D physics puzzle.",
    href: "#",
    category: "3D",
    accent: "from-pink-500 to-rose-500",
    available: false,
  },
  {
    title: "Mini Golf",
    description: "Putt your way through creative holes. Aim for a hole-in-one.",
    href: "#",
    category: "3D",
    accent: "from-indigo-500 to-purple-500",
    available: false,
  },
];

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-300">
      {category}
    </span>
  );
}

export default function GamesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#08020f] pt-28 pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Games
            </h1>
            <p className="mt-3 max-w-xl text-lg text-zinc-400">
              Pick a game and start playing. More titles added every week.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {GAMES.map((game) => (
              <Link
                key={game.title}
                href={game.available ? game.href : "#"}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all ${
                  game.available
                    ? "hover:-translate-y-1 hover:border-white/25 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                {/* Gradient accent bar */}
                <div
                  className={`mb-5 h-24 w-full rounded-xl bg-gradient-to-br ${game.accent} opacity-30`}
                />

                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {game.title}
                  </h3>
                  <CategoryBadge category={game.category} />
                  {!game.available && (
                    <span className="ml-auto rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] text-zinc-500">
                      Coming soon
                    </span>
                  )}
                </div>

                <p className="text-sm leading-relaxed text-zinc-400">
                  {game.description}
                </p>

                {game.available && (
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-violet-400 opacity-0 transition-opacity group-hover:opacity-100">
                    Play now
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
