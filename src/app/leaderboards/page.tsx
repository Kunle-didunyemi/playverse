import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeaderboardClient from "./LeaderboardClient";

export const metadata: Metadata = {
  title: "Leaderboards | Playverse",
  description:
    "See who tops the charts across all games on Playverse.",
};

export default function LeaderboardsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#08020f] pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-10">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Leaderboards
            </h1>
            <p className="mt-3 max-w-xl text-lg text-zinc-400">
              Top players across every game. Can you claim the #1 spot?
            </p>
          </div>
          <LeaderboardClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
