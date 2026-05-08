"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { Tile as TileData } from "@/lib/games/2048/engine";
import TileComponent from "./Tile";
import { AnimatePresence } from "framer-motion";

const SIZE = 4;
const PADDING = 10;
const GAP = 10;

interface BoardProps {
  tiles: TileData[];
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export default function Board({ tiles, onTouchStart, onTouchEnd }: BoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(0);

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth;
    const inner = w - PADDING * 2;
    setCellSize((inner - GAP * (SIZE - 1)) / SIZE);
  }, []);

  useEffect(() => {
    measure();
    const obs = new ResizeObserver(measure);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [measure]);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-[400px] aspect-square select-none touch-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="relative h-full w-full rounded-2xl"
        style={{ backgroundColor: "#1a1128", padding: PADDING }}
      >
        <div
          className="grid h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
            gap: GAP,
          }}
        >
          {Array.from({ length: SIZE * SIZE }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl"
              style={{ backgroundColor: "#251d3a" }}
            />
          ))}
        </div>

        {cellSize > 0 && (
          <div
            className="absolute inset-0"
            style={{ padding: PADDING }}
          >
            <div className="relative h-full w-full">
              <AnimatePresence>
                {tiles.map((tile) => (
                  <TileComponent
                    key={tile.id}
                    tile={tile}
                    cellSize={cellSize}
                    gap={GAP}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
