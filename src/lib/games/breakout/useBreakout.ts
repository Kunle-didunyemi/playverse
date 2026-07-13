"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type BreakoutState,
  W,
  createInitialState,
  launch,
  setPaddle,
  step,
} from "./engine";

const BEST_KEY = "playverse-breakout-best";

function loadBest(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(BEST_KEY) ?? "0", 10) || 0;
}

function saveBest(score: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BEST_KEY, String(score));
}

export function useBreakout() {
  const [hud, setHud] = useState<BreakoutState>(createInitialState);
  const [bestScore, setBestScore] = useState(0);
  const stateRef = useRef<BreakoutState>(createInitialState());
  const keysRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(0);

  useEffect(() => {
    setBestScore(loadBest());
  }, []);

  const pushHud = useCallback(() => {
    setHud({ ...stateRef.current, bricks: stateRef.current.bricks.map((b) => ({ ...b })) });
  }, []);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const tick = useCallback(
    (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min(0.04, (ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;

      let s = stateRef.current;
      const keys = keysRef.current;
      if (keys.has("ArrowLeft") || keys.has("a")) {
        s = setPaddle(s, s.paddleX - 380 * dt);
      }
      if (keys.has("ArrowRight") || keys.has("d")) {
        s = setPaddle(s, s.paddleX + 380 * dt);
      }

      if (s.phase === "playing") {
        s = step(s, dt);
      }

      stateRef.current = s;
      pushHud();

      if (s.phase === "won" || s.phase === "lost") {
        const best = Math.max(s.score, loadBest());
        saveBest(best);
        setBestScore(best);
        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [pushHud],
  );

  const ensureLoop = useCallback(() => {
    if (rafRef.current !== null) return;
    lastTsRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const start = useCallback(() => {
    const next = launch(stateRef.current);
    stateRef.current = next;
    pushHud();
    ensureLoop();
  }, [ensureLoop, pushHud]);

  const reset = useCallback(() => {
    stopLoop();
    keysRef.current.clear();
    const fresh = createInitialState();
    stateRef.current = fresh;
    pushHud();
  }, [stopLoop, pushHud]);

  const movePaddleTo = useCallback(
    (clientX: number, rectLeft: number, rectWidth: number) => {
      const ratio = (clientX - rectLeft) / rectWidth;
      const x = ratio * W - 39;
      stateRef.current = setPaddle(stateRef.current, x);
      pushHud();
      ensureLoop();
    },
    [pushHud, ensureLoop],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D"].includes(e.key)) {
        e.preventDefault();
        keysRef.current.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
        ensureLoop();
      }
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (
          stateRef.current.phase === "ready" ||
          (stateRef.current.phase === "playing" &&
            stateRef.current.vx === 0)
        ) {
          start();
        }
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      keysRef.current.delete(e.key);
      keysRef.current.delete(e.key.toLowerCase());
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [ensureLoop, start]);

  useEffect(() => () => stopLoop(), [stopLoop]);

  return {
    state: hud,
    bestScore,
    start,
    reset,
    movePaddleTo,
  };
}
