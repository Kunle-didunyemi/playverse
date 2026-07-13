"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  emptyBoard,
  getOutcome,
  pickAiMove,
  type Cell,
  type Difficulty,
  type Outcome,
} from "./engine";

const AI_DELAY_MS = 380;

export function useTicTacToe() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [board, setBoard] = useState<Cell[]>(() => emptyBoard());
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundRef = useRef(0);
  const difficultyRef = useRef<Difficulty | null>(null);

  difficultyRef.current = difficulty;

  const clearTimer = useCallback(() => {
    if (aiTimerRef.current !== null) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    roundRef.current += 1;
    clearTimer();
    setBoard(emptyBoard());
    setOutcome(null);
    setAiThinking(false);
    setDifficulty(null);
  }, [clearTimer]);

  const start = useCallback(
    (next: Difficulty) => {
      roundRef.current += 1;
      clearTimer();
      setDifficulty(next);
      setBoard(emptyBoard());
      setOutcome(null);
      setAiThinking(false);
    },
    [clearTimer],
  );

  useEffect(() => () => clearTimer(), [clearTimer]);

  const playHumanCell = useCallback(
    (index: number) => {
      const level = difficultyRef.current;
      if (
        level === null ||
        outcome !== null ||
        aiThinking ||
        board[index] !== null
      ) {
        return;
      }

      const roundAtMove = roundRef.current;

      const afterHuman = [...board];
      afterHuman[index] = "X";
      setBoard(afterHuman);

      const humanEnd = getOutcome(afterHuman);
      if (humanEnd !== null) {
        setOutcome(humanEnd);
        return;
      }

      setAiThinking(true);
      clearTimer();
      aiTimerRef.current = setTimeout(() => {
        aiTimerRef.current = null;
        if (roundRef.current !== roundAtMove) return;

        const chosen = pickAiMove(afterHuman, level);
        if (chosen === null) {
          setAiThinking(false);
          return;
        }
        const afterAi = [...afterHuman];
        afterAi[chosen] = "O";
        setBoard(afterAi);
        const finalEnd = getOutcome(afterAi);
        if (finalEnd !== null) {
          setOutcome(finalEnd);
        }
        setAiThinking(false);
      }, AI_DELAY_MS);
    },
    [board, outcome, aiThinking, clearTimer],
  );

  return {
    difficulty,
    board,
    outcome,
    aiThinking,
    playHumanCell,
    start,
    reset,
  };
}
