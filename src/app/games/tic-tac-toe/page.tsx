import type { Metadata } from "next";
import TicTacToeGameShell from "@/components/games/tic-tac-toe/GameShell";

export const metadata: Metadata = {
  title: "Tic-Tac-Toe | Playverse",
  description:
    "Classic 3×3 Tic-Tac-Toe — you are X vs a minimax AI. Built for the browser with leaderboard scores.",
};

export default function TicTacToePage() {
  return <TicTacToeGameShell />;
}
