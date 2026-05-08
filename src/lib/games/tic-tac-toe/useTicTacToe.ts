"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  emptyBoard,
  getOutcome,
  pickAiMove,
  type Cell,
  type Outcome,
} from "./engine";

const AI_DELAY_MS = 380;

export function useTicTacToe() {
  const [board, setBoard] = useState<Cell[]>(() => emptyBoard());
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundRef = useRef(0);

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
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const playHumanCell = useCallback(
    (index: number) => {
      if (outcome !== null || aiThinking || board[index] !== null) return;

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

        const chosen = pickAiMove(afterHuman);
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
    board,
    outcome,
    aiThinking,
    playHumanCell,
    reset,
  };
}
