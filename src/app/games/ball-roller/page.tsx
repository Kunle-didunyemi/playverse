import type { Metadata } from "next";
import BallRollerGameShell from "@/components/games/ball-roller/GameShell";

export const metadata: Metadata = {
  title: "Ball Roller | Playverse",
  description:
    "Tilt the maze and guide the ball to the goal. A 3D physics puzzle on Playverse.",
};

export default function BallRollerPage() {
  return <BallRollerGameShell />;
}
