"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type CubeStackState,
  createInitialState,
  drop,
  start,
  tickMoving,
} from "./engine";

const BEST_KEY = "playverse-cube-stack-best";

function loadBest(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(BEST_KEY) ?? "0", 10) || 0;
}

function saveBest(n: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BEST_KEY, String(n));
}

export function useCubeStack() {
  const [hud, setHud] = useState<CubeStackState>(createInitialState);
  const [bestScore, setBestScore] = useState(0);
  const stateRef = useRef<CubeStackState>(createInitialState());
  const rafRef = useRef<number | null>(null);
  const lastTs = useRef(0);

  useEffect(() => {
    setBestScore(loadBest());
  }, []);

  const push = useCallback(() => {
    const s = stateRef.current;
    setHud({
      ...s,
      stack: s.stack.map((x) => ({ ...x })),
      moving: { ...s.moving },
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
        stateRef.current = tickMoving(stateRef.current, dt);
        push();
      }
      if (stateRef.current.phase === "lost") {
        const best = Math.max(stateRef.current.score, loadBest());
        saveBest(best);
        setBestScore(best);
        rafRef.current = null;
        return;
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
    stateRef.current = start(stateRef.current);
    push();
    ensure();
  }, [ensure, push]);

  const place = useCallback(() => {
    if (stateRef.current.phase === "ready") {
      begin();
      return;
    }
    if (stateRef.current.phase !== "playing") return;
    stateRef.current = drop(stateRef.current);
    push();
    if (stateRef.current.phase === "lost") {
      const best = Math.max(stateRef.current.score, loadBest());
      saveBest(best);
      setBestScore(best);
      stop();
    } else {
      ensure();
    }
  }, [begin, ensure, push, stop]);

  const reset = useCallback(() => {
    stop();
    stateRef.current = createInitialState();
    push();
  }, [stop, push]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        place();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [place]);

  useEffect(() => () => stop(), [stop]);

  return { state: hud, stateRef, bestScore, begin, place, reset };
}
