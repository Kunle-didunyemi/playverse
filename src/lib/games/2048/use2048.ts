"use client";

import { useCallback, useEffect, useReducer } from "react";
import {
  type Direction,
  type Tile,
  addRandomTile,
  createInitialTiles,
  hasWon,
  isGameOver,
  move,
} from "./engine";

const BEST_SCORE_KEY = "playverse-2048-best";

interface State {
  tiles: Tile[];
  score: number;
  bestScore: number;
  gameOver: boolean;
  won: boolean;
  keepPlaying: boolean;
}

type Action =
  | { type: "MOVE"; direction: Direction }
  | { type: "RESET" }
  | { type: "KEEP_PLAYING" }
  | { type: "INIT"; bestScore: number };

function loadBestScore(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(BEST_SCORE_KEY);
  return stored ? parseInt(stored, 10) || 0 : 0;
}

function saveBestScore(score: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BEST_SCORE_KEY, String(score));
}

function freshState(bestScore: number): State {
  return {
    tiles: createInitialTiles(),
    score: 0,
    bestScore,
    gameOver: false,
    won: false,
    keepPlaying: false,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "INIT":
      return { ...state, bestScore: action.bestScore };

    case "RESET": {
      return freshState(state.bestScore);
    }

    case "KEEP_PLAYING":
      return { ...state, keepPlaying: true, won: false };

    case "MOVE": {
      if (state.gameOver || (state.won && !state.keepPlaying)) return state;

      const result = move(state.tiles, action.direction);
      if (!result.moved) return state;

      const newTiles = addRandomTile(result.tiles);
      const newScore = state.score + result.scoreGained;
      const newBest = Math.max(newScore, state.bestScore);

      if (newBest > state.bestScore) saveBestScore(newBest);

      const won = !state.keepPlaying && hasWon(newTiles);
      const gameOver = !won && isGameOver(newTiles);

      return {
        ...state,
        tiles: newTiles,
        score: newScore,
        bestScore: newBest,
        gameOver,
        won,
      };
    }

    default:
      return state;
  }
}

export function use2048() {
  const [state, dispatch] = useReducer(reducer, freshState(0));

  useEffect(() => {
    dispatch({ type: "INIT", bestScore: loadBestScore() });
  }, []);

  const handleMove = useCallback((direction: Direction) => {
    dispatch({ type: "MOVE", direction });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const keepPlaying = useCallback(() => {
    dispatch({ type: "KEEP_PLAYING" });
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
        handleMove(dir);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleMove]);

  return {
    tiles: state.tiles,
    score: state.score,
    bestScore: state.bestScore,
    gameOver: state.gameOver,
    won: state.won,
    move: handleMove,
    reset,
    keepPlaying,
  };
}
