"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <div className="h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-violet-500/40 to-cyan-400/40 blur-2xl" />
    </div>
  ),
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.15 * i, ease: "easeOut" as const },
  }),
};

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,#1a0a3a_0%,#08020f_60%,#000_100%)]" />

      <div className="absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:60px_60px]" />

      <div className="absolute inset-0 z-0">
        <HeroScene />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 h-72 bg-gradient-to-b from-transparent via-black/40 to-black" />

      <div className="relative z-20 mx-auto flex max-w-5xl flex-col items-center px-6 pt-32 pb-24 text-center">
        <motion.div
          custom={0}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-zinc-300 backdrop-blur-md"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
          <span>2D classics meet immersive 3D worlds</span>
        </motion.div>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-7xl md:text-8xl"
        >
          Where every{" "}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
            game
          </span>{" "}
          lives.
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-zinc-300/90 sm:text-xl"
        >
          Drop into 2D classics, dive into immersive 3D worlds, and challenge
          friends in real-time. One platform. One account. Pure play.
        </motion.p>

        <motion.div
          custom={3}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            href="#"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-medium text-zinc-900 shadow-2xl shadow-violet-500/20 transition-all hover:-translate-y-0.5 hover:shadow-violet-500/40"
          >
            Start playing
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="#games"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-base text-white backdrop-blur-md transition-colors hover:bg-white/10"
          >
            Browse games
          </Link>
        </motion.div>

        <motion.div
          custom={4}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-14 flex items-center gap-8 text-xs uppercase tracking-widest text-zinc-500"
        >
          <span>40+ games</span>
          <span className="h-1 w-1 rounded-full bg-zinc-700" />
          <span>2D &amp; 3D</span>
          <span className="h-1 w-1 rounded-full bg-zinc-700" />
          <span>Multiplayer</span>
          <span className="h-1 w-1 rounded-full bg-zinc-700" />
          <span>Free to play</span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1.5">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-white/60"
          />
        </div>
      </motion.div>
    </section>
  );
}
