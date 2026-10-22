# Portal Resmi Masjid Hj. Sudalmiyah Rais
## Universitas Muhammadiyah Surakarta (UMS)

Repositori resmi sistem informasi dan portal dakwah Masjid Hj. Sudalmiyah Rais UMS. Aplikasi ini mencakup layanan publik jamaah, jadwal shalat, petugas imam & khatib shalat Jumat untuk 6 masjid kampus UMS, presensi live e-ticket anti-joki (QR dinamis 10 detik), pusat unduhan pustaka dokumen digital, warta dakwah, serta dashboard pengelolaan konten takmir berbasis web.

---

## 1. Arsitektur & Teknologi

- **Framework**: Next.js 16 (App Router dengan mode *Standalone Output*)
- **Bahasa & Tipe**: TypeScript 5
- **Styling & UI**: Tailwind CSS, Lucide Icons
- **Database & Sync**: Cloud Firestore (Google Firebase) dengan fallback JSON local data
- **Containerization**: Docker (Multi-stage build berbasis `node:20-alpine`)
- **CI/CD**: Siap pakai untuk GitLab UMS (`.gitlab-ci.yml`) dan GitHub Actions

---

## 2. Cara Menjalankan dengan Docker (Rekomendasi Server UMS)

Aplikasi telah dikonfigurasi dengan mode **Next.js Standalone**, sehingga container Docker sangat ringan (ukuran memori RAM hanya sekitar 100MB - 150MB).

### Langkah Menjalankan:
```bash
# 1. Salin berkas variabel lingkungan
cp .env.example .env

# 2. Bangun dan jalankan container di latar belakang
docker compose up -d --build

# 3. Periksa status container
docker compose ps

# 4. Lihat log container
docker compose logs -f
```

Aplikasi akan berjalan pada port **3000** (`http://localhost:3000` atau `http://IP_SERVER:3000`).

---

## 3. Cara Menjalankan secara Lokal / Bare-Metal (Node.js)

### Kebutuhan Sistem:
- Node.js versi 20.x atau 22.x LTS
- npm 10.x atau pnpm

### Langkah:
```bash
# 1. Pasang dependensi
npm install

# 2. Salin variabel lingkungan
cp .env.example .env.local

# 3. Mode pengembangan (development)
npm run dev

# 4. Mode produksi (build & start)
npm run build
npm run start
```

---

## 4. Variabel Lingkungan (.env)

Konfigurasi lingkungan dapat dilihat pada berkas [`.env.example`](.env.example):
- `GEMINI_API_KEY`: Kunci API Google AI Studio untuk modul konsultasi tanya-jawab fatwa tarjih.
- `JWT_SECRET`: Kunci enkripsi sesi otentikasi login admin takmir.
- `NEXT_PUBLIC_FIREBASE_*`: Kredensial Firebase Cloud Firestore untuk sinkronisasi data real-time lintas perangkat.

---

## 5. Panduan Migrasi Server & GitLab UMS

Petunjuk teknis lengkap mengenai migrasi repositori ke `gitlab.ums.ac.id`, konfigurasi reverse proxy Nginx/Apache, SSL Let's Encrypt, dan manajemen layanan Docker telah didokumentasikan di berkas:
- [`PANDUAN_DOCKER_DAN_GITLAB_UMS.md`](PANDUAN_DOCKER_DAN_GITLAB_UMS.md)

---

## 6. Struktur Direktori Utama

```
├── public/                 # Berkas statis (gambar logo, banner, ikon)
├── src/
│   ├── app/                # Halaman App Router (Beranda, Admin, Agenda, Layanan)
│   │   ├── admin/          # Dashboard manajemen takmir
│   │   ├── agenda/         # E-Ticket dan layar presensi proyektor dinamis
│   │   └── api/            # REST API endpoints (agendas, friday, feedback, docs)
│   ├── components/         # Komponen UI modular
│   └── lib/                # Definisi tipe TypeScript, utilitas, dan helper
├── Dockerfile              # Konfigurasi container produksi multi-stage
├── docker-compose.yml      # Orkestrasi Docker produksi
├── .gitlab-ci.yml          # Pipeline CI/CD untuk GitLab UMS
└── PANDUAN_DOCKER_DAN_GITLAB_UMS.md # Panduan deployment server UMS
```

---

Dikelola oleh Tim Takmir Masjid Hj. Sudalmiyah Rais bersama Biro Teknologi Informasi (BTI / DSTI) Universitas Muhammadiyah Surakarta.
