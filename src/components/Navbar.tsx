"use client";

import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";
import Link from "next/link";

const NAV_ITEMS = [
  { label: "Games", href: "#games" },
  { label: "Features", href: "#features" },
  { label: "Leaderboards", href: "#" },
  { label: "About", href: "#" },
];

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-6 pt-5"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/40">
            <Gamepad2 className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-semibold tracking-tight text-white">
            Playverse
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm text-zinc-300 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="#"
            className="hidden rounded-full px-4 py-2 text-sm text-zinc-200 transition-colors hover:text-white sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="#"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-md transition-transform hover:-translate-y-0.5"
          >
            Play now
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
