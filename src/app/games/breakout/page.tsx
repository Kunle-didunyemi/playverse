import type { Metadata } from "next";
import BreakoutGameShell from "@/components/games/breakout/GameShell";

export const metadata: Metadata = {
  title: "Breakout | Playverse",
  description: "Bounce the ball and smash every brick. Arcade Breakout on Playverse.",
};

export default function BreakoutPage() {
  return <BreakoutGameShell />;
}
