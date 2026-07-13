"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type TargetGalleryState,
  createInitialState,
  shoot,
  start,
  step,
} from "./engine";

const BEST_KEY = "playverse-target-gallery-best";

function loadBest(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(BEST_KEY) ?? "0", 10) || 0;
}

function saveBest(n: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BEST_KEY, String(n));
}

export function useTargetGallery() {
  const [hud, setHud] = useState<TargetGalleryState>(createInitialState);
  const [bestScore, setBestScore] = useState(0);
  const stateRef = useRef<TargetGalleryState>(createInitialState());
  const rafRef = useRef<number | null>(null);
  const lastTs = useRef(0);

  useEffect(() => {
    setBestScore(loadBest());
  }, []);

  const push = useCallback(() => {
    const s = stateRef.current;
    setHud({
      ...s,
      targets: s.targets.map((t) => ({ ...t })),
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
        if (stateRef.current.phase === "won") {
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

  const onHit = useCallback(
    (id: number | null) => {
      if (stateRef.current.phase !== "playing") return;
      stateRef.current = shoot(stateRef.current, id);
      push();
    },
    [push],
  );

  const reset = useCallback(() => {
    stop();
    stateRef.current = createInitialState();
    push();
  }, [stop, push]);

  useEffect(() => () => stop(), [stop]);

  return { state: hud, stateRef, bestScore, begin, onHit, reset };
}
