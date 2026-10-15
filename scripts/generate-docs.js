const fs = require('fs');
const path = require('path');

function createSimplePdf(title, subtitle, author, description, points) {
  const contentLines = [
    `BT /F1 18 Tf 50 720 Td (${title}) Tj ET`,
    `BT /F2 12 Tf 50 690 Td (${subtitle}) Tj ET`,
    `BT /F2 10 Tf 50 670 Td (Penerbit / Sumber: ${author}) Tj ET`,
    `BT /F2 10 Tf 50 650 Td (Masjid Hj. Sudalmiyah Rais - Universitas Muhammadiyah Surakarta) Tj ET`,
    `0.5 0.5 0.5 RG 50 635 m 550 635 l S`,
    `BT /F2 11 Tf 50 610 Td (Ringkasan Dokumen:) Tj ET`,
  ];

  let currentY = 590;
  // Wrap description if long
  const descWords = description.split(' ');
  let line = '';
  for (const w of descWords) {
    if ((line + ' ' + w).length > 70) {
      contentLines.push(`BT /F2 10 Tf 50 ${currentY} Td (${line.trim()}) Tj ET`);
      currentY -= 16;
      line = w + ' ';
    } else {
      line += w + ' ';
    }
  }
  if (line.trim()) {
    contentLines.push(`BT /F2 10 Tf 50 ${currentY} Td (${line.trim()}) Tj ET`);
    currentY -= 25;
  }

  contentLines.push(`BT /F1 11 Tf 50 ${currentY} Td (Pokok-Pokok Isi Dokumen:) Tj ET`);
  currentY -= 20;

  for (let i = 0; i < points.length; i++) {
    const pt = `${i + 1}. ${points[i]}`;
    contentLines.push(`BT /F2 10 Tf 60 ${currentY} Td (${pt}) Tj ET`);
    currentY -= 18;
  }

  currentY -= 25;
  contentLines.push(`0.8 0.8 0.8 RG 50 ${currentY + 15} m 550 ${currentY + 15} l S`);
  contentLines.push(`BT /F2 9 Tf 50 ${currentY} Td (Dokumen digital ini disediakan resmi oleh Takmir Masjid Kampus UMS untuk pembinaan sivitas akademika.) Tj ET`);

  const streamContent = contentLines.join('\n');
  const streamLength = Buffer.byteLength(streamContent);

  const objects = [];
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`);
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`);
  objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj`);
  objects.push(`4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`);
  objects.push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`);
  objects.push(`6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`);

  let body = `%PDF-1.4\n`;
  const offsets = [];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(body));
    body += obj + '\n';
  }

  const xrefOffset = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    body += String(offset).padStart(10, '0') + ' 00000 n \n';
  }
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(body, 'utf-8');
}

