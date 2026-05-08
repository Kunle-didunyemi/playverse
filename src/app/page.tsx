import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import GameCategories from "@/components/sections/GameCategories";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative w-full">
        <Hero />
        <Features />
        <GameCategories />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
