export type Language = "id" | "en";

export interface TranslationDictionary {
  navbar: {
    home: string;
    history: string;
    worship: string;
    prayerTimes: string;
    services: string;
    bookingForm: string;
    bookingFormDesc: string;
    downloadCenter: string;
    downloadCenterDesc: string;
    digitalInfaq: string;
    mosqueAgenda: string;
    tagline: string;
    subTagline: string;
    takmirPanel: string;
    language: string;
    servicesGroup: string;
  };
  hero: {
    modelBadge: string;
    slides: Array<{
      id: string;
      leadWord: string;
      mosqueName: string;
      description: string;
    }>;
    ctaAgenda: string;
    ctaDonation: string;
  };
  prayer: {
    location: string;
    standard: string;
    khgtStandard: string;
    countdownTo: string;
    approaching: string;
    next: string;
    imsak: string;
    subuh: string;
    terbit: string;
    dzuhur: string;
    ashar: string;
    maghrib: string;
    isya: string;
    dhuha: string;
    wib: string;
    auxTimes: string;
    fajrPreparation: string;
    sunnahPrayerTime: string;
  };
  calendar: {
    badgeOfficial: string;
    tarjihCouncil: string;
    title: string;
    desc: string;
    fullGuide: string;
    todayKhgt: string;
    globalTunggal: string;
    gregorian: string;
    standarMasa: string;
    fastingTitle: string;
    fastingDesc: string;
    fastingGate: string;
    fastingGuide: string;
    principlesTitle: string;
    principlesSubtitle: string;
    principlesFooter: string;
    principlesCouncil: string;
    centerNoticeTitle: string;
    centerNoticeDesc: string;
    exploreButton: string;
    principles: Array<{
      title: string;
      desc: string;
    }>;
  };
  friday: {
    badge: string;
    title: string;
    desc: string;
    infaqCardTitle: string;
    infaqCardDesc: string;
    infaqTotalLabel: string;
    khatib: string;
    imam: string;
    muadzin: string;
    time: string;
    location: string;
    viewOfficerDetails: string;
    modalTitle: string;
    close: string;
  };
  masjidmu: {
    badge: string;
    title: string;
    desc: string;
    pillars: Array<{
      id: string;
      title: string;
      desc: string;
    }>;
  };
  agenda: {
    badge: string;
    title: string;
    desc: string;
    viewAll: string;
    register: string;
    speaker: string;
    time: string;
    location: string;
    quota: string;
    freeEntry: string;
  };
  news: {
    badge: string;
    title: string;
    desc: string;
    searchPlaceholder: string;
    allCategory: string;
    readMore: string;
    publishedAt: string;
  };
  donation: {
    badge: string;
    title: string;
    desc: string;
    qrisTitle: string;
    qrisDesc: string;
    accountTitle: string;
    copyAccount: string;
    copied: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  feedback: {
    badge: string;
    title: string;
    desc: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    categoryLabel: string;
    categoryPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitBtn: string;
    submitting: string;
    successMsg: string;
    errorMsg: string;
  };
  footer: {
    campusMosque: string;
    university: string;
    desc: string;
    security: string;
    navTitle: string;
    history: string;
    lpcrPillars: string;
    worshipSpace: string;
    prayerSchedule: string;
    agendaRoutine: string;
    digitalInfaqQris: string;
    feedbackBox: string;
    campusNews: string;
    secretariatTitle: string;
    campusAddress: string;
    socialTitle: string;
    copyright: string;
    takmirAccess: string;
  };
  mobileNav: {
    home: string;
    worship: string;
    schedule: string;
    agenda: string;
    infaq: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  id: {
    navbar: {
      home: "Beranda",
      history: "Sejarah",
      worship: "Ruang Ibadah",
      prayerTimes: "Jadwal Shalat",
      services: "Layanan",
      bookingForm: "Formulir Peminjaman",
      bookingFormDesc: "Peminjaman ruang aula & inventaris proyektor masjid",
      downloadCenter: "Pusat Unduhan Dokumen",
      downloadCenterDesc: "E-Book HPT, PHIWM, Risalah Islam Berkemajuan, & panduan",
      digitalInfaq: "Infaq Digital",
      mosqueAgenda: "Agenda Masjid",
      tagline: "Pusat Ibadah, Peradaban & Dakwah Berkemajuan",
      subTagline: "Model Masjid Percontohan AUM & PTMA",
      takmirPanel: "Panel Takmir",
      language: "Bahasa",
      servicesGroup: "Layanan Masjid",
    },
    hero: {
      modelBadge: "Masjid Percontohan Amal Usaha Muhammadiyah (AUM)",
      slides: [
        {
          id: "sudalmiyah",
          leadWord: "Harmoni Ibadah Lintas Fakultas di",
          mosqueName: "Masjid Sudalmiyah Rais",
          description:
            "Masjid percontohan Amal Usaha Muhammadiyah tingkat PTMA sebagai pilar pembinaan AIK bagi sivitas akademika UMS, dan diproyeksikan menjadi masjid ramah aktivis dan lingkungan",
        },
        {
          id: "fadhlurrahman",
          leadWord: "Ghirah Berislam di",
          mosqueName: "Masjid Fadhlurrahman",
          description:
            "Masjid pertama dan bersejarah yang menjadi ruh pembinaan Al-Islam dan Kemuhammadiyahan bagi civitas akademika UMS",
        },
        {
          id: "mas-mansur",
          leadWord: "Kesejukan Ruhani di",
          mosqueName: "Masjid KH. Mas Mansur",
          description:
            "Sentra pembinaan mahasiswa interdisipliner UMS dan International dalam pengembangan keilmuan yang berakhlak, berprestasi dan bermanfaat",
        },
        {
          id: "mahad-abu-bakar",
          leadWord: "Keluhuran Ilmu & Adab di",
          mosqueName: "Masjid Ma'had Abu Bakar Ash-Shiddiq",
          description:
            "Pusat dirasat Islamiyah dan bahasa Arab Ma'had Abu bakar Ash-Shiddiq yang sekarang statusnya menjadi Amal Usaha Muhammadiyah (AUM) di lingkungan UMS",
        },
        {
          id: "ar-razi",
          leadWord: "Integrasi Keislaman & Keilmuan di",
          mosqueName: "Masjid Ar-Razi FKG",
          description:
            "Masjid yang terinspirasi ilmuwan polimatik terkemuka dan ahli di beberapa bidang utama, terutama kedokteran, kimia dan filsafat yakni Abu Bakar Muhammad bin Zakariya al-Razi",
        },
        {
          id: "munajat-shabran",
          leadWord: "Pusat Perkaderan di",
          mosqueName: "Masjid Al-Munajat Pondok Shabran",
          description:
            "Pusat perkaderan mahasiswa utusan wilayah Muhammadiyah seluruh Indonesia yang diorbitkan menjadi kader intelek ulama', ulama' intelek.",
        },
      ],
      ctaAgenda: "Daftar Kajian & Kegiatan",
      ctaDonation: "Donasi Kebaikan",
    },
    prayer: {
      location: "Kampus 2 UMS Surakarta",
      standard: "Standar MASA (Muhammadiyah)",
      khgtStandard: "KHGT Majelis Tarjih",
      countdownTo: "Menuju Waktu",
      approaching: "Menjelang",
      next: "Berikutnya",
      imsak: "Imsak",
      subuh: "Subuh",
      terbit: "Terbit",
      dzuhur: "Dzuhur",
      ashar: "Ashar",
      maghrib: "Maghrib",
      isya: "Isya",
      dhuha: "Dhuha",
      wib: "WIB",
      auxTimes: "Waktu Tambahan Ibadah",
      fajrPreparation: "Batas akhir sahur (10 mnt sebelum Subuh)",
      sunnahPrayerTime: "Awal pelaksanaan shalat sunnah Dhuha",
    },
    calendar: {
      badgeOfficial: "Kalender Resmi Muhammadiyah",
      tarjihCouncil: "Majelis Tarjih & Tajdid PP Muhammadiyah",
      title: "Kalender Hijriyah Global Tunggal (KHGT)",
      desc: "Penetapan penanggalan dan waktu ibadah berprinsip satu hari satu tanggal di seluruh dunia hasil keputusan Muktamar Muhammadiyah ke-48 Surakarta dan Konferensi Istanbul 2016.",
      fullGuide: "Ruang Ibadah & Kalender Lengkap",
      todayKhgt: "Hari Ini Berdasarkan KHGT",
      globalTunggal: "Global Tunggal",
      gregorian: "Kalender Masehi",
      standarMasa: "Standar MASA",
      fastingTitle: "Puasa Sunnah & Ibadah Terdekat",
      fastingDesc: "Panduan amalan puasa sunnah dan jadwal ibadah utama pekan ini.",
      fastingGate: "Pintu Ar-Rayyan bagi yang berpuasa",
      fastingGuide: "Panduan",
      principlesTitle: "3 Prinsip Pokok KHGT",
      principlesSubtitle: "Muktamar ke-48 Surakarta",
      principlesFooter: "Konferensi Istanbul 2016",
      principlesCouncil: "Majelis Tarjih",
      centerNoticeTitle: "Masjid Hj. Sudalmiyah Rais UMS:",
      centerNoticeDesc: "Pusat percontohan integrasi hisab astronomis MASA & KHGT di lingkungan perguruan tinggi Muhammadiyah.",
      exploreButton: "Eksplorasi Kalender & Aplikasi MASA",
      principles: [
        {
          title: "Kesatuan Global",
          desc: "Satu hari satu tanggal untuk seluruh belahan bumi.",
        },
        {
          title: "Kepastian Peradaban",
          desc: "Memberi kepastian jadwal ibadah puasa dan hari raya hingga puluhan tahun.",
        },
        {
          title: "Hisab Hakiki Kontemporer",
          desc: "Memadukan nash syar'i dengan sains astronomi mutakhir.",
        },
      ],
    },
    friday: {
      badge: "Jadwal Petugas Shalat & Khatib",
      title: "Jadwal Shalat Jumat Pekan Ini",
      desc: "Informasi khatib, imam, muadzin, dan transparansi infaq shalat Jumat di lingkungan masjid kampus UMS.",
      infaqCardTitle: "Informasi Infaq Shalat Jumat",
      infaqCardDesc: "Laporan perolehan infaq shalat Jumat terverifikasi oleh bendahara takmir.",
      infaqTotalLabel: "Total Perolehan Infaq",
      khatib: "Khatib",
      imam: "Imam",
      muadzin: "Muadzin",
      time: "Waktu",
      location: "Lokasi",
      viewOfficerDetails: "Detail Petugas Lengkap",
      modalTitle: "Informasi Petugas Shalat Jumat",
      close: "Tutup",
    },
    masjidmu: {
      badge: "Pilar Masjid Percontohan",
      title: "Pilar Keunggulan Masjid Sudalmiyah Rais",
      desc: "Standarisasi model pembinaan Amal Usaha Muhammadiyah (AUM) tingkat Perguruan Tinggi Muhammadiyah & 'Aisyiyah (PTMA).",
      pillars: [
        {
          id: "idarah",
          title: "Manajemen Idarah Modern",
          desc: "Tata kelola organisasi takmir yang transparan, akuntabel, dan berbasis digital.",
        },
        {
          id: "imarah",
          title: "Pemakmuran Imarah",
          desc: "Penguatan kegiatan ibadah shalat berjamaah, kajian tematik, dan pembinaan AIK civitas akademika.",
        },
        {
          id: "riayah",
          title: "Pemeliharaan Ri'ayah Ramah Lingkungan",
          desc: "Penyediaan fasilitas ibadah yang bersih, ramah disabilitas, dan berorientasi green mosque.",
        },
      ],
    },
    agenda: {
      badge: "Agenda & Kegiatan Masjid",
      title: "Kajian, Pembinaan & Syiar Dakwah",
      desc: "Ikuti rangkaian kegiatan keislaman, tabligh akbar, kajian rutin mahasiswa, dan pelatihan kemasjidan.",
      viewAll: "Lihat Seluruh Agenda",
      register: "Daftar Kehadiran",
      speaker: "Pemateri / Narasumber",
      time: "Waktu Pelaksanaan",
      location: "Tempat",
      quota: "Kuota Peserta",
      freeEntry: "Gratis & Terbuka untuk Umum",
    },
    news: {
      badge: "Warta & Informasi",
      title: "Kabar Persyarikatan & Kampus UMS",
      desc: "Informasi terkini mengenai perkembangan dakwah, kegiatan LPCR-PM, serta dinamika Universitas Muhammadiyah Surakarta.",
      searchPlaceholder: "Cari warta berita...",
      allCategory: "Semua Kategori",
      readMore: "Baca Selengkapnya",
      publishedAt: "Diterbitkan",
    },
    donation: {
      badge: "Infaq & Shadaqah Digital",
      title: "Salurkan Kebaikan Melalui Masjid Kampus UMS",
      desc: "Setiap rupiah yang diamanahkan mendukung pembinaan kader, pemakmuran masjid, dan dakwah Islam berkemajuan.",
      qrisTitle: "QRIS Infaq Cepat & Resmi",
      qrisDesc: "Pindai menggunakan aplikasi m-Banking atau e-Wallet apa saja (GoPay, OVO, Dana, ShopeePay, LinkAja).",
      accountTitle: "Transfer Bank Langsung",
      copyAccount: "Salin Rekening",
      copied: "Berhasil Disalin!",
      bankName: "Bank Syariah Indonesia (BSI)",
      accountNumber: "7174173158",
      accountHolder: "Masjid Sudalmiyah Rais UMS",
    },
    feedback: {
      badge: "Kotak Saran Jamaah",
      title: "Aspirasi & Masukan Jamaah",
      desc: "Kami mendengar setiap masukan untuk meningkatkan kenyamanan ibadah dan layanan masjid.",
      nameLabel: "Nama Lengkap",
      namePlaceholder: "Masukkan nama Anda",
      emailLabel: "Email / No. WhatsApp",
      emailPlaceholder: "contoh: 0812xxxx atau nama@email.com",
      categoryLabel: "Kategori Saran",
      categoryPlaceholder: "Pilih kategori",
      messageLabel: "Pesan / Masukan",
      messagePlaceholder: "Tuliskan saran, kritik, atau apresiasi Anda untuk takmir masjid...",
      submitBtn: "Kirim Masukan",
      submitting: "Mengirimkan...",
      successMsg: "Terima kasih! Aspirasi Anda telah kami terima.",
      errorMsg: "Mohon isi formulir dengan benar.",
    },
    footer: {
      campusMosque: "Masjid Kampus",
      university: "Universitas Muhammadiyah Surakarta",
      desc: "Masjid percontohan Amal Usaha Muhammadiyah (AUM) tingkat PTMA dan menjadi pusat pembinaan AIK bagi civitas akademika UMS. Mengimplementasikan gerakan Islam yang unggul dan berkemajuan berbasis jama'ah, jam'iyah dan jariyah.",
      security: "Sistem Terenkripsi & Standar Keamanan OWASP Berlapis",
      navTitle: "Navigasi Layanan",
      history: "Sejarah Masjid Kampus",
      lpcrPillars: "Pilar Masjid Percontohan LPCR-PM",
      worshipSpace: "Ruang Ibadah Digital",
      prayerSchedule: "Jadwal Shalat Surakarta",
      agendaRoutine: "Agenda & Kajian Rutin",
      digitalInfaqQris: "Infaq Digital QRIS",
      feedbackBox: "Kotak Saran & Aspirasi",
      campusNews: "Warta Kampus & Persyarikatan",
      secretariatTitle: "Sekretariat Takmir",
      campusAddress: "Kampus 2 (Masjid Hj. Sudalmiyah Rais), Jl. Ahmad Yani, Pabelan, Kecamatan Kartasura, Kabupaten Sukoharjo, Jawa Tengah 57162",
      socialTitle: "Kanal Media Sosial",
      copyright: "Hak Cipta © 2026 Masjid Kampus - Universitas Muhammadiyah Surakarta. Seluruh Hak Dilindungi.",
      takmirAccess: "Akses Takmir",
    },
    mobileNav: {
      home: "Beranda",
      worship: "Ibadah",
      schedule: "Jadwal",
      agenda: "Agenda",
      infaq: "Infaq",
    },
  },
  en: {
    navbar: {
      home: "Home",
      history: "History",
      worship: "Prayer Space",
      prayerTimes: "Prayer Times",
      services: "Services",
      bookingForm: "Facility Booking Form",
      bookingFormDesc: "Hall booking & mosque projector inventory",
      downloadCenter: "Document Download Center",
      downloadCenterDesc: "E-Books, HPT, PHIWM, Progressive Islam treatises, & guides",
      digitalInfaq: "Digital Infaq",
      mosqueAgenda: "Mosque Agenda",
      tagline: "Center for Worship, Civilization & Progressive Da'wah",
      subTagline: "AUM & PTMA Model Mosque",
      takmirPanel: "Takmir Panel",
      language: "Language",
      servicesGroup: "Mosque Services",
    },
    hero: {
      modelBadge: "Muhammadiyah Higher Education Model Mosque",
      slides: [
        {
          id: "sudalmiyah",
          leadWord: "Inter-Faculty Worship Harmony at",
          mosqueName: "Sudalmiyah Rais Mosque",
          description:
            "Muhammadiyah higher education model mosque as the foundation of Islamic guidance for the UMS academic community, projected as an activist-friendly and green mosque",
        },
        {
          id: "fadhlurrahman",
          leadWord: "Islamic Zeal & Spirit at",
          mosqueName: "Fadhlurrahman Mosque",
          description:
            "The first and historical campus mosque serving as the spiritual heart of Islamic and Muhammadiyah guidance for the UMS community",
        },
        {
          id: "mas-mansur",
          leadWord: "Spiritual Serenity at",
          mosqueName: "KH. Mas Mansur Mosque",
          description:
            "Hub for interdisciplinary and international student guidance nurturing moral, high-achieving, and beneficial scholars",
        },
        {
          id: "mahad-abu-bakar",
          leadWord: "Nobility of Knowledge & Ethics at",
          mosqueName: "Ma'had Abu Bakar Mosque",
          description:
            "Center for Islamic studies and Arabic language at Ma'had Abu Bakar Ash-Shiddiq, an official institutional undertaking at UMS",
        },
        {
          id: "ar-razi",
          leadWord: "Integration of Faith & Science at",
          mosqueName: "Ar-Razi Dental Mosque",
          description:
            "Mosque inspired by the prominent polymath, physician, chemist, and philosopher Abu Bakr Muhammad ibn Zakariya al-Razi",
        },
        {
          id: "munajat-shabran",
          leadWord: "Cadre Training Center at",
          mosqueName: "Al-Munajat Mosque Pondok Shabran",
          description:
            "National cadre development center nurturing intellectual scholars and scholarly intellectuals across Indonesia",
        },
      ],
      ctaAgenda: "Schedule & Activities",
      ctaDonation: "Digital Donation",
    },
    prayer: {
      location: "Campus 2 UMS Surakarta",
      standard: "MASA Standard (Muhammadiyah)",
      khgtStandard: "KHGT Tarjih Council",
      countdownTo: "Approaching",
      approaching: "Approaching",
      next: "Next",
      imsak: "Imsak",
      subuh: "Fajr",
      terbit: "Sunrise",
      dzuhur: "Dhuhr",
      ashar: "Asr",
      maghrib: "Maghrib",
      isya: "Isha",
      dhuha: "Duha",
      wib: "WIB",
      auxTimes: "Auxiliary Worship Times",
      fajrPreparation: "End of suhoor meal (10 mins before Fajr)",
      sunnahPrayerTime: "Beginning of optional Duha prayer",
    },
    calendar: {
      badgeOfficial: "Official Muhammadiyah Calendar",
      tarjihCouncil: "Tarjih & Tajdid Council PP Muhammadiyah",
      title: "Single Global Islamic Calendar (KHGT)",
      desc: "Global calendar determination based on the principle of one day, one date worldwide, enacted by the 48th Muhammadiyah Congress in Surakarta and Istanbul Conference 2016.",
      fullGuide: "Complete Worship Space & Calendar",
      todayKhgt: "Today Based on KHGT",
      globalTunggal: "Unified Global",
      gregorian: "Gregorian Calendar",
      standarMasa: "Standar MASA",
      fastingTitle: "Upcoming Sunnah Fasting",
      fastingDesc: "Guidance for sunnah fasting and upcoming major worship times this week.",
      fastingGate: "Ar-Rayyan gate for those who fast",
      fastingGuide: "Guidance",
      principlesTitle: "3 Core Principles of KHGT",
      principlesSubtitle: "48th Congress Surakarta",
      principlesFooter: "Istanbul Conference 2016",
      principlesCouncil: "Tarjih Council",
      centerNoticeTitle: "Hj. Sudalmiyah Rais Mosque UMS:",
      centerNoticeDesc: "Pioneer center for astronomical calculation integration of MASA & KHGT within Muhammadiyah universities.",
      exploreButton: "Explore MASA Calendar & Application",
      principles: [
        {
          title: "Global Unity",
          desc: "One day, one date across all continents and hemispheres.",
        },
        {
          title: "Civilizational Certainty",
          desc: "Provides clear civil and religious schedules decades into the future.",
        },
        {
          title: "Contemporary Hakiki Hisab",
          desc: "Harmonizing Islamic legal texts with advanced modern astronomy.",
        },
      ],
    },
    friday: {
      badge: "Prayer Officers & Khatib Schedule",
      title: "This Week's Friday Prayer Schedule",
      desc: "Information on khatib, imam, muadzin, and Friday prayer infaq transparency across UMS campus mosques.",
      infaqCardTitle: "Friday Prayer Infaq Information",
      infaqCardDesc: "Friday prayer infaq collection report officially verified by the mosque treasurer.",
      infaqTotalLabel: "Total Infaq Collected",
      khatib: "Khatib",
      imam: "Imam",
      muadzin: "Muadzin",
      time: "Time",
      location: "Location",
      viewOfficerDetails: "Full Officer Details",
      modalTitle: "Friday Prayer Officer Information",
      close: "Close",
    },
    masjidmu: {
      badge: "Model Mosque Pillars",
      title: "Excellence Pillars of Sudalmiyah Rais Mosque",
      desc: "Standardized guidance model of Amal Usaha Muhammadiyah (AUM) for Muhammadiyah & 'Aisyiyah Higher Education (PTMA).",
      pillars: [
        {
          id: "idarah",
          title: "Modern Idarah Management",
          desc: "Transparent, accountable, and digitally integrated mosque leadership governance.",
        },
        {
          id: "imarah",
          title: "Imarah Prosperity",
          desc: "Enriching congregational prayers, thematic lectures, and Islamic guidance for the campus community.",
        },
        {
          id: "riayah",
          title: "Eco-Friendly Ri'ayah Care",
          desc: "Providing clean, disability-friendly, and green-oriented prayer facilities.",
        },
      ],
    },
    agenda: {
      badge: "Mosque Agendas & Activities",
      title: "Lectures, Guidance & Da'wah Outreach",
      desc: "Join our series of Islamic lectures, public sermons, regular student study circles, and mosque leadership trainings.",
      viewAll: "View All Agendas",
      register: "Register Attendance",
      speaker: "Speaker / Lecturer",
      time: "Event Time",
      location: "Venue",
      quota: "Capacity",
      freeEntry: "Free & Open to the Public",
    },
    news: {
      badge: "News & Updates",
      title: "Muhammadiyah & UMS Campus News",
      desc: "Latest news on da'wah developments, LPCR-PM activities, and updates from Universitas Muhammadiyah Surakarta.",
      searchPlaceholder: "Search articles...",
      allCategory: "All Categories",
      readMore: "Read More",
      publishedAt: "Published",
    },
    donation: {
      badge: "Digital Infaq & Charity",
      title: "Channel Goodness Through UMS Campus Mosque",
      desc: "Every contribution entrusted supports student development, mosque prosperity, and progressive Islamic da'wah.",
      qrisTitle: "Official Fast QRIS Infaq",
      qrisDesc: "Scan using any m-Banking or e-Wallet app (GoPay, OVO, Dana, ShopeePay, LinkAja).",
      accountTitle: "Direct Bank Transfer",
      copyAccount: "Copy Account Number",
      copied: "Copied!",
      bankName: "Bank Syariah Indonesia (BSI)",
      accountNumber: "7174173158",
      accountHolder: "Masjid Sudalmiyah Rais UMS",
    },
    feedback: {
      badge: "Feedback Box",
      title: "Congregational Aspirations & Suggestions",
      desc: "We value every suggestion to improve worship comfort and mosque services.",
      nameLabel: "Full Name",
      namePlaceholder: "Enter your full name",
      emailLabel: "Email / WhatsApp Number",
      emailPlaceholder: "e.g. 0812xxxx or name@email.com",
      categoryLabel: "Suggestion Category",
      categoryPlaceholder: "Select category",
      messageLabel: "Message / Feedback",
      messagePlaceholder: "Write your suggestions, feedback, or appreciation for the mosque management...",
      submitBtn: "Submit Feedback",
      submitting: "Submitting...",
      successMsg: "Thank you! Your feedback has been received.",
      errorMsg: "Please fill out the form properly.",
    },
    footer: {
      campusMosque: "Campus Mosque",
      university: "Universitas Muhammadiyah Surakarta",
      desc: "Model mosque for Muhammadiyah Higher Education Institutions (PTMA) and center for Islamic guidance for the UMS academic community. Implementing an outstanding and progressive Islamic movement based on jama'ah, jam'iyah, and jariyah.",
      security: "Encrypted System & Layered OWASP Security Standard",
      navTitle: "Service Navigation",
      history: "Campus Mosque History",
      lpcrPillars: "LPCR-PM Model Mosque Pillars",
      worshipSpace: "Digital Prayer Space",
      prayerSchedule: "Surakarta Prayer Times",
      agendaRoutine: "Agendas & Routine Lectures",
      digitalInfaqQris: "Digital QRIS Infaq",
      feedbackBox: "Feedback & Aspirations Box",
      campusNews: "Campus & Muhammadiyah News",
      secretariatTitle: "Takmir Secretariat",
      campusAddress: "Campus 2 (Hj. Sudalmiyah Rais Mosque), Jl. Ahmad Yani, Pabelan, Kartasura, Sukoharjo, Central Java 57162",
      socialTitle: "Social Media Channels",
      copyright: "Copyright © 2026 Campus Mosque - Universitas Muhammadiyah Surakarta. All Rights Reserved.",
      takmirAccess: "Takmir Access",
    },
    mobileNav: {
      home: "Home",
      worship: "Worship",
      schedule: "Schedule",
      agenda: "Agenda",
      infaq: "Infaq",
    },
  },
};
