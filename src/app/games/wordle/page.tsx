import type { Metadata } from "next";
import WordleGameShell from "@/components/games/wordle/GameShell";

export const metadata: Metadata = {
  title: "Wordle | Playverse",
  description:
    "Guess the five-letter word in six tries — daily puzzle resets each UTC day with leaderboard scoring.",
};

export default function WordlePage() {
  return <WordleGameShell />;
}
