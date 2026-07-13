import type { Metadata } from "next";
import MiniGolfGameShell from "@/components/games/mini-golf/GameShell";

export const metadata: Metadata = {
  title: "Mini Golf | Playverse",
  description:
    "Putt through creative 3D holes. Aim for birdies and hole-in-ones on Playverse.",
};

export default function MiniGolfPage() {
  return <MiniGolfGameShell />;
}
