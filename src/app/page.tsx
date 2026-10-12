import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PrayerCountdownCard from "@/components/PrayerCountdownCard";
import AgendaSection from "@/components/AgendaSection";
import MasjidMuSection from "@/components/MasjidMuSection";
import FridayScheduleSection from "@/components/FridayScheduleSection";
import DonationSection from "@/components/DonationSection";
import NewsSection from "@/components/NewsSection";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import AnimatedSection from "@/components/AnimatedSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans selection:bg-[#C59B27] selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Full-Bleed HD Hero Banner */}
        <HeroSection />

        {/* Floating Live Prayer Times Card Container */}
        <section className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 mb-8 sm:mb-12">
          <AnimatedSection animation="scale-up" duration={700}>
            <PrayerCountdownCard />
          </AnimatedSection>
        </section>

        {/* Pilar & Keunggulan MasjidMu Percontohan */}
        <AnimatedSection animation="fade-up" duration={700}>
          <MasjidMuSection />
        </AnimatedSection>

        {/* Agendas Section */}
        <AnimatedSection animation="fade-up" duration={700}>
          <AgendaSection />
        </AnimatedSection>

        {/* Jadwal Petugas Shalat & Khatib Pekan Ini */}
        <AnimatedSection animation="fade-up" duration={700}>
          <FridayScheduleSection />
        </AnimatedSection>

        {/* Infaq Digital & QRIS Section */}
        <AnimatedSection animation="fade-up" duration={700}>
          <DonationSection />
        </AnimatedSection>

        {/* Kabar Persyarikatan & Warta Kampus (UMS, Suara Muhammadiyah, Lensamu) */}
        <AnimatedSection animation="fade-up" duration={700}>
          <NewsSection />
        </AnimatedSection>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
