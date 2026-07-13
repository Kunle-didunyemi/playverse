import type { Metadata } from "next";
import MemoryGameShell from "@/components/games/memory/GameShell";

export const metadata: Metadata = {
  title: "Memory | Playverse",
  description: "Flip cards and match pairs. A classic memory challenge on Playverse.",
};

export default function MemoryPage() {
  return <MemoryGameShell />;
}
