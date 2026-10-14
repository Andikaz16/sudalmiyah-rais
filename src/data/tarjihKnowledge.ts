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
    keywords: ["tarawih", "witir", "rakaat", "ramadhan", "malam", "qiyamul lail", "tahajud", "11 rakaat"],
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
    keywords: ["iftitah", "doa iftitah", "bacaan shalat", "allahumma baid", "kabiro", "takbiratul ihram"],
    summary:
      "Bacaan doa iftitah yang rajih dan resmi menurut Himpunan Putusan Tarjih (HPT) adalah riwayat Abu Hurairah r.a. yang diawali dengan 'Allahumma baa'id bainii wa baina khathaayaaya...'",
    dalil:
      "Hadits shahih riwayat Abu Hurairah r.a. dalam Shahih Bukhari (no. 744) dan Shahih Muslim (no. 598): Rasulullah SAW diam sejenak setelah takbiratul ihram dan membaca doa ini sebelum membaca Al-Fatihah.",
    putusanTarjih:
      "Teks doa iftitah HPT:\n'Allahumma baa'id bainii wa baina khathaayaaya kamaa baa'adta bainal masyriqi wal maghrib. Allahumma naqqinii minal khathaayaa kamaa yunaqqats tsaubul abyadhu minad danas. Allahummaghsil khathaayaaya bil maa-i wats tsalji wal barad.'\n(Artinya: Ya Allah, jauhkanlah antara aku dan kesalahan-kesalahanku sebagaimana Engkau menjauhkan antara timur dan barat. Ya Allah, bersihkanlah aku dari kesalahan sebagaimana pakaian putih dibersihkan dari kotoran. Ya Allah, cucilah kesalahan-kesalahanku dengan air, salju, dan embun).",
    source: "Himpunan Putusan Tarjih (HPT) Jilid 1, Kitabus Shalah, Tata Cara Shalat Nabi SAW.",
  },
  {
    id: "basmalah-fatihah",
    title: "Bacaan Basmalah dalam Shalat Jahriyah (Sirr)",
    keywords: ["basmalah", "bismillah", "sirr", "jahr", "fatihah", "fardhu", "maghrib", "isya", "subuh"],
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
    keywords: ["qunut", "subuh", "doa qunut", "nazilah", "hukum qunut"],
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
    keywords: ["adzan jumat", "adzan 1 kali", "adzan 2 kali", "khutbah jumat", "shalat jumat"],
    summary:
      "Masjid Muhammadiyah (termasuk Masjid Sudalmiyah Rais UMS) mengamalkan adzan shalat Jumat sebanyak 1 kali, yaitu dikumandangkan tepat saat khatib telah menaiki mimbar.",
    dalil:
      "Hadits Saib bin Yazid r.a.: 'Sesungguhnya seruan adzan pada hari Jumat pada masa Rasulullah SAW, Abu Bakar, dan Umar adalah ketika imam telah duduk di atas mimbar.' (HR. Bukhari no. 912).",
    putusanTarjih:
      "Majelis Tarjih memutuskan bahwa adzan shalat Jumat yang paling tepat dengan sunnah Nabi SAW adalah satu kali adzan saat khatib naik ke mimbar. Penambahan adzan kedua pada masa Khalifah Utsman r.a. di pasar az-Zaura bersifat kebijakan kontekstual saat perluasan kota Madinah, dan di era modern dengan adanya jam/pengeras suara, satu kali adzan mencukupi dan selaras dengan sunnah awal.",
    source: "HPT Jilid 1, Kitabus Shalah, Bab Shalat Jumat.",
  },
  {
    id: "khgt-hisab",
    title: "Kalender Hijriyah Global Tunggal (KHGT) & Hisab Tarjih",
    keywords: ["khgt", "kalender hijriyah", "hisab", "rukyatul hilal", "astronomi", "muhammadiyah", "awal puasa", "idul fitri", "1 syawal", "1 ramadhan"],
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
    title: "Tuntunan Shalat Jamak & Qashar Mahasiswa/Musafir",
    keywords: ["jamak", "qashar", "musafir", "perjalanan", "pulang kampung", "mahasiswa", "shalat di jalan"],
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
    keywords: ["zakat fitrah", "beras", "uang", "kadar zakat", "ramadhan", "idul fitri", "fakir miskin"],
    summary:
      "Zakat fitrah wajib ditunaikan bagi setiap muslim menjelang Idul Fitri sebesar 1 sha' makanan pokok (setara 2,5 kg atau 3 kg beras menurut kehati-hatian), dan menurut Tarjih boleh dikonversikan ke dalam nilai uang yang setara.",
    dalil:
      "Hadits Ibnu Umar r.a.: 'Rasulullah SAW mewajibkan zakat fitrah sebanyak satu sha' kurma atau satu sha' gandum bagi setiap orang merdeka atau budak...' (HR. Bukhari no. 1503 & Muslim no. 984).",
    putusanTarjih:
      "Majelis Tarjih menetapkan bahwa menunaikan zakat fitrah dengan uang seharga beras/makanan pokok adalah sah dan diperbolehkan jika hal tersebut lebih maslahat dan memudahkan penerima (mustahik) dalam memenuhi kebutuhan hidupnya.",
    source: "HPT Jilid 2, Kitab Zakat & Fatwa Tarjih seputar Zakat Fitrah Kontemporer.",
  },
  {
    id: "shalat-id-lapangan",
    title: "Sunnah Shalat Idul Fitri & Idul Adha di Lapangan",
    keywords: ["shalat id", "idul fitri", "idul adha", "lapangan", "sunnah nabi", "kampus 2 ums"],
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
    keywords: ["bunga bank", "riba", "bank syariah", "fintech", "hukum bank", "investasi"],
    summary:
      "Majelis Tarjih PP Muhammadiyah menetapkan bahwa bunga bank konvensional termasuk riba nasiah yang hukumnya haram, dan merekomendasikan umat serta Amal Usaha Muhammadiyah (AUM) beralih ke perbankan dan lembaga keuangan syariah.",
    dalil:
      "QS. Al-Baqarah: 275: 'Allah telah menghalalkan jual beli dan mengharamkan riba.' Serta QS. Ali Imran: 130.",
    putusanTarjih:
      "Muktamar Tarjih Sidoarjo (1968) dan keputusan diperkuat berikutnya memutuskan: Bunga yang diberikan oleh bank-bank konvensional termasuk perkara riba dan haram. Namun dalam kondisi hajat/darurat umum bagi perorangan yang belum memungkinkan akses penuh ke bank syariah, diperkenankan sebatas kebutuhan darurat seraya terus berikhtiar beralih ke ekosistem keuangan syariah.",
    source: "Keputusan Munas Tarjih Sidoarjo 1968 & Buku Tanya Jawab Agama Suara Muhammadiyah.",
  },
];
