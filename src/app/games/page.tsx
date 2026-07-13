import type { Metadata } from "next";
import Image from "next/image";
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
  imageSrc: string;
  imageAlt: string;
  available: boolean;
}

const GAMES: GameCard[] = [
  {
    title: "2048",
    description: "Slide tiles and merge matching numbers. How high can you go?",
    href: "/games/2048",
    category: "2D",
    imageSrc: "/games/2048.svg",
    imageAlt: "Stylized 2048 tiles showing numbered squares",
    available: true,
  },
  {
    title: "Snake",
    description: "Guide the snake, eat the food, grow longer. Don't hit the walls.",
    href: "/games/snake",
    category: "2D",
    imageSrc: "/games/snake.svg",
    imageAlt: "Snake game illustration with grid, snake, and food",
    available: true,
  },
  {
    title: "Wordle",
    description: "Guess the five-letter word in six tries. Daily challenge mode.",
    href: "/games/wordle",
    category: "2D",
    imageSrc: "/games/wordle.svg",
    imageAlt: "Wordle-style letter tiles in green and yellow",
    available: true,
  },
  {
    title: "Tic-Tac-Toe",
    description:
      "You are X vs a minimax AI (optimal O). Force the draw or climb the board when the stars align.",
    href: "/games/tic-tac-toe",
    category: "2D",
    imageSrc: "/games/tic-tac-toe.svg",
    imageAlt: "Tic-tac-toe grid with X and O marks",
    available: true,
  },
  {
    title: "Ball Roller",
    description: "Tilt the maze and guide the ball to the goal. 3D physics puzzle.",
    href: "/games/ball-roller",
    category: "3D",
    imageSrc: "/games/ball-roller.svg",
    imageAlt: "Ball rolling along abstract curved paths",
    available: true,
  },
  {
    title: "Mini Golf",
    description: "Putt your way through creative holes. Aim for a hole-in-one.",
    href: "/games/mini-golf",
    category: "3D",
    imageSrc: "/games/mini-golf.svg",
    imageAlt: "Mini golf green with hole, flag, and ball",
    available: true,
  },
  {
    title: "Memory",
    description: "Flip the cards and match every pair. Fewer moves, higher score.",
    href: "/games/memory",
    category: "2D",
    imageSrc: "/games/memory.svg",
    imageAlt: "Memory match cards with symbols",
    available: true,
  },
  {
    title: "Breakout",
    description: "Bounce the ball and smash every brick before you run out of lives.",
    href: "/games/breakout",
    category: "2D",
    imageSrc: "/games/breakout.svg",
    imageAlt: "Breakout bricks, ball, and paddle",
    available: true,
  },
  {
    title: "Sky Dash",
    description: "Flap through endless gates. One hit ends the run — how far can you go?",
    href: "/games/sky-dash",
    category: "2D",
    imageSrc: "/games/sky-dash.svg",
    imageAlt: "Bird flying between sky gates",
    available: true,
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
                className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/2 p-6 transition-all ${
                  game.available
                    ? "hover:-translate-y-1 hover:border-white/25 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="relative mb-5 h-28 w-full overflow-hidden rounded-xl bg-black/50 ring-1 ring-white/10">
                  <Image
                    src={game.imageSrc}
                    alt={game.imageAlt}
                    fill
                    className={`object-cover object-center transition-transform duration-300 ease-out ${
                      game.available ? "group-hover:scale-[1.04]" : ""
                    }`}
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 320px"
                  />
                </div>

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
