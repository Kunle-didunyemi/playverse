import type { Metadata } from "next";
import TunnelRushGameShell from "@/components/games/tunnel-rush/GameShell";

export const metadata: Metadata = {
  title: "Tunnel Rush | Playverse",
  description: "Dodge obstacles in a neon 3D tunnel. How far can you rush?",
};

export default function TunnelRushPage() {
  return <TunnelRushGameShell />;
}
