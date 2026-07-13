"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type BallRollerState,
  type TiltInput,
  MAX_TILT,
  advanceLevel,
  createInitialState,
  startOrResume,
  step,
} from "./engine";

const BEST_SCORE_KEY = "playverse-ball-roller-best";
const HUD_INTERVAL_MS = 100;

function loadBestScore(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(BEST_SCORE_KEY);
  return stored ? parseInt(stored, 10) || 0 : 0;
}

function saveBestScore(score: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BEST_SCORE_KEY, String(score));
}

function snapshot(s: BallRollerState): BallRollerState {
  return {
    ...s,
    ball: { ...s.ball },
    vel: { ...s.vel },
    tilt: { ...s.tilt },
  };
}

export function useBallRoller() {
  const [hud, setHud] = useState<BallRollerState>(createInitialState);
  const [bestScore, setBestScore] = useState(0);
  const stateRef = useRef<BallRollerState>(createInitialState());
  const tiltTargetRef = useRef<TiltInput>({ x: 0, z: 0 });
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

  const syncTiltFromKeys = useCallback(() => {
    const keys = keysRef.current;
    let x = 0;
    let z = 0;
    if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) x += MAX_TILT;
    if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) x -= MAX_TILT;
    if (keys.has("ArrowDown") || keys.has("s") || keys.has("S")) z += MAX_TILT;
    if (keys.has("ArrowUp") || keys.has("w") || keys.has("W")) z -= MAX_TILT;
    tiltTargetRef.current = { x, z };
  }, []);

  const tick = useCallback(
    (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;

      const prev = stateRef.current;
      if (prev.phase === "playing") {
        const next = step(prev, dt, tiltTargetRef.current);
        stateRef.current = next;

        if (next.phase !== "playing") {
          pushHud(true);
          if (next.phase === "won_game" || next.phase === "lost") {
            const best = Math.max(next.score, loadBestScore());
            saveBestScore(best);
            setBestScore(best);
            rafRef.current = null;
            return;
          }
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        pushHud(false);
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

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    const next = startOrResume(stateRef.current);
    stateRef.current = next;
    pushHud(true);
    ensureLoop();
  }, [ensureLoop, pushHud]);

  const continueNextLevel = useCallback(() => {
    if (stateRef.current.phase !== "won_level") return;
    const next = advanceLevel(stateRef.current);
    stateRef.current = next;
    pushHud(true);
    ensureLoop();
  }, [ensureLoop, pushHud]);

  const reset = useCallback(() => {
    stopLoop();
    keysRef.current.clear();
    tiltTargetRef.current = { x: 0, z: 0 };
    const fresh = createInitialState();
    stateRef.current = fresh;
    pushHud(true);
  }, [stopLoop, pushHud]);

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

      const tracked = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "w",
        "a",
        "s",
        "d",
        "W",
        "A",
        "S",
        "D",
      ];
      if (tracked.includes(e.key)) {
        e.preventDefault();
        keysRef.current.add(e.key);
        syncTiltFromKeys();

        const phase = stateRef.current.phase;
        if (phase === "ready") start();
        if (phase === "won_level") continueNextLevel();
      }

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (stateRef.current.phase === "ready") start();
        else if (stateRef.current.phase === "won_level") continueNextLevel();
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      keysRef.current.delete(e.key);
      syncTiltFromKeys();
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [start, continueNextLevel, syncTiltFromKeys]);

  useEffect(() => () => stopLoop(), [stopLoop]);

  const setTiltFromPad = useCallback(
    (x: number, z: number) => {
      tiltTargetRef.current = {
        x: Math.max(-MAX_TILT, Math.min(MAX_TILT, x * MAX_TILT)),
        z: Math.max(-MAX_TILT, Math.min(MAX_TILT, z * MAX_TILT)),
      };
      if (stateRef.current.phase === "ready") start();
    },
    [start],
  );

  return {
    state: hud,
    stateRef,
    bestScore,
    start,
    continueNextLevel,
    reset,
    setTiltFromPad,
  };
}
