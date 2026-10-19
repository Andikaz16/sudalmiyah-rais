import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import MutiaraHaditsSection from "@/components/MutiaraHaditsSection";
import DonationSection from "@/components/DonationSection";

export default function DonasiPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full">
        <MutiaraHaditsSection />
        <DonationSection />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
