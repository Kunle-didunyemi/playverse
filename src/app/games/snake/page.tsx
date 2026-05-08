import type { Metadata } from "next";
import SnakeGameShell from "@/components/games/snake/GameShell";

export const metadata: Metadata = {
  title: "Snake | Playverse",
  description:
    "Guide the snake, eat food, and grow longer. Classic arcade action on Playverse.",
};

export default function SnakePage() {
  return <SnakeGameShell />;
}
