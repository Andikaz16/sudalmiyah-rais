/**
 * Arabic Detection and Transliteration Helper for Khutbah Jumat
 * Menyediakan deteksi teks Arab dan teks bacaan Latin (transliterasi)
 * untuk memudahkan para khatib dan pembaca naskah khutbah.
 */

// Regex untuk mendeteksi karakter Arab
const ARABIC_CHAR_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * Memeriksa apakah suatu paragraf atau baris merupakan teks berbahasa Arab
 */
export function isArabicParagraph(text: string): boolean {
  if (!text || typeof text !== "string") return false;

  const trimmed = text.trim();
  if (trimmed.length < 5) return false;

  // Hapus spasi dan tanda baca standar
  const lettersOnly = trimmed.replace(/[\s\d.,!?;:()'"«»\-–—/]/g, "");
  if (!lettersOnly) return false;

  let arabicCount = 0;
  for (const ch of lettersOnly) {
    if (ARABIC_CHAR_REGEX.test(ch)) {
      arabicCount++;
    }
  }

  // Jika mayoritas atau lebih dari 30% huruf adalah Arab, atau terdapat frasa pembuka/khutbah utama
  return (
    arabicCount / lettersOnly.length > 0.3 ||
    /إِنَّ|الْحَمْدُ|اللَّهُ|اللَّهَ|رَسُولُ|صَلَّى|آمَنُوا|تَعَالَى|أَمَّا بَعْدُ|بَارَكَ اللَّهُ/.test(trimmed)
  );
}

interface TransliterationEntry {
  pattern: RegExp;
  latin: string;
}

const DICTIONARY: TransliterationEntry[] = [
  {
    pattern: /إِنَّ الْحَمْدَ لِلَّهِ|إن الحمد لله|إِنَّ الْحَمْدَ لِلَّهِ/i,
    latin:
      "Innal hamda lillaah, nahmaduhu wa nasta'iinuhu wa nastaghfiruh, wa na'uudzu billaahi min syuruuri anfusinaa wa min sayyi-aati a'maalinaa, may-yahdihillaahu falaa mudhilla lah, wa may-yudhlil falaa haadiya lah.",
  },
  {
    pattern: /أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ|أشهد أن لا إله إلا الله|أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللَّهُ/i,
    latin:
      "Asyhadu allaa ilaaha illallaahu wahdahu laa syariika lah, wa asyhadu anna Muhammadan 'abduhuu wa rasuuluh, laa nabiyya wa laa rasuula ba'dah.",
  },
  {
    pattern: /اللَّهُمَّ صَلِّ وَسَلِّمْ|اللهم صل وسلم|اللَّهُمَّ صَلِّ وَسَلِّمْ/i,
    latin:
      "Allaahumma shalli wa sallim wa baarik 'alaa nabiyyinaa Muhammad, wa 'alaa aalihii wa ash-haabihii ajma'iin, wa man tabi'ahum bi ihsaanin ilaa yawmid-diin.",
  },
  {
    pattern: /يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ حَقَّ تُقَاتِهِ|يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ حَقَّ تُقَاتِهِ/i,
    latin:
      "Yaa ayyuhalladziina aamanuttaqullaaha haqqa tuqaatihii wa laa tamuutunna illaa wa antum muslimuun (QS. Ali 'Imran: 102).",
  },
  {
    pattern: /يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُمْ/i,
    latin:
      "Yaa ayyuhan-naasuttaquu rabbakumulladzii khalaqakum min nafsiw-waahidah, wa khalaqa minhaa zawjahaa wa batstsa minhumaa rijaalan katsiiraw-wa nisaa-aa (QS. An-Nisa': 1).",
  },
  {
    pattern: /يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَقُولُوا قَوْلًا سَدِيدًا/i,
    latin:
      "Yaa ayyuhalladziina aamanuttaqullaaha wa quuluu qawlan sadiidaa, yushlih lakum a'maalakum wa yaghfir lakum dzunuubakum, wa may-yuthi'illaaha wa rasuulahuu faqad faaza fawzan 'azhiimaa (QS. Al-Ahzab: 70-71).",
  },
  {
    pattern: /أَمَّا بَعْدُ، فَيَا عِبَادَ اللَّهِ|أَمَّا بَعْدُ/i,
    latin:
      "Amma ba'du, fa yaa 'ibaadallaah, uushiikum wa nafsii bi taqwallaahil 'azhiim, faqad faazal muttaquun.",
  },
  {
    pattern: /بَارَكَ اللَّهُ لِي وَلَكُمْ فِي الْقُرْآنِ الْعَظِيمِ|بارك الله لي ولكم في القرآن العظيم/i,
    latin:
      "Baarakallaahu lii wa lakum fil qur'aanil 'azhiim, wa nafa'anii wa iyyaakum bimaa fiihi minal aayaati wadz-dzikril hakiim. Aquulu qawlii haadzaa wa astaghfirullaahal 'azhiima lii wa lakum wa li saairil muslimiin, fastaghfiruuhu innahuu huwal ghafuurur-rahiim.",
  },
  {
    pattern: /الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ|الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا/i,
    latin:
      "Alhamdulillaahi rabbil 'aalamiin, wash-shalaatu was-salaamu 'alaa rasuulihil kariim, sayyidinaa wa habiibinaa Muhammadin wa 'alaa aalihii wa shahbihii ajma'iin.",
  },
  {
    pattern: /اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ/i,
    latin:
      "Allaahumma shalli 'alaa Muhammad wa 'alaa aali Muhammad, kamaa shallayta 'alaa Ibraahiim wa 'alaa aali Ibraahiim, wa baarik 'alaa Muhammad wa 'alaa aali Muhammad, kamaa baarakta 'alaa Ibraahiim wa 'alaa aali Ibraahiim fil 'aalamiina innaka hamiidum-majiid.",
  },
  {
    pattern: /اللَّهُمَّ اغْفِرْ لِلْمُسْلِمِينَ وَالْمُسْلِمَاتِ|اللهم اغفر للمسلمين والمسلمات/i,
    latin:
      "Allaahummagh-fir lil muslimiina wal muslimaat, wal mu'miniina wal mu'minaat, al-ahyaa-i minhum wal amwaat. Allaahumma a'izzal Islaama wal muslimiin, wa ashlih ahwaalal muslimiina fii kulli makaan.",
  },
  {
    pattern: /رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً|ربنا آتنا في الدنيا حسنة/i,
    latin:
      "Rabbanaa aatinaa fid-dunyaa hasanah, wa fil aakhirati hasanah, wa qinaa 'adzaaban-naar.",
  },
  {
    pattern: /عِبَادَ اللَّهِ، إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ|إن الله يأمر بالعدل والإحسان/i,
    latin:
      "'Ibaadallaah, innallaaha ya'muru bil 'adli wal ihsaan wa iitaa-i dzil qurbaa wa yan-haa 'anil fahsyaa-i wal munkari wal bagh-yi, ya'izhukum la'allakum tadzakkaruun. Fadzkurullaahal 'azhiima yadzkurkum, wasykuruuhu 'alaa ni'amihii yazidkum, wa ladzikrullaahi akbar.",
  },
  {
    pattern: /اِغْتَنِمْ خَمْسًا قَبْلَ خَمْسٍ|شَبَابَكَ قَبْلَ هَرَمِكَ/i,
    latin:
      "Ightanim khamsan qabla khams: syabaabaka qabla haramik, wa shihhataka qabla saqamik, wa ghinaaka qabla faqrik, wa faraaghaka qabla syughlik, wa hayaataka qabla mawtik.",
  },
  {
    pattern: /الظُّلْمُ ظُلُمَاتٌ يَوْمَ الْقِيَامَةِ/i,
    latin: "Azh-zhulmu zhulumaatun yawmal qiyaamah (HR. Al-Bukhari & Muslim).",
  },
  {
    pattern: /إِنَّمَا يَعْمُرُ مَسَاجِدَ اللَّهِ/i,
    latin:
      "Innamaa ya'muru masaajidallaahi man aamana billaahi wal yawmil aakhiri wa aqaamash-shalaata wa aatadz-dzakaata wa lam yakhsya illallaah, fa 'asaa ulaa-ika ay-yakuunuu minal muhtadiin (QS. At-Taubah: 18).",
  },
  {
    pattern: /مَطْلُ الْغَنِيِّ ظُلْمٌ/i,
    latin: "Mathlul ghaniyyi zhulmun (HR. Bukhari).",
  },
  {
    pattern: /رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا/i,
    latin:
      "Rabbanaa hab lanaa min azwaajinaa wa dzurriyyaatinaa qurrata a'yunin waj'alnaa lil muttaqiina imaamaa.",
  },
];

/**
 * Transliterasi algoritmis huruf & harakat Arab ke bacaan Latin Indonesia
 */
function algorithmicTransliteration(ar: string): string {
  let s = ar;

  // Nama Keagungan Allah
  s = s.replace(/اللَّهَ|اللَّهَ/g, "Allaaha ");
  s = s.replace(/اللَّهِ|اللَّهِ/g, "Allaahi ");
  s = s.replace(/اللَّهُ|اللَّهُ/g, "Allaahu ");
  s = s.replace(/اللَّه|اللَّه/g, "Allaah ");

  const charMap: Record<string, string> = {
    "ء": "'",
    "آ": "aa",
    "أ": "a",
    "ؤ": "u",
    "إ": "i",
    "ئ": "i",
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
    // Harakat
    "َ": "a",
    "ُ": "u",
    "ِ": "i",
    "ً": "an",
    "ٌ": "un",
    "ٍ": "in",
    "ّ": "", // Ditangani di loop syaddah
    "ْ": "", // Sukun
    "ـ": "",
    "،": ", ",
    "؛": "; ",
    "؟": "? ",
  };

  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const nextCh = s[i + 1];

    if (nextCh === "ّ") {
      const base = charMap[ch] || ch;
      out += base + base;
      i++;
      continue;
    }

    if (charMap[ch] !== undefined) {
      out += charMap[ch];
    } else {
      out += ch;
    }
  }

  return out.replace(/\s+/g, " ").replace(/\s+([.,;:?!])/g, "$1").trim();
}

/**
 * Mendapatkan bacaan Latin untuk teks berbahasa Arab
 */
export function getArabicTransliteration(arabicText: string): string | null {
  if (!arabicText || !isArabicParagraph(arabicText)) {
    return null;
  }

  // 1. Periksa kamus frasa standar khutbah
  for (const entry of DICTIONARY) {
    if (entry.pattern.test(arabicText)) {
      return entry.latin;
    }
  }

  // 2. Transliterasi algoritmis
  const generated = algorithmicTransliteration(arabicText);
  if (generated && generated.length > 3) {
    return generated;
  }

  return null;
}
