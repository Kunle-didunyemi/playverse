import { Gamepad2 } from "lucide-react";
import Link from "next/link";

const COLUMNS = [
  {
    title: "Platform",
    links: ["Games", "Leaderboards", "Tournaments", "Friends"],
  },
  {
    title: "Build",
    links: ["Submit a game", "SDK docs", "Open source", "Discord"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Contact"],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black py-16">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/40">
              <Gamepad2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-semibold tracking-tight text-white">
              Playverse
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-zinc-500">
            Where every game lives. 2D classics, 3D worlds, real-time
            multiplayer — all in your browser.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-widest text-zinc-400">
              {col.title}
            </h4>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl flex-col items-start justify-between gap-3 border-t border-white/10 px-6 pt-8 text-sm text-zinc-500 sm:flex-row sm:items-center">
        <p>© {new Date().getFullYear()} Playverse. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-white">
            Privacy
          </Link>
          <Link href="#" className="hover:text-white">
            Terms
          </Link>
          <Link href="#" className="hover:text-white">
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}
