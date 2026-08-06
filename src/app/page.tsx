import { Navbar } from "@/components/landing/navbar";
import { Hero, } from "@/components/landing/hero";
import { TrustStrip } from "@/components/landing/sections";
import { Features } from "@/components/landing/sections";
import { HowItWorks } from "@/components/landing/sections";
import { Pricing } from "@/components/landing/sections";
import { FAQ } from "@/components/landing/sections";
import { FinalCTA } from "@/components/landing/sections";
import { Footer } from "@/components/landing/sections";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <TrustStrip />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
