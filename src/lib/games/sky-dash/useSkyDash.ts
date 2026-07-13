"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type SkyDashState,
  createInitialState,
  flap,
  start,
  step,
} from "./engine";

const BEST_KEY = "playverse-sky-dash-best";

function loadBest(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(BEST_KEY) ?? "0", 10) || 0;
}

function saveBest(score: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BEST_KEY, String(score));
}

export function useSkyDash() {
  const [hud, setHud] = useState<SkyDashState>(createInitialState);
  const [bestScore, setBestScore] = useState(0);
  const stateRef = useRef<SkyDashState>(createInitialState());
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(0);

  useEffect(() => {
    setBestScore(loadBest());
  }, []);

  const pushHud = useCallback(() => {
    const s = stateRef.current;
    setHud({
      ...s,
      pipes: s.pipes.map((p) => ({ ...p })),
    });
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
      if (s.phase === "playing") {
        s = step(s, dt);
        stateRef.current = s;
        pushHud();
        if (s.phase === "lost") {
          const best = Math.max(s.score, loadBest());
          saveBest(best);
          setBestScore(best);
          rafRef.current = null;
          return;
        }
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

  const doFlap = useCallback(() => {
    const next = flap(stateRef.current);
    stateRef.current = next;
    pushHud();
    ensureLoop();
  }, [ensureLoop, pushHud]);

  const reset = useCallback(() => {
    stopLoop();
    const fresh = createInitialState();
    stateRef.current = fresh;
    pushHud();
  }, [stopLoop, pushHud]);

  const begin = useCallback(() => {
    const next = start(stateRef.current);
    stateRef.current = next;
    pushHud();
    ensureLoop();
  }, [ensureLoop, pushHud]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w") {
        e.preventDefault();
        doFlap();
      }
      if (e.key === "Enter" && stateRef.current.phase === "ready") {
        e.preventDefault();
        begin();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doFlap, begin]);

  useEffect(() => () => stopLoop(), [stopLoop]);

  return { state: hud, bestScore, doFlap, begin, reset };
}
