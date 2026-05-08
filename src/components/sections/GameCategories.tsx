"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import CategoryShape from "@/components/three/CategoryShape";

const CATEGORIES = [
  {
    variant: "2d" as const,
    label: "2D",
    title: "Quick, classic, addictive",
    body: "Hop into bite-sized 2D games — 2048, Tetris, Wordle, Snake, Tic-Tac-Toe and more. Perfect for a 5-minute break.",
    examples: ["2048", "Tetris", "Wordle", "Snake", "Sudoku"],
    accent: "from-cyan-500/30 to-blue-500/10",
  },
  {
    variant: "3d" as const,
    label: "3D",
    title: "Immersive, physics-driven",
    body: "Step into 3D worlds rendered live in your browser. Mini-golf, ball-rollers, endless runners and 3D mazes.",
    examples: ["Mini Golf", "Ball Roller", "Cube Stacker", "Endless Runner"],
    accent: "from-violet-500/30 to-fuchsia-500/10",
  },
  {
    variant: "multiplayer" as const,
    label: "Multiplayer",
    title: "Real-time, head-to-head",
    body: "Challenge friends or strangers. Online chess, Pictionary, kart racing and more — matchmaking included.",
    examples: ["Chess", "Skribbl", "Kart Race", "Battleship"],
    accent: "from-pink-500/30 to-rose-500/10",
  },
];

export default function GameCategories() {
  return (
    <section id="games" className="relative isolate py-32">
      <div className="absolute inset-0 -z-10 bg-black" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,#10031c_0%,transparent_60%)]" />

      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-cyan-300">
            The catalog
          </p>
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Three worlds.{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
              Endless games.
            </span>
          </h2>
          <p className="mt-5 text-lg text-zinc-400">
            Pick your vibe. We're constantly shipping new titles in every
            category.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {CATEGORIES.map((cat, i) => (
            <Link key={cat.label} href="/games">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-7 transition-all hover:-translate-y-1 hover:border-white/25"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${cat.accent} opacity-60`}
              />

              <div className="relative h-56 w-full">
                <CategoryShape variant={cat.variant} />
              </div>

              <div className="relative mt-2 flex flex-1 flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-zinc-300">
                    {cat.label}
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-zinc-500 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                </div>

                <h3 className="text-2xl font-semibold tracking-tight text-white">
                  {cat.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {cat.body}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {cat.examples.map((ex) => (
                    <span
                      key={ex}
                      className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-zinc-300"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
