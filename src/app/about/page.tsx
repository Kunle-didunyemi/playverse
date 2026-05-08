import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutThreeAnimations from "@/components/about/AboutThreeAnimations";

export const metadata: Metadata = {
  title: "About | Playverse",
  description:
    "What Playverse is, how we build it, and where we are headed — games in the browser with accounts and leaderboards.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#08020f] pt-28 pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <header className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
              About
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Games in one universe
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-zinc-400">
              Playverse is a home for fast, focused browser games — sharp UX,
              fair leaderboards, and room to grow into 3D and multiplayer
              experiences without leaving the tab you already have open.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/games"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 shadow-md transition-transform hover:-translate-y-0.5"
              >
                Browse games
              </Link>
              <Link
                href="/leaderboards"
                className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-white/25 hover:bg-white/10"
              >
                View leaderboards
              </Link>
            </div>
          </header>

          <AboutThreeAnimations />
        </div>
      </main>
      <Footer />
    </>
  );
}
