"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FLIP_BACK_MS,
  createInitialState,
  flipCard,
  lockBoard,
  resolveFlip,
  startGame,
  type MemoryState,
} from "./engine";

const BEST_KEY = "playverse-memory-best";

function loadBest(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(BEST_KEY) ?? "0", 10) || 0;
}

function saveBest(score: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BEST_KEY, String(score));
}

export function useMemory() {
  const [state, setState] = useState<MemoryState>(createInitialState);
  const [bestScore, setBestScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setBestScore(loadBest());
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const start = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState(startGame());
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState(createInitialState());
  }, []);

  const onCardClick = useCallback((index: number) => {
    setState((prev) => {
      if (prev.phase !== "playing" || prev.locked) return prev;
      const next = flipCard(prev, index);
      if (next.flipped.length < 2) return next;

      const locked = lockBoard(next);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setState((cur) => {
          const resolved = resolveFlip(cur);
          if (resolved.phase === "won" && resolved.score > 0) {
            const best = Math.max(resolved.score, loadBest());
            saveBest(best);
            setBestScore(best);
          }
          return resolved;
        });
      }, FLIP_BACK_MS);
      return locked;
    });
  }, []);

  return { state, bestScore, start, reset, onCardClick };
}
