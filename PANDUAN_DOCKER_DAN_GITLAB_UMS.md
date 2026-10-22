# Panduan Migrasi Server: Docker & GitLab UMS (gitlab.ums.ac.id)
Masjid Hj. Sudalmiyah Rais - Universitas Muhammadiyah Surakarta

Panduan ini memuat langkah lengkap untuk memindahkan aplikasi ke server internal UMS menggunakan Docker, serta mengunggah repositori ke `gitlab.ums.ac.id`.

---

## Bagian 1: Mengunggah Repositori ke gitlab.ums.ac.id

### 1.1. Buat Repositori Baru di GitLab UMS
1. Buka [https://gitlab.ums.ac.id](https://gitlab.ums.ac.id) melalui peramban.
2. Masuk (Login) menggunakan akun SSO / CAS UMS atau kredensial yang telah diberikan oleh pihak BTI (Biro Teknologi Informasi) UMS.
3. Klik tombol **New project** > **Create blank project**.
4. Isi data proyek:
   - **Project name**: `masjid-sudalmiyah` (atau sesuai arahan tim server).
   - **Project URL**: Pilih namespace / grup Anda atau organisasi masjid.
   - **Visibility Level**: `Internal` atau `Private` (sesuai kebijakan server UMS).
   - **Hapus centang** pada *Initialize repository with a README* (karena repositori lokal sudah memiliki berkas lengkap).
5. Klik **Create project**.

### 1.2. Hubungkan Repositori Lokal dan Push ke GitLab UMS
Buka Terminal / PowerShell di folder proyek ini, lalu jalankan perintah berikut:

```bash
# Tambahkan remote baru mengarah ke GitLab UMS (gunakan URL repositori Anda):
git remote add gitlab https://gitlab.ums.ac.id/NAMA_USER_ATAU_GRUP/NAMA_PROJECT.git

# Periksa apakah remote gitlab sudah terdaftar:
git remote -v

# Unggah seluruh cabang dan histori kode ke GitLab UMS:
git push -u gitlab main
```

> **Catatan Autentikasi**:
> Jika GitLab UMS meminta kredensial saat `git push`:
> - **Username**: Username akun UMS Anda.
> - **Password**: Password akun UMS Anda (atau *Personal Access Token* yang dibuat di menu *User Settings > Access Tokens* di GitLab).

---

## Bagian 2: Menjalankan Aplikasi di Server dengan Docker

Aplikasi ini telah dikonfigurasi menggunakan mode **Next.js Standalone**, yang meminimalkan ukuran image Docker dan menghemat penggunaan RAM server (hanya membutuhkan sekitar 100MB-150MB RAM).

### 2.1. Berkas Konfigurasi Docker yang Disediakan
- [`Dockerfile`](file:///c:/Users/andik/OneDrive/Documents/TEKNIK%20INFORMATIKA/Project/Masjid%20Sudalmiyah/Dockerfile): Multi-stage build (deps, builder, runner) yang aman dengan non-root user.
- [`docker-compose.yml`](file:///c:/Users/andik/OneDrive/Documents/TEKNIK%20INFORMATIKA/Project/Masjid%20Sudalmiyah/docker-compose.yml): Manajemen container satu perintah dengan auto-restart, healthcheck, dan limitasi log.
- [`.dockerignore`](file:///c:/Users/andik/OneDrive/Documents/TEKNIK%20INFORMATIKA/Project/Masjid%20Sudalmiyah/.dockerignore): Mengabaikan berkas cache, node_modules, dan berkas privat.
- [`.gitlab-ci.yml`](file:///c:/Users/andik/OneDrive/Documents/TEKNIK%20INFORMATIKA/Project/Masjid%20Sudalmiyah/.gitlab-ci.yml): Skrip pipeline CI/CD otomatis untuk GitLab UMS.

---

### 2.2. Langkah Eksekusi di Server UMS

Masuk ke server UMS melalui SSH:

```bash
ssh user@ip-server-ums
```

#### Langkah A: Kloning Repositori dari GitLab UMS
```bash
git clone https://gitlab.ums.ac.id/NAMA_USER_ATAU_GRUP/NAMA_PROJECT.git masjid-sudalmiyah
cd masjid-sudalmiyah
```

#### Langkah B: Siapkan Berkas Lingkungan (.env)
Salin contoh konfigurasi ke berkas `.env` asli:
```bash
cp .env.example .env
nano .env
```
Pastikan kunci-kunci berikut terisi sesuai konfigurasi produksi:
- `JWT_SECRET`: Kunci rahasia untuk sesi login admin.
- `GEMINI_API_KEY`: Kunci API Google AI Studio untuk Tanya Tarjih.
- `NEXT_PUBLIC_FIREBASE_*`: Kunci Cloud Firestore database masjid.

#### Langkah C: Bangun dan Jalankan Container Docker
Cukup jalankan satu perintah berikut:
```bash
docker compose up -d --build
```

#### Langkah D: Verifikasi Status Container
```bash
# Periksa status container berjalan:
docker compose ps

# Periksa log aktivitas aplikasi:
docker compose logs -f

# Uji respons aplikasi di port 3000:
curl http://localhost:3000/
```

Container akan otomatis berjalan di latar belakang (*detached*) dan otomatis menyala kembali jika server mengalami restart (*restart: unless-stopped*).

---

## Bagian 3: Konfigurasi Domain & Nginx Reverse Proxy (Opsional di Server UMS)

Jika aplikasi diarahkan ke domain resmi kampus (misalnya `masjid.ums.ac.id`), tambahkan konfigurasi Nginx pada server:

```nginx
server {
    listen 80;
    server_name masjid.ums.ac.id;

    client_max_body_size 30M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Setelah itu aktifkan SSL/HTTPS menggunakan Certbot:
```bash
sudo certbot --nginx -d masjid.ums.ac.id
```

---

## Bagian 4: Pembaruan Kode di Server di Masa Mendatang

Setiap kali ada pembaruan kode yang di-push ke GitLab UMS, pembaruan di server cukup dilakukan dengan:
```bash
cd masjid-sudalmiyah
git pull origin main
docker compose up -d --build
```
Proses ini akan memperbarui container tanpa ada downtime yang berarti.
