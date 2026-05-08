"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type Direction,
  type SnakeState,
  GRID_SIZE,
  changeDirection,
  createInitialState,
  tick,
} from "./engine";

const BEST_SCORE_KEY = "playverse-snake-best";

function loadBestScore(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(BEST_SCORE_KEY);
  return stored ? parseInt(stored, 10) || 0 : 0;
}

function saveBestScore(score: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BEST_SCORE_KEY, String(score));
}

const COLORS = {
  bg: "#0d0618",
  grid: "#150d26",
  snakeHead: "#22d3ee",
  snakeBody: "#7c3aed",
  snakeTail: "#4c1d95",
  food: "#f472b6",
  foodGlow: "rgba(244, 114, 182, 0.4)",
};

function drawGame(ctx: CanvasRenderingContext2D, state: SnakeState, canvasSize: number) {
  const cellSize = canvasSize / GRID_SIZE;

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      ctx.fillStyle = COLORS.grid;
      const pad = 1;
      ctx.fillRect(
        x * cellSize + pad,
        y * cellSize + pad,
        cellSize - pad * 2,
        cellSize - pad * 2
      );
    }
  }

  ctx.shadowColor = COLORS.foodGlow;
  ctx.shadowBlur = 12;
  ctx.fillStyle = COLORS.food;
  const foodPad = 2;
  ctx.beginPath();
  ctx.arc(
    state.food.x * cellSize + cellSize / 2,
    state.food.y * cellSize + cellSize / 2,
    cellSize / 2 - foodPad,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  const len = state.snake.length;
  for (let i = len - 1; i >= 0; i--) {
    const p = state.snake[i];
    const t = i / Math.max(len - 1, 1);

    if (i === 0) {
      ctx.fillStyle = COLORS.snakeHead;
    } else {
      const r = lerp(0x4c, 0x7c, 1 - t);
      const g = lerp(0x1d, 0x3a, 1 - t);
      const b = lerp(0x95, 0xed, 1 - t);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
    }

    const pad = i === 0 ? 1 : 2;
    const radius = i === 0 ? 5 : 4;

    roundRect(
      ctx,
      p.x * cellSize + pad,
      p.y * cellSize + pad,
      cellSize - pad * 2,
      cellSize - pad * 2,
      radius
    );
  }
}

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

export function useSnake() {
  const [state, setState] = useState<SnakeState>(createInitialState);
  const [bestScore, setBestScore] = useState(0);
  const [started, setStarted] = useState(false);
  const stateRef = useRef(state);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loopRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);

  stateRef.current = state;

  useEffect(() => {
    setBestScore(loadBestScore());
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawGame(ctx, stateRef.current, canvas.width);
  }, []);

  const gameLoop = useCallback(
    (timestamp: number) => {
      const s = stateRef.current;
      if (s.gameOver) {
        draw();
        return;
      }

      if (timestamp - lastTickRef.current >= s.speed) {
        const next = tick(s);
        setState(next);
        stateRef.current = next;
        lastTickRef.current = timestamp;

        if (next.gameOver) {
          const best = Math.max(next.score, loadBestScore());
          saveBestScore(best);
          setBestScore(best);
        }
      }

      draw();
      loopRef.current = requestAnimationFrame(gameLoop);
    },
    [draw]
  );

  const start = useCallback(() => {
    if (loopRef.current) cancelAnimationFrame(loopRef.current);
    const fresh = createInitialState();
    setState(fresh);
    stateRef.current = fresh;
    setStarted(true);
    lastTickRef.current = performance.now();
    loopRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  const reset = useCallback(() => {
    start();
  }, [start]);

  useEffect(() => {
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, []);

  const handleDirection = useCallback((dir: Direction) => {
    const next = changeDirection(stateRef.current, dir);
    setState(next);
    stateRef.current = next;
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const map: Record<string, Direction> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        if (!started) {
          start();
          return;
        }
        handleDirection(dir);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleDirection, started, start]);

  useEffect(() => {
    draw();
  }, [draw]);

  return {
    canvasRef,
    state,
    bestScore,
    started,
    start,
    reset,
    handleDirection,
  };
}