const docsDir = path.join(process.cwd(), 'public', 'documents');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const sampleDocs = [
  {
    fileName: 'hpt-muhammadiyah.pdf',
    title: 'Himpunan Putusan Tarjih (HPT)',
    subtitle: 'Putusan Resmi Majelis Tarjih dan Tajdid PP Muhammadiyah',
    author: 'Majelis Tarjih dan Tajdid Pimpinan Pusat Muhammadiyah',
    description: 'Himpunan putusan resmi fatwa hukum Islam dan tuntunan ibadah praktis berlandaskan Al-Quran dan Sunnah Shahihah.',
    points: [
      'Kitab Iman dan Pokok-Pokok Aqidah Ahlus Sunnah',
      'Kitab Thaharah dan Tuntunan Bersuci Sesuai Sunnah',
      'Kitab Shalat Fardhu, Shalat Sunnah, dan Shalat Berjamaah',
      'Kitab Zakat, Infaq, Shadaqah, dan Pengelolaan Wakaf',
      'Kitab Jenazah dan Tuntunan Perawatan Orang Sakit'
    ]
  },
  {
    fileName: 'phiwm-pedoman-hidup-islami.pdf',
    title: 'Pedoman Hidup Islami Warga Muhammadiyah (PHIWM)',
    subtitle: 'Keputusan Muktamar Muhammadiyah Ke-44 di Jakarta',
    author: 'Pimpinan Pusat Muhammadiyah',
    description: 'Pedoman moral dan panduan etika islami bagi warga Muhammadiyah dalam mewujudkan masyarakat Islam yang sebenar-benarnya.',
    points: [
      'Pedoman Kehidupan Pribadi (Akhlak, Aqidah, dan Ibadah)',
      'Pedoman Kehidupan dalam Keluarga Sakinah Mawaddah Warahmah',
      'Pedoman Kehidupan Bermasyarakat dan Bertetangga',
      'Pedoman Kehidupan Berorganisasi dan Amal Usaha Muhammadiyah (AUM)',
      'Pedoman Kehidupan Mengelola Lingkungan Hidup dan Kelestarian Alam'
    ]
  },
  {
    fileName: 'tanya-jawab-agama-tarjih.pdf',
    title: 'Tanya Jawab Agama Islam Majelis Tarjih',
    subtitle: 'Kompilasi Fatwa dan Konsultasi Fiqih Kontemporer',
    author: 'Majelis Tarjih dan Tajdid PP Muhammadiyah',
    description: 'Kumpulan jawaban resmi atas pertanyaan keagamaan umat seputar ibadah sehari-hari, muamalah maliyah, dan fatwa kontemporer.',
    points: [
      'Konsultasi Shalat Berjamaah dan Masail Khusus di Masjid',
      'Problematika Hisab Hakiki dan Penentuan Awal Bulan Hijriyah',
      'Fiqih Muamalah, Transaksi Digital, dan Infaq QRIS',
      'Hukum Kontemporer Kesehatan, Medis, dan Bioetika',
      'Etika Dakwah dan Kehidupan Sosial di Lingkungan Kampus'
    ]
  },
  {
    fileName: '12-langkah-kh-ahmad-dahlan.pdf',
    title: '12 Langkah K.H. Ahmad Dahlan',
    subtitle: 'Kearifan Kepemimpinan dan Doktrin Perjuangan Muhammadiyah',
    author: 'K.H. Ahmad Dahlan (Dirumuskan HB Muhammadiyah 1938-1940)',
    description: 'Dua belas intisari langkah perjuangan dan pedoman kepemimpinan yang dirumuskan untuk meneguhkan keikhlasan aktivis persyarikatan.',
    points: [
      'Memperdalam Masuknya Iman dan Memperluas Faham Agama',
      'Memperbuahkan Budi Pekerti dan Menuntun Amalan Intiqad',
      'Menguatkan Persatuan dan Menegakkan Keadilan',
      'Melakukan Musyawarah dan Menghidupkan Sifat Mengalah',
      'Menyambung Gerak Langkah dan Mempersiapkan Kader Dakwah'
    ]
  },
  {
    fileName: 'risalah-islam-berkemajuan.pdf',
    title: 'Risalah Islam Berkemajuan',
    subtitle: 'Keputusan Muktamar Ke-48 Muhammadiyah di Surakarta',
    author: 'Pimpinan Pusat Muhammadiyah',
    description: 'Manifesto pemikiran resmi gerakan Islam berkemajuan yang mencerahkan peradaban kemanusiaan dan kebangsaan Indonesia.',
    points: [
      'Karakter Islam Berkemajuan: Berlandaskan Tauhid dan Bersumber Al-Quran-Sunnah',
      'Menghidupkan Ijtihad dan Tajdid dalam Menjawab Tantangan Zaman',
      'Wasathiyah (Moderasi Islam) dan Memajukan Kemanusiaan',
      'Praksis Sosial Transformatif di Bidang Pendidikan dan Kesehatan',
      'Dakwah Pencerahan Abad Kedua Muhammadiyah'
    ]
  },
  {
    fileName: 'panduan-masjid-percontohan.pdf',
    title: 'Panduan Standar Masjid Percontohan Muhammadiyah',
    subtitle: 'Pedoman Standardisasi Masjid Ramah Aktivis dan Jamaah',
    author: 'LPCR-PM Pimpinan Pusat Muhammadiyah',
    description: 'Buku panduan tata kelola, manajemen takmir, dan fasilitas percontohan masjid ramah aktivis, ramah lingkungan, anak, dan difabel.',
    points: [
      'Standardisasi Arsitektur, Akustik, dan Kebersihan Masjid Ramah Lingkungan',
      'Tata Kelola Transparansi Kas dan Manajemen Infaq Digital',
      'Pengembangan Masjid Ramah Anak, Ramah Pemuda, dan Aktivis Kampus',
      'Aksesibilitas Fasilitas Khusus Jamaah Lansia dan Difabel',
      'Program Kajian Terstruktur dan Kemitraan Dakwah Komunitas'
    ]
  }
];

sampleDocs.forEach(doc => {
  const filePath = path.join(docsDir, doc.fileName);
  const pdfBuffer = createSimplePdf(doc.title, doc.subtitle, doc.author, doc.description, doc.points);
  fs.writeFileSync(filePath, pdfBuffer);
  console.log('Created PDF:', doc.fileName, Buffer.byteLength(pdfBuffer), 'bytes');
});

console.log('All 6 sample PDFs generated successfully!');
