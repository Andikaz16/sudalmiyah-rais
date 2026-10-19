import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PrayerCountdownCard from "@/components/PrayerCountdownCard";
import MuhammadiyahCalendarWidget from "@/components/MuhammadiyahCalendarWidget";
import AgendaSection from "@/components/AgendaSection";
import MasjidMuSection from "@/components/MasjidMuSection";
import FridayScheduleSection from "@/components/FridayScheduleSection";
import MutiaraHaditsSection from "@/components/MutiaraHaditsSection";
import NewsSection from "@/components/NewsSection";
import DonationSection from "@/components/DonationSection";
import FeedbackSection from "@/components/FeedbackSection";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import AnimatedSection from "@/components/AnimatedSection";
import AnnouncementPopup from "@/components/AnnouncementPopup";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans selection:bg-[#C59B27] selection:text-white">
      {/* Pop-up Banner Pengumuman Cerdas */}
      <AnnouncementPopup />

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

        {/* Dedicated Kalender Muhammadiyah (KHGT) Widget */}
        <AnimatedSection animation="fade-up" duration={700}>
          <MuhammadiyahCalendarWidget />
        </AnimatedSection>

        {/* Pilar & Keunggulan Masjid Percontohan AUM */}
        <AnimatedSection animation="fade-up" duration={700}>
          <MasjidMuSection />
        </AnimatedSection>

        {/* Agendas Section (Maksimal 3 pada beranda, lengkap di /agenda) */}
        <AnimatedSection animation="fade-up" duration={700}>
          <AgendaSection isHomePage={true} limit={3} />
        </AnimatedSection>

        {/* Jadwal Petugas Shalat & Khatib Pekan Ini */}
        <AnimatedSection animation="fade-up" duration={700}>
          <FridayScheduleSection />
        </AnimatedSection>

        {/* 1. Mutiara Hadits & Kata-Kata Hikmah */}
        <AnimatedSection animation="fade-up" duration={700}>
          <MutiaraHaditsSection />
        </AnimatedSection>

        {/* 2. Kabar Persyarikatan, Warta LPCR-PM & Kampus UMS */}
        <AnimatedSection animation="fade-up" duration={700}>
          <NewsSection />
        </AnimatedSection>

        {/* 3. Infaq Digital & QRIS Section */}
        <AnimatedSection animation="fade-up" duration={700}>
          <DonationSection />
        </AnimatedSection>

        {/* 4. Kotak Saran & Aspirasi Jamaah Masjid Kampus UMS */}
        <AnimatedSection animation="fade-up" duration={700}>
          <FeedbackSection />
        </AnimatedSection>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
