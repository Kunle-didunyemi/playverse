"use client";

import { useCallback, useState } from "react";
import { pickDailySolution, pickRandomPracticeSolution } from "./daily";
import {
  MAX_GUESSES,
  WORD_LENGTH,
  betterLetterResult,
  scoreGuess,
  type LetterResult,
} from "./engine";
import { isValidWord } from "./words";

export type RowEntry = { guess: string; scores: LetterResult[] };

export function useWordle() {
  const [solution, setSolution] = useState(() => pickDailySolution());

  const [rows, setRows] = useState<RowEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [shakeRow, setShakeRow] = useState(false);
  const [phase, setPhase] = useState<"playing" | "won" | "lost">("playing");
  const [keyHints, setKeyHints] = useState<Record<string, LetterResult>>({});

  const bumpShake = useCallback(() => {
    setShakeRow(true);
    window.setTimeout(() => setShakeRow(false), 500);
  }, []);

  const submitGuess = useCallback(() => {
    if (phase !== "playing") return;

    const word = draft.toUpperCase();
    if (word.length !== WORD_LENGTH) return;

    if (!isValidWord(word)) {
      bumpShake();
      return;
    }

    const scores = scoreGuess(solution, word);

    setRows((prev) => {
      const next = [...prev, { guess: word, scores }];
      if (word === solution) {
        queueMicrotask(() => setPhase("won"));
      } else if (next.length >= MAX_GUESSES) {
        queueMicrotask(() => setPhase("lost"));
      }
      return next;
    });

    setKeyHints((prev) => {
      const next = { ...prev };
      for (let i = 0; i < WORD_LENGTH; i++) {
        const ch = word[i];
        next[ch] = betterLetterResult(next[ch], scores[i]);
      }
      return next;
    });

    setDraft("");
  }, [bumpShake, draft, phase, solution]);

  const onKey = useCallback(
    (raw: string) => {
      if (phase !== "playing") return;
      const k = raw.toUpperCase();

      if (k === "ENTER") {
        submitGuess();
        return;
      }
      if (k === "BACKSPACE" || k === "BACK") {
        setDraft((d) => d.slice(0, -1));
        return;
      }
      if (/^[A-Z]$/.test(k) && draft.length < WORD_LENGTH) {
        setDraft((d) => (d + k).slice(0, WORD_LENGTH));
      }
    },
    [draft.length, phase, submitGuess],
  );

  const resetRound = useCallback(() => {
    setRows([]);
    setDraft("");
    setPhase("playing");
    setKeyHints({});
    setShakeRow(false);
  }, []);

  const newPracticeRound = useCallback(() => {
    setSolution((prev) => pickRandomPracticeSolution(prev));
    setRows([]);
    setDraft("");
    setPhase("playing");
    setKeyHints({});
    setShakeRow(false);
  }, []);

  return {
    solution,
    rows,
    draft,
    phase,
    shakeRow,
    keyHints,
    onKey,
    resetRound,
    newPracticeRound,
  };
}
