/**
 * Arabic Detection and Transliteration Helper for Khutbah Jumat
 * Menyediakan deteksi teks Arab dan teks bacaan Latin (transliterasi) yang akurat,
 * bersih dari karakter aneh (kotak unicode/tanda tanya), dan sesuai kaidah tajwid
 * serta pelafalan fonetis bahasa Indonesia untuk para khatib di mimbar.
 */

// Karakter Arab umum dan varian Quranic
const ARABIC_CHAR_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * Memeriksa apakah suatu baris/paragraf merupakan teks berbahasa Arab
 */
export function isArabicParagraph(text: string): boolean {
  if (!text || typeof text !== "string") return false;

  const trimmed = text.trim();
  if (trimmed.length < 5) return false;

  const lettersOnly = trimmed.replace(/[\s\d.,!?;:()'"«»\-–—/]/g, "");
  if (!lettersOnly) return false;

  let arabicCount = 0;
  for (const ch of lettersOnly) {
    if (ARABIC_CHAR_REGEX.test(ch)) {
      arabicCount++;
    }
  }

  return (
    arabicCount / lettersOnly.length > 0.28 ||
    /إِنَّ|إِنَّ|الْحَمْدُ|اَلْحَمْدُ|اللَّهُ|اللّٰه|اللَّه|رَسُولُ|صَلَّى|آمَنُوا|ءَامَنُوا|تَعَالَى|أَمَّا بَعْدُ|بَارَكَ اللَّهُ|بَارَكَ اللهُ|يَا أَيُّهَا|يَٰٓأَيُّهَا/.test(
      trimmed
    )
  );
}

interface TransliterationEntry {
  pattern: RegExp;
  latin: string;
}

/**
 * Kamus teks & ayat khutbah yang sering dibaca dengan transliterasi baku Kementerian Agama / kaidah tajwid Indonesia
 */
const DICTIONARY: TransliterationEntry[] = [
  // --- AYAT SPESIFIK & HADITS DARI NASKAH ---
  {
    // QS. Al-Baqarah: 188 (Larangan memakan harta bathil)
    pattern: /وَلَا تَأْكُلُوٓاْ أَمۡوَٰلَكُم|ولا تأكلوا أموالكم بينكم بالباطل/i,
    latin:
      "Wa laa ta'kuluu amwaalakum baynakum bil-baathili wa tudluu bihaa ilal-hukkaami lita'kuluu fariiqam-min amwaalin-naasi bil-itsmi wa antum ta'lamuun (QS. Al-Baqarah: 188).",
  },
  {
    // QS. Al-Hujurat: 6 (Perintah Tabayyun)
    pattern: /يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓاْ إِن جَآءَكُمۡ|يا أيها الذين آمنوا إن جاءكم فاسق/i,
    latin:
      "Yaa ayyuhalladziina aamanuu in jaa-akum faasiqum bi naba-in fa tabayyanuu an tushiibuu qawmam bi jahaalatin fa tushbihuu 'alaa maa fa'altum naadimiin (QS. Al-Hujurat: 6).",
  },
  {
    // QS. At-Tahrim: 6 (Menjaga diri dan keluarga dari api neraka)
    pattern: /يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُواْ قُوٓاْ أَنفُسَكُمۡ|قوا أنفسكم وأهليكم نارا/i,
    latin:
      "Yaa ayyuhalladziina aamanuu quu anfusakum wa ahliikum naaran waquuduhan-naasu wal-hijaaratu 'alayhaa malaa-ikatun ghilaadhun syidaad (QS. At-Tahrim: 6).",
  },
  {
    // QS. Ali 'Imran: 102 (Wasiat Taqwa)
    pattern: /يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ حَقَّ تُقَاتِهِ|يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ حَقَّ تُقَاتِهِ|اتقوا الله حق تقاته/i,
    latin:
      "Yaa ayyuhalladziina aamanuttaqullaaha haqqa tuqaatihii wa laa tamuutunna illaa wa antum muslimuun (QS. Ali 'Imran: 102).",
  },
  {
    // QS. Ali 'Imran: 104 (Amar ma'ruf nahi munkar)
    pattern: /وَلۡتَكُن مِّنكُمۡ أُمَّةٞ يَدۡعُونَ|ولتكن منكم أمة يدعون إلى الخير/i,
    latin:
      "Waltakum minkum ummatuy yad'uuna ilal khayri wa ya'muruuna bil ma'ruufi wa yan-hawna 'anil munkari wa ulaa-ika humul muflihuun (QS. Ali 'Imran: 104).",
  },
  {
    // QS. An-Nisa': 1
    pattern: /يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُمْ/i,
    latin:
      "Yaa ayyuhan-naasuttaquu rabbakumulladzii khalaqakum min nafsiw-waahidah, wa khalaqa minhaa zawjahaa wa batstsa minhumaa rijaalan katsiiraw-wa nisaa-aa (QS. An-Nisa': 1).",
  },
  {
    // QS. Al-Ahzab: 70-71
    pattern: /يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَقُولُوا قَوْلًا سَدِيدًا/i,
    latin:
      "Yaa ayyuhalladziina aamanuttaqullaaha wa quuluu qawlan sadiidaa, yushlih lakum a'maalakum wa yaghfir lakum dzunuubakum, wa may-yuthi'illaaha wa rasuulahuu faqad faaza fawzan 'azhiimaa (QS. Al-Ahzab: 70-71).",
  },
  {
    // QS. Al-Ahzab: 56 (Perintah Shalawat)
    pattern: /إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ|إِنَّ اللّٰهَ وَمَلَائِكَتَهُ يُصَلُّونَ/i,
    latin:
      "Innallaaha wa malaa-ikatahuu yushalluuna 'alan-nabiyy, yaa ayyuhalladziina aamanuu shalluu 'alayhi wa sallimuu tasliimaa (QS. Al-Ahzab: 56).",
  },
  {
    // QS. At-Taubah: 18 (Memakmurkan masjid)
    pattern: /إِنَّمَا يَعْمُرُ مَسَاجِدَ اللَّهِ/i,
    latin:
      "Innamaa ya'muru masaajidallaahi man aamana billaahi wal yawmil aakhiri wa aqaamash-shalaata wa aatadz-dzakaata wa lam yakhsya illallaah, fa 'asaa ulaa-ika ay-yakuunuu minal muhtadiin (QS. At-Taubah: 18).",
  },
  {
    // QS. Al-Hujurat: 12 (Larangan ghibah)
    pattern: /يَا أَيُّهَا الَّذِينَ آمَنُوا اجْتَنِبُوا كَثِيرًا مِنَ الظَّنِّ/i,
    latin:
      "Yaa ayyuhalladziina aamanuj-tanibuu katsiiram minazh-zhanni inna ba'dhazh-zhanni itsmuw-wa laa tajassasuu wa laa yaghtab ba'dhukum ba'dhaa (QS. Al-Hujurat: 12).",
  },
  {
    // QS. Ar-Ra'd: 28
    pattern: /أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ/i,
    latin: "Alaa bi dzikrillaahi tathma-innul quluub (QS. Ar-Ra'd: 28).",
  },
  {
    // QS. Al-Baqarah: 153
    pattern: /إِنَّ اللَّهَ مَعَ الصَّابِرِينَ/i,
    latin: "Innallaaha ma'ash-shaabiriin (QS. Al-Baqarah: 153).",
  },
  {
    // QS. At-Tin: 4
    pattern: /لَقَدْ خَلَقْنَا الْإِنسَانَ فِي أَحْسَنِ تَقْوِيمٍ/i,
    latin: "Laqad khalaqnal insaana fii ahsani taqwiim (QS. At-Tin: 4).",
  },
  {
    // QS. Al-'Alaq: 1
    pattern: /اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ/i,
    latin: "Iqra' bismi rabbikalladzii khalaq (QS. Al-'Alaq: 1).",
  },
  {
    // QS. Al-Jumu'ah: 10
    pattern: /فَإِذَا قُضِيَتِ الصَّلَاةُ فَانْتَشِرُوا فِي الْأَرْضِ/i,
    latin:
      "Fa idzaa qudhiyatish-shalaatu fantasyiruu fil ardhi wabtaghuu min fadhlillaahi wadzkurullaaha katsiiral la'allakum tuflihuun (QS. Al-Jumu'ah: 10).",
  },
  {
    // QS. Al-A'raf: 23
    pattern: /رَبَّنَا ظَلَمْنَا أَنْفُسَنَا/i,
    latin:
      "Rabbanaa zhalamnaa anfusanaa wa il-lam taghfir lanaa wa tarhamnaa lanakuunanna minal khaasiriin (QS. Al-A'raf: 23).",
  },
  {
    // QS. Ali 'Imran: 8
    pattern: /رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا/i,
    latin:
      "Rabbanaa laa tuzigh quluubanaa ba'da idz hadaytanaa wa hab lanaa mil ladunka rahmah, innaka antal wahhaab (QS. Ali 'Imran: 8).",
  },
  {
    // QS. Al-Furqan: 74
    pattern: /رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا/i,
    latin:
      "Rabbanaa hab lanaa min azwaajinaa wa dzurriyyaatinaa qurrata a'yunin waj'alnaa lil muttaqiina imaamaa (QS. Al-Furqan: 74).",
  },
  {
    // QS. Ash-Shaffat: 180-182
    pattern: /سُبْحَانَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُونَ/i,
    latin:
      "Subhaana rabbika rabbil 'izzati 'ammaa yashifuun, wa salaamun 'alal mursaliin, wal hamdu lillaahi rabbil 'aalamiin (QS. Ash-Shaffat: 180-182).",
  },

  // --- HADITS NABI SAW ---
  {
    // Hadits Mengubah Kemungkaran
    pattern: /مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ/i,
    latin:
      "Man ra-aa minkum munkaran falyughayyirhu bi yadih, fa il-lam yastathi' fa bi lisaanih, fa il-lam yastathi' fa bi qalbih, wa dzaalika adh'aful iimaan (HR. Muslim).",
  },
  {
    // Hadits Mukmin Kuat
    pattern: /الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ/i,
    latin:
      "Al-mu'minul qawiyyu khayruw-wa ahabbu ilallaahi minal mu'minidh-dha'iif, wa fii kullin khayr (HR. Muslim).",
  },
  {
    // Hadits Bukanlah Orang Kuat dengan Bergulat
    pattern: /لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ/i,
    latin:
      "Laysasy-syadiidu bish-shura'ah, innamasy-syadiidulladzii yamliku nafsahuu 'indal ghadhab (HR. Bukhari & Muslim).",
  },
  {
    // Hadits Menuntut Ilmu
    pattern: /مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا/i,
    latin:
      "Man salaka thariiqan yaltamisu fiihi 'ilman, sahhalallaahu lahuu bihii thariiqan ilal jannah (HR. Muslim).",
  },
  {
    // Hadits 5 Perkara sebelum 5 Perkara
    pattern: /اِغْتَنِمْ خَمْسًا قَبْلَ خَمْسٍ|شَبَابَكَ قَبْلَ هَرَمِكَ/i,
    latin:
      "Ightanim khamsan qabla khams: syabaabaka qabla haramik, wa shihhataka qabla saqamik, wa ghinaaka qabla faqrik, wa faraaghaka qabla syughlik, wa hayaataka qabla mawtik (HR. Al-Hakim).",
  },
  {
    // Hadits Kezaliman adalah kegelapan
    pattern: /الظُّلْمُ ظُلُمَاتٌ يَوْمَ الْقِيَامَةِ/i,
    latin: "Azh-zhulmu zhulumaatun yawmal qiyaamah (HR. Al-Bukhari & Muslim).",
  },
  {
    // Hadits Menunda utang
    pattern: /مَطْلُ الْغَنِيِّ ظُلْمٌ/i,
    latin: "Mathlul ghaniyyi zhulmun (HR. Bukhari).",
  },
  {
    // Hadits Menyebarkan berita tanpa saring
    pattern: /كَفَى بِالْمَرْءِ كَذِبًا أَنْ يُحَدِّثَ بِكُلِّ مَا سَمِعَ/i,
    latin: "Kafaa bil-mar'i katsiban ay-yuhadditsa bi kulli maa sami'a (HR. Muslim).",
  },
  {
    // Doa Peneguh Hati
    pattern: /يَا مُقَلِّبَ الْقُلُوبِ،? ثَبِّتْ قُلُوبَنَا/i,
    latin:
      "Yaa muqallibal quluub, tsabbit quluubanaa 'alaa diinik, Allaahumma musharrifal quluub, sharrif quluubanaa 'alaa thaa'atik.",
  },
  {
    // Doa Kebenaran & Kebathilan
    pattern: /اللَّهُمَّ أَرِنَا الْحَقَّ حَقًّا/i,
    latin:
      "Allaahumma arinal haqqa haqqaw-warzuqnat-tibaa'ah, wa arinal baathila baathilaw-warzuqnaj-tinaabah.",
  },
  {
    // Doa Petunjuk, Ketaqwaan, Iffah, Ghina
    pattern: /اللَّهُمَّ إِنَّا نَسْأَلُكَ الْهُدَى وَالتُّقَى/i,
    latin: "Allaahumma innaa nas-alukal hudaa wat-tuqaa wal 'afaafa wal ghinaa (HR. Muslim).",
  },

  // --- FORMULA STANDAR RUKUN KHUTBAH JUMAT ---
  {
    // Khutbatul Hajah Pembuka
    pattern: /إِنَّ الْحَمْدَ لِلَّهِ|إن الحمد لله|إِنَّ الْحَمْدَ لِلَّهِ|إِنَّ اْلحَمْدَ لِلّهِ/i,
    latin:
      "Innal hamda lillaah, nahmaduhu wa nasta'iinuhu wa nastaghfiruh, wa na'uudzu billaahi min syuruuri anfusinaa wa min sayyi-aati a'maalinaa, may-yahdihillaahu falaa mudhilla lah, wa may-yudhlil falaa haadiya lah.",
  },
  {
    // Syahadatain
    pattern: /أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ|أشهد أن لا إله إلا الله|أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللَّهُ/i,
    latin:
      "Asyhadu allaa ilaaha illallaahu wahdahu laa syariika lah, wa asyhadu anna Muhammadan 'abduhuu wa rasuuluh, laa nabiyya wa laa rasuula ba'dah.",
  },
  {
    // Shalawat Pembuka
    pattern: /اللَّهُمَّ صَلِّ وَسَلِّمْ|اللهم صل وسلم|اللَّهُمَّ صَلِّ وَسَلِّمْ/i,
    latin:
      "Allaahumma shalli wa sallim wa baarik 'alaa nabiyyinaa Muhammad, wa 'alaa aalihii wa ash-haabihii ajma'iin, wa man tabi'ahum bi ihsaanin ilaa yawmid-diin.",
  },
  {
    // Amma Ba'du & Wasiat Taqwa
    pattern: /أَمَّا بَعْدُ،? فَيَا عِبَادَ اللَّهِ|أَمَّا بَعْدُ/i,
    latin:
      "Amma ba'du, fa yaa 'ibaadallaah, uushiikum wa nafsii bi taqwallaahil 'azhiim, faqad faazal muttaquun.",
  },
  {
    // Penutup Khutbah Pertama (Baarakallaahu lii wa lakum)
    pattern: /بَارَكَ اللَّهُ لِي وَلَكُمْ فِي الْقُرْآنِ الْعَظِيمِ|بَارَكَ اللهُ لِي وَلَكُمْ/i,
    latin:
      "Baarakallaahu lii wa lakum fil qur'aanil 'azhiim, wa nafa'anii wa iyyaakum bimaa fiihi minal aayaati wadz-dzikril hakiim. Aquulu qawlii haadzaa wa astaghfirullaahal 'azhiima lii wa lakum wa li saairil muslimiin, fastaghfiruuhu innahuu huwal ghafuurur-rahiim.",
  },
  {
    // Pembuka Khutbah Kedua
    pattern: /الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ|الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا|اَلْحَمْدُ لِلّهِ رَبِّ اْلعَالَمِيْنَ/i,
    latin:
      "Alhamdulillaahi rabbil 'aalamiin, wash-shalaatu was-salaamu 'alaa rasuulihil kariim, sayyidinaa wa habiibinaa Muhammadin wa 'alaa aalihii wa shahbihii ajma'iin.",
  },
  {
    // Shalawat Ibrahimiyyah
    pattern: /اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ|اَللّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ/i,
    latin:
      "Allaahumma shalli 'alaa Muhammad wa 'alaa aali Muhammad, kamaa shallayta 'alaa Ibraahiim wa 'alaa aali Ibraahiim, wa baarik 'alaa Muhammad wa 'alaa aali Muhammad, kamaa baarakta 'alaa Ibraahiim wa 'alaa aali Ibraahiim fil 'aalamiina innaka hamiidum-majiid.",
  },
  {
    // Doa Ampunan Kaum Muslimin
    pattern: /اللَّهُمَّ اغْفِرْ لِلْمُسْلِمِينَ وَالْمُسْلِمَاتِ|اللهم اغفر للمسلمين والمسلمات|اَللّٰهُمَّ اغْفِرْ لِلْمُؤْمِنِينَ|اَلَّلهُمَ اغْفِرْ/i,
    latin:
      "Allaahummagh-fir lil muslimiina wal muslimaat, wal mu'miniina wal mu'minaat, al-ahyaa-i minhum wal amwaat. Allaahumma a'izzal Islaama wal muslimiin, wa ashlih ahwaalal muslimiina fii kulli makaan.",
  },
  {
    // Doa Sapu Jagad
    pattern: /رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً|رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً|ربنا آتنا في الدنيا حسنة|رَبَّناَاٰتِناَ فِي الدُّنْياَ/i,
    latin:
      "Rabbanaa aatinaa fid-dunyaa hasanah, wa fil aakhirati hasanah, wa qinaa 'adzaaban-naar.",
  },
  {
    // Perintah Keadilan Penutup Khutbah Kedua
    pattern: /عِبَادَ اللَّهِ،? إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ|عِبَادَ اللّٰهِ، إِنَّ اللّٰهَ يَأْمُرُ/i,
    latin:
      "'Ibaadallaah, innallaaha ya'muru bil 'adli wal ihsaan wa iitaa-i dzil qurbaa wa yan-haa 'anil fahsyaa-i wal munkari wal bagh-yi, ya'izhukum la'allakum tadzakkaruun. Fadzkurullaahal 'azhiima yadzkurkum, wasykuruuhu 'alaa ni'amihii yazidkum, wa ladzikrullaahi akbar.",
  },
];

/**
 * Transliterasi per kata algoritmis bersih tanpa karakter aneh (kotak unicode)
 */
function transliterateWord(word: string): string {
  let w = word.trim();
  if (!w) return "";

  // 1. Bersihkan tanda waqaf, tanda baca Quranik, dan aksen tak tercetak
  w = w.replace(/\u0671/g, "ا"); // Alif Waslah ٱ -> ا
  w = w.replace(/[\u0653\u0654\u0655\u06DF\u06E0\u06E1\u06E2\u0640]/g, ""); // Maddah, silent zero, tatweel
  w = w.replace(/[\u0610-\u061A\u06D6-\u06ED]/g, ""); // Tanda waqaf Quran (shala, qala, jim, dll)

  // 2. Frasa Keagungan Allah
  if (/^ٱ?لله$|^اللّٰه$|^اللَّه$|^الله$/.test(w)) return "Allaah";
  if (/^لِلّٰهِ$|^لِلَّهِ$|^لله$/.test(w)) return "lillaah";
  if (/^بِٱ?للّٰهِ$|^بِاللَّهِ$/.test(w)) return "billaah";
  if (/^وَٱ?للّٰهِ$|^وَاللَّهِ$/.test(w)) return "wallaah";

  // 3. Prefiks Alif Lam
  w = w.replace(/^(?:اَلْ|الْ|اَلۡ|الۡ|ٱلۡ|ٱلْ|اَلّ|الّ|ٱلّ)([\u062A\u062B\u062F\u0630\u0631\u0632\u0633\u0634\u0635\u0636\u0637\u0638\u0644\u0646])/g, "al-$1");
  w = w.replace(/^(?:بِالْ|بِٱلۡ|بِالۡ|بِٱلْ)/g, "bil-");
  w = w.replace(/^(?:لِلْ|لِلۡ)/g, "lil-");
  w = w.replace(/^(?:فِي الْ|فِي ٱلۡ|فِيالْ)/g, "fil-");

  // 4. Akhiran Jamak Kata Kerja (Waw Alif -> uu)
  w = w.replace(/[\u064F]?\u0648[\u0653]?\u0627$/g, "uu");
  w = w.replace(/[\u064F]?\u0648[\u0652]?\u0646\u064E?$/g, "uun"); // ـُونَ / ـُوْنَ
  w = w.replace(/[\u0650]?\u064A[\u0652]?\u0646\u064E?$/g, "iin"); // ـِينَ / ـِيْنَ

  // 5. Dagger Alif (Alif Khanjariyah \u0670) -> aa
  w = w.replace(/\u0670/g, "aa");

  // 6. Pemanjangan Vokal (Mad Thabi'i)
  w = w.replace(/\u064E\u0627/g, "aa"); // Fathah + Alif
  w = w.replace(/\u064E\u0649/g, "aa"); // Fathah + Alif Maqshurah
  w = w.replace(/\u0650\u064A\u0652?/g, "ii"); // Kasrah + Ya
  w = w.replace(/\u064F\u0648\u0652?/g, "uu"); // Dhommah + Waw

  // 7. Tanwin
  w = w.replace(/[\u064B\u0657\u064F\u06E2]\u0627?$/g, "an");
  w = w.replace(/[\u064D\u0656]$/g, "in");
  w = w.replace(/[\u064C\u0658]$/g, "un");

  // 8. Harakat Tunggal
  w = w.replace(/\u064E/g, "a");
  w = w.replace(/\u0650/g, "i");
  w = w.replace(/\u064F/g, "u");
  w = w.replace(/\u0652/g, ""); // Sukun mati (tidak perlu tanda kutip)

  // 9. Huruf Hijaiyah ke Fonetik Indonesia
  const CMAP: Record<string, string> = {
    "ء": "'",
    "آ": "aa",
    "أ": "a",
    "إ": "i",
    "ؤ": "'",
    "ئ": "'",
    "ا": "a",
    "ب": "b",
    "ة": "h",
    "ت": "t",
    "ث": "ts",
    "ج": "j",
    "ح": "h",
    "خ": "kh",
    "د": "d",
    "ذ": "dz",
    "ر": "r",
    "ز": "z",
    "س": "s",
    "ش": "sy",
    "ص": "sh",
    "ض": "dh",
    "ط": "th",
    "ظ": "zh",
    "ع": "'",
    "غ": "gh",
    "ف": "f",
    "ق": "q",
    "ك": "k",
    "ل": "l",
    "م": "m",
    "ن": "n",
    "ه": "h",
    "و": "w",
    "ى": "aa",
    "ي": "y",
  };

  let res = "";
  for (let i = 0; i < w.length; i++) {
    const ch = w[i];
    const next = w[i + 1];

    // Syaddah / Tasydid: gandakan konsonan
    if (next === "\u0651") {
      const tr = CMAP[ch] || ch;
      res += tr + tr;
      i++;
      continue;
    }

    if (CMAP[ch] !== undefined) {
      res += CMAP[ch];
    } else {
      res += ch;
    }
  }

  // 10. Pembersihan Tanda Kutip Cacat & Spasi Ganda
  res = res.replace(/^'+/g, ""); // Hapus tanda kutip di awal kata
  res = res.replace(/'+/g, "'");
  res = res.replace(/([bcdfghjklmnpqrstvwxyz])'([bcdfghjklmnpqrstvwxyz])/gi, "$1$2");
  res = res.replace(/a'a/gi, "aa");
  res = res.replace(/i'i/gi, "ii");
  res = res.replace(/u'u/gi, "uu");

  return res;
}

/**
 * Mendapatkan bacaan Latin untuk teks berbahasa Arab secara menyeluruh
 */
export function getArabicTransliteration(arabicText: string): string | null {
  if (!arabicText || !isArabicParagraph(arabicText)) {
    return null;
  }

  // 1. Cocokkan dengan kamus doa, rukun khutbah, dan ayat standar
  for (const entry of DICTIONARY) {
    if (entry.pattern.test(arabicText)) {
      return entry.latin;
    }
  }

  // 2. Transliterasi kata per kata yang disempurnakan (fallback algoritmis)
  const words = arabicText.split(/\s+/);
  const outWords = words.map(transliterateWord);
  let result = outWords.join(" ");

  // Bersihkan karakter tak tercetak atau sisa kotak unicode
  result = result.replace(/[\u0000-\u001F\u007F-\u009F\uFFFD\u25A0\u25A1\u25AF]/g, "");
  result = result.replace(/([a-zA-Z])\s+([.,;:?!])/g, "$1$2");
  result = result.replace(/\s+/g, " ").trim();

  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  return result || null;
}
