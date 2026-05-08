"use client";

import { motion } from "framer-motion";

interface CategoryShapeProps {
  variant: "2d" | "3d" | "multiplayer";
}

function Shape2D() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="relative h-28 w-28"
      >
        <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_40px_rgba(34,211,238,0.25)]" />
        <div className="absolute inset-3 rounded-xl border border-cyan-300/40 bg-cyan-400/5" />
      </motion.div>

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute h-10 w-10 rounded-full border-2 border-white/50 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
      />

      <div className="absolute -left-4 top-8 h-5 w-5 rounded-full bg-cyan-400/30 blur-sm" />
      <div className="absolute -right-2 bottom-12 h-3 w-3 rounded-full bg-blue-400/40 blur-sm" />
    </div>
  );
}

function Shape3D() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <div className="h-28 w-28 rotate-45 rounded-2xl border-2 border-violet-400/60 bg-violet-500/10 shadow-[0_0_40px_rgba(167,139,250,0.25)]" />
      </motion.div>

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        className="absolute"
      >
        <div className="h-20 w-20 rotate-12 rounded-xl border-2 border-fuchsia-400/50 bg-fuchsia-500/10" />
      </motion.div>

      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-6 w-6 rounded-full bg-violet-400/40 shadow-[0_0_20px_rgba(167,139,250,0.4)]"
      />

      <div className="absolute left-6 bottom-6 h-4 w-4 rounded-full bg-fuchsia-400/30 blur-sm" />
      <div className="absolute right-4 top-10 h-3 w-3 rounded-full bg-violet-300/40 blur-sm" />
    </div>
  );
}

function ShapeMultiplayer() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <motion.div
        animate={{ x: [-12, 12, -12], y: [6, -6, 6] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -translate-x-6"
      >
        <div className="h-16 w-16 rounded-full border-2 border-pink-400/60 bg-pink-500/15 shadow-[0_0_30px_rgba(244,114,182,0.25)]" />
      </motion.div>

      <motion.div
        animate={{ x: [12, -12, 12], y: [-6, 6, -6] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute translate-x-6"
      >
        <div className="h-16 w-16 rounded-full border-2 border-amber-400/60 bg-amber-500/15 shadow-[0_0_30px_rgba(251,191,36,0.25)]" />
      </motion.div>

      <motion.div
        animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute z-10 flex h-10 w-20 items-center justify-center rounded-full border border-white/20 bg-white/5"
      >
        <span className="text-[10px] font-medium tracking-wider text-white/60">
          VS
        </span>
      </motion.div>

      <div className="absolute left-4 top-6 h-3 w-3 rounded-full bg-pink-400/30 blur-sm" />
      <div className="absolute right-6 bottom-8 h-4 w-4 rounded-full bg-amber-400/30 blur-sm" />
    </div>
  );
}

export default function CategoryShape({ variant }: CategoryShapeProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      {variant === "2d" && <Shape2D />}
      {variant === "3d" && <Shape3D />}
      {variant === "multiplayer" && <ShapeMultiplayer />}
    </div>
  );
}
