export interface TarjihTopic {
  id: string;
  title: string;
  keywords: string[];
  summary: string;
  dalil: string;
  putusanTarjih: string;
  source: string;
}

export const TARJIH_KNOWLEDGE_BASE: TarjihTopic[] = [
  {
    id: "tarawih-witir",
    title: "Tuntunan Shalat Tarawih & Witir",
    keywords: [
      "tarawih",
      "shalat tarawih",
      "shalat witir",
      "qiyamul lail",
      "qiyam ramadhan",
      "11 rakaat",
      "formasi 4-4-3",
      "witir",
      "tuntunan tarawih",
      "rakaat tarawih",
      "tata cara tarawih",
    ],
    summary:
      "Shalat Tarawih menurut Himpunan Putusan Tarjih (HPT) Muhammadiyah berjumlah 11 rakaat (termasuk witir), yang dapat ditunaikan dengan formasi 4-4-3 rakaat tanpa tasyahud awal di rakaat keempat, atau 2-2-2-2-2-1 rakaat.",
    dalil:
      "Hadits Aisyah r.a.: 'Rasulullah SAW tidak pernah menambah shalat malam di bulan Ramadhan maupun di luar Ramadhan lebih dari sebelas rakaat.' (HR. Bukhari no. 1147 & Muslim no. 738).",
    putusanTarjih:
      "Majelis Tarjih menetapkan shalat qiyam Ramadhan/Tarawih adalah 11 rakaat. Cara yang lebih afdhal dan masyhur diamalkan adalah 4 rakaat salam (tanpa tasyahud awal), lalu 4 rakaat salam, dan ditutup witir 3 rakaat salam sekaligus tanpa tasyahud awal, atau boleh dengan 2 rakaat-2 rakaat hingga 10 rakaat lalu 1 rakaat witir.",
    source: "Himpunan Putusan Tarjih (HPT) Jilid 1, Bab Shalat Tathawwu' (Qiyam Ramadhan).",
  },
  {
    id: "iftitah",
    title: "Bacaan Doa Iftitah dalam Shalat",
    keywords: [
      "iftitah",
      "doa iftitah",
      "allahumma baid",
      "bacaan iftitah",
      "iftitah hpt",
      "bacaan setelah takbir",
      "doa buka shalat",
    ],
    summary:
      "Bacaan doa iftitah yang rajih dan resmi menurut Himpunan Putusan Tarjih (HPT) adalah riwayat Abu Hurairah r.a. yang diawali dengan 'Allahumma baa'id bainii wa baina khathaayaaya...'",
    dalil:
      "Hadits shahih riwayat Abu Hurairah r.a. dalam Shahih Bukhari (no. 744) dan Shahih Muslim (no. 598): Rasulullah SAW diam sejenak setelah takbiratul ihram dan membaca doa ini sebelum membaca Al-Fatihah.",
    putusanTarjih:
      "Teks doa iftitah HPT:\n'Allahumma baa'id bainii wa baina khathaayaaya kamaa baa'adta bainal masyriqi wal maghrib. Allahumma naqqinii minal khathaayaa kamaa yunaqqats tsaubul abyadhu minad danas. Allahummaghsil khathaayaaya bil maa-i wats tsalji wal barad.'\n\nArtinya: 'Ya Allah, jauhkanlah antara aku dan kesalahan-kesalahanku sebagaimana Engkau menjauhkan antara timur dan barat. Ya Allah, bersihkanlah aku dari kesalahan sebagaimana pakaian putih dibersihkan dari kotoran. Ya Allah, cucilah kesalahan-kesalahanku dengan air, salju, dan embun.'",
    source: "Himpunan Putusan Tarjih (HPT) Jilid 1, Kitabus Shalah, Tata Cara Shalat Nabi SAW.",
  },
  {
    id: "bacaan-ruku-sujud",
    title: "Bacaan Ruku' dan Sujud dalam Shalat",
    keywords: [
      "ruku",
      "sujud",
      "bacaan ruku",
      "bacaan sujud",
      "subhanakallahumma",
      "doa ruku",
      "doa sujud",
      "bacaan rukuk",
      "doa rukuk",
    ],
    summary:
      "Bacaan ruku' dan sujud yang rajih menurut HPT Muhammadiyah adalah: 'Subhaanakallaahumma rabbanaa wa bihamdika allaahummaghfir lii'.",
    dalil:
      "Hadits Aisyah r.a.: 'Rasulullah SAW memperbanyak membaca dalam ruku' dan sujudnya: Subhaanakallaahumma rabbanaa wa bihamdika allaahummaghfir lii, seraya mengamalkan perintah Al-Qur'an (QS. An-Nashr: 3).' (HR. Bukhari no. 794 & Muslim no. 484).",
    putusanTarjih:
      "Lafazh resmi HPT untuk ruku' dan sujud:\n'Subhaanakallaahumma rabbanaa wa bihamdika allaahummaghfir lii'\n\nArtinya: 'Maha Suci Engkau, ya Allah Tuhan kami, dan dengan memuji-Mu. Ya Allah, ampunilah dosaku.'\n\nBacaan ini mencakup dzikir pengagungan sekaligus doa permohonan ampun yang dicontohkan langsung oleh Rasulullah SAW.",
    source: "HPT Jilid 1, Kitabus Shalah, Bab Ruku' dan Sujud.",
  },
  {
    id: "bacaan-tasyahud",
    title: "Bacaan Tasyahud / Tahiyyat Awal & Akhir",
    keywords: [
      "tasyahud",
      "tahiyyat",
      "bacaan tahiyyat",
      "bacaan tasyahud",
      "attahiyyatu lillah",
      "tasyahud awal",
      "tasyahud akhir",
      "shalawat tarjih",
    ],
    summary:
      "Bacaan tasyahud yang dipilih Majelis Tarjih adalah riwayat Ibnu Mas'ud r.a., dilanjutkan dengan shalawat Ibrahimiyah.",
    dalil:
      "Hadits Abdullah bin Mas'ud r.a.: 'Rasulullah SAW mengajarkan kepadaku bacaan tasyahud seraya telapak tanganku berada di antara kedua telapak tangannya...' (HR. Bukhari no. 1202 & Muslim no. 402).",
    putusanTarjih:
      "Lafazh tasyahud HPT:\n'Attahiyyaatu lillaahi wash-shalawaatu wath-thayyibaat. Assalaamu 'alaika ayyuhan-nabiyyu wa rahmatullaahi wa barakaatuh. Assalaamu 'alainaa wa 'alaa 'ibaadillaahish-shaalihiin. Asyhadu an laa ilaaha illallaah, wa asyhadu anna Muhammadan 'abduhuu wa rasuuluh.'\n\nDilanjutkan shalawat Ibrahimiyah:\n'Allaahumma shalli 'alaa Muhammad wa 'alaa aali Muhammad, kamaa shallaita 'alaa Ibraahiim wa 'alaa aali Ibraahiim. Wa baarik 'alaa Muhammad wa 'alaa aali Muhammad, kamaa baarakta 'alaa Ibraahiim wa 'alaa aali Ibraahiim, innaka hamiidum majiid.'",
    source: "HPT Jilid 1, Kitabus Shalah, Bab Tasyahud.",
  },
  {
    id: "posisi-sedekap",
    title: "Posisi Sedekap Tangan saat Berdiri Shalat",
    keywords: [
      "sedekap",
      "posisi tangan",
      "sedekap dada",
      "meletakkan tangan",
      "tangan shalat",
      "letak tangan",
    ],
    summary:
      "Meletakkan tangan kanan di atas punggung tangan kiri, pergelangan dan lengan, dan diletakkan di atas dada.",
    dalil:
      "Hadits Wa'il bin Hujr r.a.: 'Saya melihat Rasulullah SAW ketika berdiri dalam shalat, beliau memegang tangan kirinya dengan tangan kanannya dan meletakkannya di atas dadanya.' (HR. Abu Dawud no. 759 & Ahmad).",
    putusanTarjih:
      "Menurut putusan Majelis Tarjih, saat berdiri membaca Al-Fatihah, tangan kanan diletakkan di atas telapak tangan kiri, pergelangan, atau lengan bawah kiri, bertempat di atas dada (bukan di bawah pusar).",
    source: "HPT Jilid 1, Kitabus Shalah, Bab Tata Cara Berdiri.",
  },
  {
    id: "basmalah-fatihah",
    title: "Bacaan Basmalah dalam Shalat Jahriyah (Sirr)",
    keywords: [
      "bacaan basmalah",
      "basmalah sirr",
      "bismillah pelan",
      "bismillah fatihah",
      "bismillah jahriyah",
      "bacaan fatihah",
      "sirr",
    ],
    summary:
      "Menurut putusan Majelis Tarjih Muhammadiyah, bacaan Basmalah pada awal surat Al-Fatihah dan surat lainnya dalam shalat fardhu jahriyah (Subuh, Maghrib, Isya) dibaca secara sirr (pelan / tidak dikeraskan).",
    dalil:
      "Hadits Anas bin Malik r.a.: 'Saya pernah shalat bersama Rasulullah SAW, Abu Bakar, Umar, dan Utsman; mereka semua memulai bacaan dengan Alhamdulillahi Rabbil 'Alamin (tidak mengeraskan bismillah).' (HR. Muslim no. 399 dan Bukhari no. 743).",
    putusanTarjih:
      "Majelis Tarjih & Tajdid memutuskan bahwa basmalah tetap wajib dibaca namun dibaca secara sirr (lirih) oleh imam maupun makmum, kemudian bacaan dijahrkan (dikeraskan) mulai dari lafazh 'Alhamdulillahi Rabbil 'Alamin'.",
    source: "HPT Jilid 1, Bab Shalat, Sub-bab Bacaan Al-Fatihah.",
  },
  {
    id: "qunut-subuh",
    title: "Hukum Qunut dalam Shalat Subuh",
    keywords: [
      "qunut",
      "doa qunut",
      "qunut subuh",
      "qunut nazilah",
      "hukum qunut",
      "qunut subuh tarjih",
      "subuh tanpa qunut",
    ],
    summary:
      "Menurut Majelis Tarjih PP Muhammadiyah, membaca doa qunut secara rutin setiap shalat Subuh tidak disyariatkan karena hadits yang mewajibkan/merutinkannya dinilai lemah. Qunut disyariatkan saat terjadi Qunut Nazilah.",
    dalil:
      "Hadits Abu Malik al-Asyja'i: Aku bertanya kepada ayahku, 'Wahai ayah, engkau pernah shalat di belakang Rasulullah, Abu Bakar, Umar, Utsman, dan Ali di Kufah, apakah mereka membaca qunut pada shalat Subuh?' Ayahku menjawab: 'Wahai anakku, itu adalah perkara baru (muhdats).' (HR. Tirmidzi no. 402, shahih).",
    putusanTarjih:
      "Majelis Tarjih memutuskan tidak mengamalkan qunut rutin pada shalat Subuh. Adapun jika umat Islam tertimpa musibah, bencana besar, atau penindasan (seperti di Palestina), maka disunnahkan melaksanakan Qunut Nazilah pada rakaat terakhir setelah ruku' di seluruh shalat fardhu lima waktu.",
    source: "Tanya Jawab Agama Suara Muhammadiyah, Jilid 2 & Putusan Tarjih Munas Tarjih.",
  },
  {
    id: "adzan-jumat",
    title: "Jumlah Adzan pada Shalat Jumat (1 Kali)",
    keywords: [
      "adzan jumat",
      "adzan 1 kali",
      "adzan 2 kali",
      "adzan dua kali",
      "jumlah adzan jumat",
      "adzan shalat jumat",
      "adzan jumatan",
    ],
    summary:
      "Masjid Muhammadiyah (termasuk Masjid Kampus UMS) mengamalkan adzan shalat Jumat sebanyak 1 kali, yaitu dikumandangkan tepat saat khatib telah menaiki mimbar.",
    dalil:
      "Hadits Saib bin Yazid r.a.: 'Sesungguhnya seruan adzan pada hari Jumat pada masa Rasulullah SAW, Abu Bakar, dan Umar adalah ketika imam telah duduk di atas mimbar.' (HR. Bukhari no. 912).",
    putusanTarjih:
      "Majelis Tarjih memutuskan bahwa adzan shalat Jumat yang paling tepat dengan sunnah Nabi SAW adalah satu kali adzan saat khatib naik ke mimbar. Penambahan adzan kedua pada masa Khalifah Utsman r.a. di pasar az-Zaura bersifat kebijakan kontekstual saat perluasan kota Madinah, dan di era modern dengan adanya jam/pengeras suara, satu kali adzan mencukupi dan selaras dengan sunnah awal.",
    source: "HPT Jilid 1, Kitabus Shalah, Bab Shalat Jumat.",
  },
  {
    id: "khgt-hisab",
    title: "Kalender Hijriyah Global Tunggal (KHGT) & Hisab Tarjih",
    keywords: [
      "khgt",
      "kalender hijriyah global",
      "hisab tarjih",
      "wujudul hilal",
      "hisab hakiki",
      "kongres istanbul",
      "penanggalan islam",
      "penetapan awal bulan",
      "hilal global",
    ],
    summary:
      "Muhammadiyah resmi memberlakukan Kalender Hijriyah Global Tunggal (KHGT) berlandaskan hisab hakiki wujudul hilal dan kesepakatan Kongres Kalender Islam Global Istanbul 2016, agar penanggalan Islam di seluruh dunia bersatu dalam satu hari satu tanggal.",
    dalil:
      "Firman Allah SWT dalam QS. Yunus: 5 dan QS. Ar-Rahman: 5 ('Asy-syamsu wal qamaru bi husban'). Serta hadits 'Bulan itu ada 29 hari...' yang dipahami secara ghayah (tujuan akurasi hisab astronomi modern).",
    putusanTarjih:
      "PP Muhammadiyah melalui Majelis Tarjih & Tajdid memutuskan peralihan dari hisab wujudul hilal lokal menuju KHGT (Kalender Hijriyah Global Tunggal). Prinsipnya: bumi dipandang sebagai satu kesatuan matla' global dengan parameter konjungsi dan ketinggian hilal terukur di manapun di permukaan bumi sebelum pukul 00:00 UTC.",
    source: "Muktamar Muhammadiyah ke-48 Surakarta & Keputusan Tanfidz Musywil/Munas Tarjih 2024.",
  },
  {
    id: "jamak-qashar",
    title: "Tuntunan Shalat Jamak & Qashar Mahasiswa / Musafir",
    keywords: [
      "jamak qashar",
      "shalat jamak",
      "shalat qashar",
      "shalat musafir",
      "keringanan shalat safar",
      "jamak taqdim",
      "jamak takhir",
      "safar mahasiswa",
    ],
    summary:
      "Musafir yang bepergian berhak meringkas (qashar) shalat empat rakaat menjadi dua rakaat, serta menjamak (menggabungkan Dzuhur dengan Ashar, dan Maghrib dengan Isya) baik taqdim maupun takhir.",
    dalil:
      "QS. An-Nisa: 101: 'Dan apabila kamu bepergian di muka bumi, maka tidaklah mengapa kamu men-qashar shalatmu...'. Serta hadits Ibnu Abbas r.a. bahwa Rasulullah SAW menjamak Dzuhur dengan Ashar serta Maghrib dengan Isya saat safar (HR. Muslim).",
    putusanTarjih:
      "Seseorang dianggap musafir apabila bepergian keluar dari daerah tempat tinggalnya dengan jarak perjalanan yang lumrah disebut bepergian (uruf), dan tujuannya bukan untuk maksiat. Mahasiswa UMS yang bepergian antar-kota/pulang kampung dapat memanfaatkan rukhshah jamak dan qashar selama dalam perjalanan dan masa singgah sementara.",
    source: "HPT Jilid 1, Bab Shalat Safar.",
  },
  {
    id: "zakat-fitrah",
    title: "Zakat Fitrah dengan Uang atau Beras",
    keywords: [
      "zakat fitrah",
      "kadar zakat fitrah",
      "zakat fitrah uang",
      "zakat fitrah beras",
      "besaran zakat fitrah",
      "kapan bayar zakat fitrah",
      "zakat beras",
    ],
    summary:
      "Zakat fitrah wajib ditunaikan bagi setiap muslim menjelang Idul Fitri sebesar 1 sha' makanan pokok (setara 2,5 kg atau 3 kg beras menurut kehati-hatian), dan menurut Tarjih boleh dikonversikan ke dalam nilai uang yang setara.",
    dalil:
      "Hadits Ibnu Umar r.a.: 'Rasulullah SAW mewajibkan zakat fitrah sebanyak satu sha' kurma atau satu sha' gandum bagi setiap orang merdeka atau budak...' (HR. Bukhari no. 1503 & Muslim no. 984).",
    putusanTarjih:
      "Majelis Tarjih menetapkan bahwa menunaikan zakat fitrah dengan uang seharga beras/makanan pokok adalah sah dan diperbolehkan jika hal tersebut lebih maslahat dan memudahkan penerima (mustahik) dalam memenuhi kebutuhan hidupnya.",
    source: "HPT Jilid 2, Kitab Zakat & Fatwa Tarjih seputar Zakat Fitrah Kontemporer.",
  },
  {
    id: "sujud-sahwi",
    title: "Tuntunan dan Sebab Sujud Sahwi",
    keywords: [
      "sujud sahwi",
      "lupa rakaat",
      "sahwi",
      "sujud lupa",
      "ragu jumlah rakaat",
      "bacaan sujud sahwi",
    ],
    summary:
      "Sujud sahwi disyariatkan saat seseorang lupa, ragu rakaat, atau kelebihan/kekurangan gerakan dalam shalat. Dilakukan dua kali sujud dengan takbir, boleh sebelum atau sesudah salam.",
    dalil:
      "Hadits Abu Sa'id al-Khudri r.a.: 'Jika salah seorang dari kalian ragu dalam shalatnya, sehingga tidak tahu apakah sudah tiga atau empat rakaat, hendaklah membuang keraguan dan mendasarkan pada yang diyakini (sedikit), lalu sujud dua kali sebelum salam.' (HR. Muslim no. 571).",
    putusanTarjih:
      "Majelis Tarjih menetapkan sujud sahwi dilakukan 2 kali sujud. Jika ragu rakaat atau lupa tasyahud awal, sujud sahwi dikerjakan sebelum salam. Jika terjadi kelebihan rakaat, sujud sahwi dikerjakan sesudah salam. Bacaan sujud sahwi sama dengan bacaan sujud biasa dalam HPT: 'Subhaanakallaahumma rabbanaa wa bihamdika allaahummaghfir lii'.",
    source: "HPT Jilid 1, Kitabus Shalah, Bab Sujud Sahwi.",
  },
  {
    id: "dzikir-setelah-shalat",
    title: "Dzikir dan Doa Sesudah Shalat Fardhu",
    keywords: [
      "dzikir setelah shalat",
      "doa setelah shalat",
      "wirid shalat",
      "doa ba'da shalat",
      "dzikir shalat",
      "dzikir sirr",
    ],
    summary:
      "Dzikir sesudah shalat fardhu dibaca secara perseorangan dengan suara sirr (lirih), diawali istighfar 3x, kalimat tauhid, tasbih 33x, tahmid 33x, takbir 33x, ayat Kursi, dan mu'awwidzatain.",
    dalil:
      "QS. Al-A'raf: 205: 'Dan sebutlah nama Tuhanmu dalam hatimu dengan merendahkan diri dan rasa takut, dan dengan tidak mengeraskan suara...' Serta hadits Tsauban r.a. bahwa Rasulullah SAW selesai shalat beristighfar 3 kali (HR. Muslim no. 591).",
    putusanTarjih:
      "Majelis Tarjih memutuskan dzikir ba'da shalat dilaksanakan masing-masing jamaah secara sirr (tidak dikomando imam dengan suara keras/koor berjamaah). Rangkaiannya: Istighfar 3x, 'Allahumma antas-salaam...', 'Laa ilaaha illallaah...', tasbih, tahmid, takbir masing-masing 33x, dan berdoa memohon kebaikan dunia akhirat.",
    source: "HPT Jilid 1, Kitabus Shalah, Bab Dzikir Ba'da Shalat.",
  },
  {
    id: "hukum-rokok-vape",
    title: "Fatwa Tarjih tentang Hukum Rokok dan Vape",
    keywords: [
      "rokok",
      "merokok",
      "hukum rokok",
      "vape",
      "rokok elektrik",
      "rokok haram",
      "fatwa rokok",
      "vaping",
    ],
    summary:
      "Majelis Tarjih PP Muhammadiyah menetapkan secara tegas bahwa hukum merokok dan rokok elektronik (vape) adalah HARAM.",
    dalil:
      "QS. Al-Baqarah: 195 ('Dan janganlah kamu menjatuhkan dirimu sendiri ke dalam kebinasaan'), QS. An-Nisa: 29 ('Dan janganlah kamu membunuh dirimu'), serta sabda Nabi SAW: 'Laa dharara wa laa dhiraar' (Tidak boleh membahayakan diri sendiri dan orang lain, HR. Ibnu Majah).",
    putusanTarjih:
      "Majelis Tarjih mengeluarkan Fatwa No. 6/SM/MTT/III/2010 yang mengharamkan rokok konvensional karena terbukti merusak organ tubuh, pemborosan harta (tabdzir), dan membahayakan perokok pasif. Selanjutnya dipertegas melalui Fatwa No. 01/PER/I.1/E/2020 bahwa rokok elektronik (vape) sama bahayanya dan hukumnya juga HARAM.",
    source: "Fatwa Majelis Tarjih & Tajdid PP Muhammadiyah No. 6/2010 dan No. 01/2020.",
  },
  {
    id: "tahiyyatul-masjid-khutbah",
    title: "Shalat Tahiyyatul Masjid saat Khatib Sedang Khutbah",
    keywords: [
      "tahiyyatul masjid",
      "khutbah sedang berlangsung",
      "masuk masjid waktu khutbah",
      "shalat saat khutbah",
      "shalat masjid",
    ],
    summary:
      "Bagi jamaah yang datang ke masjid saat khatib sedang berkhutbah Jumat, tetap disunnahkan melaksanakan shalat Tahiyyatul Masjid dua rakaat secara ringkas sebelum duduk mendengarkan khutbah.",
    dalil:
      "Hadits Jabir bin Abdillah r.a.: Sulaik al-Ghathafani datang pada hari Jumat saat Rasulullah SAW berkhutbah, lalu ia duduk. Nabi SAW bersabda: 'Wahai Sulaik, bangkitlah dan shalatlah dua rakaat, lakukanlah keduanya dengan ringan.' (HR. Bukhari no. 930 & Muslim no. 875).",
    putusanTarjih:
      "Majelis Tarjih memutuskan sunnah bagi makmum yang baru tiba saat khutbah Jumat untuk tetap shalat 2 rakaat tahiyyatul masjid secara singkat (khafifatain), kemudian duduk dengan tenang mendengarkan khutbah sampai selesai.",
    source: "HPT Jilid 1, Kitabus Shalah, Bab Shalat Jumat.",
  },
  {
    id: "shalat-id-lapangan",
    title: "Sunnah Shalat Idul Fitri & Idul Adha di Lapangan",
    keywords: [
      "shalat id di lapangan",
      "shalat idul fitri lapangan",
      "shalat idul adha lapangan",
      "shalat id",
      "lapangan vs masjid",
    ],
    summary:
      "Sunnah muakkadah yang dianjurkan oleh Rasulullah SAW dan ditegaskan Majelis Tarjih adalah menyelenggarakan Shalat Idul Fitri dan Idul Adha di tanah lapang terbuka, kecuali jika ada halangan hujan lebat.",
    dalil:
      "Hadits Abu Sa'id al-Khudri r.a.: 'Adalah Rasulullah SAW keluar pada hari raya Idul Fitri dan Idul Adha menuju ke lapangan (mushalla)...' (HR. Bukhari no. 956 & Muslim no. 889).",
    putusanTarjih:
      "Muhammadiyah memprioritaskan shalat Id di lapangan (seperti Halaman Gedung Induk Siti Walidah & Lapangan Kampus UMS) untuk menampakkan syiar Islam yang agung dan menghimpun seluruh elemen umat, termasuk wanita yang sedang berhalangan/haid yang disunnahkan hadir mendengarkan khutbah di tepi lapangan.",
    source: "HPT Jilid 1, Bab Shalat 'Iedain.",
  },
  {
    id: "bunga-bank",
    title: "Fatwa Majelis Tarjih tentang Bunga Bank & Perbankan",
    keywords: [
      "bunga bank",
      "bunga bank konvensional",
      "riba bank",
      "tabungan bank konvensional",
      "bank syariah",
      "hukum bunga bank",
    ],
    summary:
      "Majelis Tarjih PP Muhammadiyah menetapkan bahwa bunga bank konvensional termasuk riba nasiah yang hukumnya haram, dan merekomendasikan umat serta Amal Usaha Muhammadiyah (AUM) beralih ke perbankan dan lembaga keuangan syariah.",
    dalil:
      "QS. Al-Baqarah: 275: 'Allah telah menghalalkan jual beli dan mengharamkan riba.' Serta QS. Ali Imran: 130.",
    putusanTarjih:
      "Muktamar Tarjih Sidoarjo (1968) dan keputusan diperkuat berikutnya memutuskan: Bunga yang diberikan oleh bank-bank konvensional termasuk perkara riba dan haram. Namun dalam kondisi hajat/darurat umum bagi perorangan yang belum memungkinkan akses penuh ke bank syariah, diperkenankan sebatas kebutuhan darurat seraya terus berikhtiar beralih ke ekosistem keuangan syariah.",
    source: "Keputusan Munas Tarjih Sidoarjo 1968 & Buku Tanya Jawab Agama Suara Muhammadiyah.",
  },
  {
    id: "tahlilan-kematian",
    title: "Tuntunan Seputar Selamatan Kematian (Tahlilan)",
    keywords: [
      "tahlilan",
      "yasinan",
      "selamatan kematian",
      "7 hari kematian",
      "40 hari",
      "hari kematian",
      "tahlil arwah",
    ],
    summary:
      "Membaca kalimat tauhid dan mendoakan jenazah adalah sunnah terpuji. Namun mengkhususkan hari ke-3, 7, 40, atau 100 hari serta membebani keluarga duka menyuguhkan hidangan bagi pelayat tidak ada tuntunannya dalam Sunnah Shahihah.",
    dalil:
      "Hadits Jarir bin Abdullah al-Bajali r.a.: 'Kami (para sahabat) memandang bahwa berkumpul di rumah keluarga mayit dan membuat makanan setelah jenazah dikubur adalah bagian dari niyahah (meratapi mayit yang dilarang).' (HR. Ibnu Majah no. 1612 & Ahmad, shahih).",
    putusanTarjih:
      "Majelis Tarjih memandang bahwa doa untuk jenazah dapat dipanjatkan setiap saat tanpa terikat hari ke-3, 7, 40, atau 100. Adapun yang disunnahkan menurut hadits Ja'far bin Abi Thalib adalah para tetangga dan kerabat yang membuatkan makanan bagi keluarga duka ('Ashna'uu li-aali Ja'far tha'aaman'), bukan sebaliknya.",
    source: "Tanya Jawab Agama Suara Muhammadiyah Jilid 1 & Fatwa Tarjih seputar Janaiz.",
  },
  {
    id: "shalat-dhuha",
    title: "Tata Cara dan Waktu Shalat Dhuha",
    keywords: [
      "shalat dhuha",
      "sholat dhuha",
      "rakaat dhuha",
      "waktu dhuha",
      "dhuha",
      "keutamaan dhuha",
    ],
    summary:
      "Shalat Dhuha disunnahkan dikerjakan mulai naiknya matahari kira-kira setinggi tombak (sekitar 15-20 menit setelah syuruq) sampai menjelang waktu Dzuhur. Dikerjakan minimal 2 rakaat salam, 4 rakaat, atau hingga 8 rakaat.",
    dalil:
      "Hadits Abu Hurairah r.a.: 'Kekasihku (Rasulullah SAW) berpesan kepadaku tiga perkara: berpuasa tiga hari setiap bulan, shalat dua rakaat Dhuha, dan shalat witir sebelum tidur.' (HR. Bukhari no. 1981 & Muslim no. 721).",
    putusanTarjih:
      "Majelis Tarjih menganjurkan shalat Dhuha sebagai sedekah persendian tubuh harian. Waktu paling utamanya adalah saat panas matahari mulai terasa menyengat (shalatul awwaabiin). Setiap dua rakaat diakhiri salam.",
    source: "HPT Jilid 1, Kitabus Shalah, Bab Shalat Tathawwu'.",
  },
  {
    id: "puasa-sunnah",
    title: "Tuntunan Puasa-Puasa Sunnah",
    keywords: [
      "puasa sunnah",
      "ayyamul bidh",
      "puasa senin kamis",
      "puasa arafah",
      "puasa syawal",
      "puasa asyura",
      "puasa tasua",
    ],
    summary:
      "Puasa sunnah yang disyariatkan menurut Tarjih meliputi puasa 6 hari Syawal, puasa Arafah (9 Dzulhijjah), puasa Asyura & Tasu'a (9-10 Muharram), Ayyamul Bidh (13, 14, 15 Hijriyah), dan Senin-Kamis.",
    dalil:
      "Hadits Abu Ayyub al-Anshari r.a.: 'Barangsiapa berpuasa Ramadhan lalu melanjutkannya dengan enam hari di bulan Syawal, seolah-olah ia berpuasa sepanjang tahun.' (HR. Muslim no. 1164). Serta hadits puasa Arafah menghapus dosa setahun lalu dan setahun mendatang (HR. Muslim).",
    putusanTarjih:
      "Majelis Tarjih menetapkan puasa-puasa sunnah tersebut berdasarkan dalil shahih tanpa menambah puasa khusus yang tidak ada dasarnya. Niat puasa sunnah boleh dihadirkan di pagi hari selama belum makan, minum, atau melakukan pembatal puasa.",
    source: "HPT Jilid 1, Kitabus Shiyam, Bab Shaum Tathawwu'.",
  },
];
