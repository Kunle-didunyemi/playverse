"use client";

import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  SignInButton,
  SignOutButton,
  useAuth,
  UserButton,
} from "@clerk/nextjs";

const AFTER_SIGN_OUT = "/games";

export default function GamesAuthCorner() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();

  const isGamesLobby =
    pathname === "/games" || pathname === "/games/";

  if (!isLoaded || isGamesLobby) return null;

  return (
    <div className="pointer-events-none fixed top-[max(1rem,env(safe-area-inset-top))] right-4 z-[60] flex items-center gap-2 md:right-6">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-[#08020f]/90 px-1 py-1 shadow-lg shadow-black/30 backdrop-blur-md">
        {!isSignedIn ? (
          <SignInButton mode="modal">
            <button
              type="button"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              Sign in
            </button>
          </SignInButton>
        ) : (
          <>
            <SignOutButton redirectUrl={AFTER_SIGN_OUT}>
              <button
                type="button"
                aria-label="Log out"
                title="Log out"
                className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </SignOutButton>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
