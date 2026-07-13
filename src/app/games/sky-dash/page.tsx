import type { Metadata } from "next";
import SkyDashGameShell from "@/components/games/sky-dash/GameShell";

export const metadata: Metadata = {
  title: "Sky Dash | Playverse",
  description: "Flap through endless gates. How far can you dash on Playverse?",
};

export default function SkyDashPage() {
  return <SkyDashGameShell />;
}
