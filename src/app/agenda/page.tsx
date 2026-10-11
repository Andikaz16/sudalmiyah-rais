import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import AgendaSection from "@/components/AgendaSection";

export default function AgendaPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full">
        <AgendaSection />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
