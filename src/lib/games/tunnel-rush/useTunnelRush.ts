"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type TunnelRushState,
  createInitialState,
  moveLane,
  start,
  step,
} from "./engine";

const BEST_KEY = "playverse-tunnel-rush-best";

function loadBest(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(BEST_KEY) ?? "0", 10) || 0;
}

function saveBest(n: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BEST_KEY, String(n));
}

export function useTunnelRush() {
  const [hud, setHud] = useState<TunnelRushState>(createInitialState);
  const [bestScore, setBestScore] = useState(0);
  const stateRef = useRef<TunnelRushState>(createInitialState());
  const rafRef = useRef<number | null>(null);
  const lastTs = useRef(0);

  useEffect(() => {
    setBestScore(loadBest());
  }, []);

  const push = useCallback(() => {
    const s = stateRef.current;
    setHud({
      ...s,
      obstacles: s.obstacles.map((o) => ({ ...o })),
    });
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const loop = useCallback(
    (ts: number) => {
      if (!lastTs.current) lastTs.current = ts;
      const dt = Math.min(0.05, (ts - lastTs.current) / 1000);
      lastTs.current = ts;
      if (stateRef.current.phase === "playing") {
        stateRef.current = step(stateRef.current, dt);
        push();
        if (stateRef.current.phase === "lost") {
          const best = Math.max(stateRef.current.score, loadBest());
          saveBest(best);
          setBestScore(best);
          rafRef.current = null;
          return;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    },
    [push],
  );

  const ensure = useCallback(() => {
    if (rafRef.current !== null) return;
    lastTs.current = 0;
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const begin = useCallback(() => {
    stateRef.current = start();
    push();
    ensure();
  }, [ensure, push]);

  const go = useCallback(
    (delta: -1 | 1) => {
      stateRef.current = moveLane(stateRef.current, delta);
      push();
      if (stateRef.current.phase === "ready") begin();
    },
    [begin, push],
  );

  const reset = useCallback(() => {
    stop();
    stateRef.current = createInitialState();
    push();
  }, [stop, push]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        go(-1);
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        go(1);
      }
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (stateRef.current.phase === "ready") begin();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, begin]);

  useEffect(() => () => stop(), [stop]);

  return { state: hud, stateRef, bestScore, begin, go, reset };
}
