import type { Metadata } from "next";
import GameShell from "@/components/games/2048/GameShell";

export const metadata: Metadata = {
  title: "2048 | Playverse",
  description:
    "Slide and merge tiles to reach 2048. A classic number puzzle on Playverse.",
};

export default function Game2048Page() {
  return <GameShell />;
}
