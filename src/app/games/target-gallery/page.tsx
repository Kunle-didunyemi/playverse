import type { Metadata } from "next";
import TargetGalleryGameShell from "@/components/games/target-gallery/GameShell";

export const metadata: Metadata = {
  title: "Target Gallery | Playverse",
  description: "Pop floating 3D targets against the clock. Aim true on Playverse.",
};

export default function TargetGalleryPage() {
  return <TargetGalleryGameShell />;
}
