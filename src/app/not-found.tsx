import type { Metadata } from "next";
import Link from "next/link";
import { Ghost } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Page not found | Playverse",
  description: "That page doesn’t exist or was moved.",
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col bg-[#08020f] pt-28 pb-20">
        <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/5">
            <Ghost className="h-8 w-8 text-violet-400" aria-hidden />
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
            404
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Page not found
          </h1>
          <p className="mt-3 text-base text-zinc-400">
            Nothing lives at this URL. Try the home page or pick a game.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 shadow-md transition-transform hover:-translate-y-0.5"
            >
              Go home
            </Link>
            <Link
              href="/games"
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-white/25 hover:bg-white/10"
            >
              Browse games
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
