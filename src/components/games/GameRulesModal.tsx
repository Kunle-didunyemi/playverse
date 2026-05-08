"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function GameRulesModal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="game-rules-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-60 flex items-center justify-center px-4 py-8"
        >
          <button
            type="button"
            aria-label="Close rules"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative z-10 flex max-h-[min(520px,85vh)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12081f] shadow-2xl ring-1 ring-white/10"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <h2
                id="game-rules-title"
                className="text-lg font-semibold tracking-tight text-white"
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4 text-sm leading-relaxed text-zinc-300">
              {children}
            </div>

            <div className="shrink-0 border-t border-white/10 px-5 py-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-zinc-900 transition-transform hover:-translate-y-0.5"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
