"use client";

import { motion } from "framer-motion";
import type { Tile as TileData } from "@/lib/games/2048/engine";

const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2: { bg: "#2d2250", text: "#e2dff0" },
  4: { bg: "#352a60", text: "#e2dff0" },
  8: { bg: "#7c3aed", text: "#ffffff" },
  16: { bg: "#8b5cf6", text: "#ffffff" },
  32: { bg: "#a855f7", text: "#ffffff" },
  64: { bg: "#d946ef", text: "#ffffff" },
  128: { bg: "#22d3ee", text: "#0c1825" },
  256: { bg: "#06b6d4", text: "#0c1825" },
  512: { bg: "#0891b2", text: "#ffffff" },
  1024: { bg: "#facc15", text: "#1a1128" },
  2048: { bg: "#fbbf24", text: "#1a1128" },
};

const DEFAULT_COLOR = { bg: "#f472b6", text: "#1a1128" };

function getFontSize(value: number): string {
  if (value < 100) return "text-3xl sm:text-4xl";
  if (value < 1000) return "text-2xl sm:text-3xl";
  return "text-lg sm:text-2xl";
}

interface TileProps {
  tile: TileData;
  cellSize: number;
  gap: number;
}

export default function Tile({ tile, cellSize, gap }: TileProps) {
  const { bg, text } = TILE_COLORS[tile.value] ?? DEFAULT_COLOR;

  const x = tile.col * (cellSize + gap);
  const y = tile.row * (cellSize + gap);

  return (
    <motion.div
      layout
      key={tile.id}
      initial={
        tile.isNew
          ? { scale: 0, x, y }
          : tile.isMerged
            ? { scale: 0.85, x, y }
            : { x, y }
      }
      animate={{
        x,
        y,
        scale: 1,
      }}
      transition={{
        x: { type: "tween", duration: 0.12, ease: "easeOut" },
        y: { type: "tween", duration: 0.12, ease: "easeOut" },
        scale: tile.isNew
          ? { type: "spring", stiffness: 400, damping: 20, delay: 0.1 }
          : tile.isMerged
            ? { type: "spring", stiffness: 350, damping: 18 }
            : { duration: 0 },
      }}
      className={`absolute flex items-center justify-center rounded-xl font-bold select-none ${getFontSize(tile.value)}`}
      style={{
        width: cellSize,
        height: cellSize,
        backgroundColor: bg,
        color: text,
        zIndex: tile.isMerged ? 10 : 1,
      }}
    >
      {tile.value}
    </motion.div>
  );
}
