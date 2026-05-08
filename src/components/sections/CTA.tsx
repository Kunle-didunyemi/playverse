"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="relative isolate py-32">
      <div className="absolute inset-0 -z-10 bg-black" />

      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-cyan-500/20 p-12 text-center sm:p-20"
        >
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[120%] -translate-x-1/2 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-[120%] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />

          <h2 className="relative text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Ready to{" "}
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              press start?
            </span>
          </h2>
          <p className="relative mx-auto mt-6 max-w-xl text-lg text-zinc-300">
            Make a free account, jump into your first game in seconds, and
            climb the leaderboards.
          </p>

          <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="#"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-medium text-zinc-900 shadow-2xl shadow-violet-500/20 transition-all hover:-translate-y-0.5"
            >
              Create free account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-base text-white backdrop-blur-md transition-colors hover:bg-white/10"
            >
              Play as guest
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
