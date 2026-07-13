import type { Metadata } from "next";
import CubeStackGameShell from "@/components/games/cube-stack/GameShell";

export const metadata: Metadata = {
  title: "Cube Stack | Playverse",
  description: "Drop slabs and build the tallest tower. A 3D stacking challenge on Playverse.",
};

export default function CubeStackPage() {
  return <CubeStackGameShell />;
}
