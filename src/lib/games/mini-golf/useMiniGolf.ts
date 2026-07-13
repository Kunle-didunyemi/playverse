"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type MiniGolfState,
  advanceHole,
  beginCharge,
  createInitialState,
  releasePutt,
  retryHole,
  rotateAim,
  setAimAngle,
  skipFailedHole,
  startCourse,
  stepRolling,
  updateCharge,
} from "./engine";

const BEST_SCORE_KEY = "playverse-minigolf-best";
const HUD_INTERVAL_MS = 80;

function loadBestScore(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(BEST_SCORE_KEY);
  return stored ? parseInt(stored, 10) || 0 : 0;
}

function saveBestScore(score: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BEST_SCORE_KEY, String(score));
}

function snapshot(s: MiniGolfState): MiniGolfState {
  return {
    ...s,
    ball: { ...s.ball },
    vel: { ...s.vel },
  };
}

export function useMiniGolf() {
  const [hud, setHud] = useState<MiniGolfState>(createInitialState);
  const [bestScore, setBestScore] = useState(0);
  const stateRef = useRef<MiniGolfState>(createInitialState());
  const keysRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(0);
  const lastHudRef = useRef(0);

  useEffect(() => {
    setBestScore(loadBestScore());
  }, []);

  const pushHud = useCallback((force = false) => {
    const now = performance.now();
    if (!force && now - lastHudRef.current < HUD_INTERVAL_MS) return;
    lastHudRef.current = now;
    setHud(snapshot(stateRef.current));
  }, []);

  const finishIfNeeded = useCallback(
    (next: MiniGolfState) => {
      if (next.phase === "course_done") {
        const best = Math.max(next.score, loadBestScore());
        saveBestScore(best);
        setBestScore(best);
      }
    },
    [],
  );

  const tick = useCallback(
    (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;

      let s = stateRef.current;

      if (keysRef.current.has("ArrowLeft") || keysRef.current.has("a")) {
        s = rotateAim(s, -2.2 * dt);
      }
      if (keysRef.current.has("ArrowRight") || keysRef.current.has("d")) {
        s = rotateAim(s, 2.2 * dt);
      }

      if (s.charging) {
        s = updateCharge(s, dt);
      }

      if (s.phase === "rolling") {
        s = stepRolling(s, dt);
      }

      stateRef.current = s;

      if (s.charging || s.phase === "rolling" || s.phase === "aiming") {
        pushHud(s.charging || s.phase !== "aiming");
      }

      if (s.phase === "course_done") {
        finishIfNeeded(s);
        pushHud(true);
        rafRef.current = null;
        return;
      }

      if (
        s.phase === "hole_done" ||
        s.phase === "hole_fail" ||
        s.phase === "ready"
      ) {
        pushHud(true);
        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [pushHud, finishIfNeeded],
  );

  const ensureLoop = useCallback(() => {
    if (rafRef.current !== null) return;
    lastTsRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    const next = startCourse(stateRef.current);
    stateRef.current = next;
    pushHud(true);
    ensureLoop();
  }, [ensureLoop, pushHud]);

  const nextHole = useCallback(() => {
    if (stateRef.current.phase !== "hole_done") return;
    const next = advanceHole(stateRef.current);
    stateRef.current = next;
    pushHud(true);
    if (next.phase === "course_done") {
      finishIfNeeded(next);
      return;
    }
    ensureLoop();
  }, [ensureLoop, pushHud, finishIfNeeded]);

  const retry = useCallback(() => {
    const next = retryHole(stateRef.current);
    stateRef.current = next;
    pushHud(true);
    ensureLoop();
  }, [ensureLoop, pushHud]);

  const skipHole = useCallback(() => {
    const next = skipFailedHole(stateRef.current);
    stateRef.current = next;
    pushHud(true);
    if (next.phase === "course_done") {
      finishIfNeeded(next);
      return;
    }
    ensureLoop();
  }, [ensureLoop, pushHud, finishIfNeeded]);

  const reset = useCallback(() => {
    stopLoop();
    keysRef.current.clear();
    const fresh = createInitialState();
    stateRef.current = fresh;
    pushHud(true);
  }, [stopLoop, pushHud]);

  const chargeStart = useCallback(() => {
    if (stateRef.current.phase !== "aiming") return;
    stateRef.current = beginCharge(stateRef.current);
    pushHud(true);
    ensureLoop();
  }, [ensureLoop, pushHud]);

  const chargeEnd = useCallback(() => {
    if (!stateRef.current.charging) return;
    stateRef.current = releasePutt(stateRef.current);
    pushHud(true);
    ensureLoop();
  }, [ensureLoop, pushHud]);

  const aimToward = useCallback(
    (worldX: number, worldZ: number) => {
      const s = stateRef.current;
      if (s.phase !== "aiming") return;
      const angle = Math.atan2(worldZ - s.ball.z, worldX - s.ball.x);
      stateRef.current = setAimAngle(s, angle);
      pushHud(true);
    },
    [pushHud],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      ) {
        return;
      }

      if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D"].includes(e.key)) {
        e.preventDefault();
        keysRef.current.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
        ensureLoop();
      }

      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (stateRef.current.phase === "ready") start();
        else if (stateRef.current.phase === "hole_done") nextHole();
        else if (stateRef.current.phase === "aiming" && !stateRef.current.charging) {
          chargeStart();
        }
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (stateRef.current.phase === "ready") start();
        else if (stateRef.current.phase === "hole_done") nextHole();
        else if (stateRef.current.phase === "hole_fail") skipHole();
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      keysRef.current.delete(e.key);
      keysRef.current.delete(e.key.toLowerCase());
      if (e.key === " " || e.key === "Spacebar") {
        chargeEnd();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [start, nextHole, skipHole, chargeStart, chargeEnd, ensureLoop]);

  useEffect(() => () => stopLoop(), [stopLoop]);

  return {
    state: hud,
    stateRef,
    bestScore,
    start,
    nextHole,
    retry,
    skipHole,
    reset,
    chargeStart,
    chargeEnd,
    aimToward,
  };
}
