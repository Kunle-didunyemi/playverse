import GamesAuthCorner from "@/components/games/GamesAuthCorner";

export default function GamesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <GamesAuthCorner />
      {children}
    </>
  );
}
