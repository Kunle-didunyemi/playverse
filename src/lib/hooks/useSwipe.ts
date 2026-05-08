"use client";

import { useRef, useCallback, type RefObject } from "react";
import type { Direction } from "@/lib/games/2048/engine";

const MIN_DISTANCE = 30;

export function useSwipe(
  onSwipe: (direction: Direction) => void
): {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  ref: RefObject<HTMLDivElement | null>;
} {
  const ref = useRef<HTMLDivElement | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!startPos.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startPos.current.x;
      const dy = touch.clientY - startPos.current.y;
      startPos.current = null;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) < MIN_DISTANCE) return;

      if (absDx > absDy) {
        onSwipe(dx > 0 ? "right" : "left");
      } else {
        onSwipe(dy > 0 ? "down" : "up");
      }
    },
    [onSwipe]
  );

  return { onTouchStart, onTouchEnd, ref };
}
