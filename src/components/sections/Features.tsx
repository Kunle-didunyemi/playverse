"use client";

import { motion } from "framer-motion";
import {
  Layers3,
  Globe2,
  Users,
  Trophy,
  Zap,
  Sparkles,
} from "lucide-react";

const FEATURES = [
  {
    icon: Layers3,
    title: "2D + 3D under one roof",
    body: "Quick-fire classics like 2048 and Tetris alongside immersive 3D experiences. Switch genres without switching platforms.",
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: Globe2,
    title: "Plays in your browser",
    body: "No installs, no downloads. Click a link, you're in the game. Works everywhere — desktop, tablet, phone.",
    accent: "from-cyan-400 to-blue-500",
  },
  {
    icon: Users,
    title: "Real-time multiplayer",
    body: "Challenge a friend, jump into a public lobby, or fight strangers in matchmaking. Low-latency rooms built for speed.",
    accent: "from-pink-500 to-rose-400",
  },
  {
    icon: Trophy,
    title: "Global leaderboards",
    body: "Every game tracks your best. Climb daily, weekly, and all-time charts. Brag-worthy stats on your profile.",
    accent: "from-amber-400 to-orange-500",
  },
  {
    icon: Zap,
    title: "Instant matchmaking",
    body: "We pair you with someone at your skill level in seconds. No waiting rooms, no awkward lobbies.",
    accent: "from-emerald-400 to-teal-500",
  },
  {
    icon: Sparkles,
    title: "New games weekly",
    body: "Modular game engine means we ship a new one every week. Vote on what's next from the community board.",
    accent: "from-indigo-500 to-purple-500",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative isolate py-32">
      <div className="absolute inset-0 -z-10 bg-black" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,#1a0a3a_0%,transparent_60%)]" />

      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-20 max-w-2xl text-center"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-violet-400">
            Built for play
          </p>
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            One platform.{" "}
            <span className="bg-linear-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
              Every kind of game.
            </span>
          </h2>
          <p className="mt-5 text-lg text-zinc-400">
            Built ground-up to host any game we throw at it — from 8-bit puzzles
            to physics-driven 3D arenas.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/3 p-7 transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/5"
              >
                <div
                  className={`mb-5 inline-grid h-11 w-11 place-items-center rounded-xl bg-linear-to-br ${feature.accent} shadow-lg`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-6 text-zinc-400">{feature.body}</p>

                <div
                  className={`pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-linear-to-br ${feature.accent} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
