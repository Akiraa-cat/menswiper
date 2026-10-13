# Minesweeper

Game Minesweeper dengan papan harian, akun pemain, statistik lokal, dan leaderboard yang tersimpan di Google Sheets melalui Apps Script.

## Prasyarat

- Git
- Node.js 20.19 atau lebih baru
- Akun Google yang bisa mengedit spreadsheet dan membuat Apps Script Web App

## Clone dan jalankan di localhost

Buka PowerShell, lalu jalankan:

```powershell
git clone https://github.com/Akiraa-cat/menswiper.git
cd menswiper
npm install
Copy-Item .env.example .env
```

Sebelum menjalankan aplikasi, buka file `.env` dan isi `NUXT_APPS_SCRIPT_URL` dengan URL Web App Apps Script Anda. Simpan file, kemudian jalankan:

```powershell
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Untuk menghentikan server, tekan `Ctrl+C` di PowerShell.

## Siapkan Google Apps Script

1. Buka [script.google.com](https://script.google.com/) dan buat project Apps Script.
2. Salin seluruh isi file [`google-apps-script/Code.gs`](google-apps-script/Code.gs) ke editor Apps Script, lalu simpan.
3. Pastikan akun Google pemilik script memiliki akses edit ke spreadsheet yang digunakan.
4. Pilih **Deploy > New deployment > Web app**.
5. Atur **Execute as** menjadi **Me** dan **Who has access** menjadi **Anyone**, lalu deploy dan izinkan akses yang diminta Google.
6. Salin URL Web App yang berakhiran `/exec`.
7. Tempel URL tersebut di `.env`:

```dotenv
NUXT_APPS_SCRIPT_URL=https://script.google.com/macros/s/ID_DEPLOYMENT/exec
```

Aplikasi menggunakan spreadsheet dengan ID yang sudah diatur di `Code.gs` dan worksheet pertama. Baris pertama berisi header `index`, `username`, `password hash`, `score`, `win`, `lose`, `streak`, dan `daily win dates`; data akun dimulai dari baris kedua. Script menambahkan header statistik jika spreadsheet lama masih memakai empat kolom awal. Jangan mengubah urutan kolom tersebut. Match dihitung dari win + lose, sedangkan win rate dihitung dari win / match × 100%.

Jika Apps Script sudah pernah di-deploy, setelah mengganti kodenya buka **Deploy > Manage deployments > Edit**, pilih **New version**, lalu deploy lagi. URL biasanya tetap sama. Tanpa deployment versi terbaru atau akses **Anyone**, aplikasi bisa menerima HTTP 401/502.

Tidak perlu membuat Google Cloud service account atau mengisi shared secret. Konfigurasi lokal hanya memerlukan URL Apps Script. File `.env` tidak ikut Git; jangan mengganti `.env.example` dengan secret atau URL pribadi sebelum commit.

## Cara kerja akun dan skor

- Guest bisa langsung bermain. Setelah dua game selesai, aplikasi menawarkan login atau pembuatan akun; prompt bisa ditutup. Akun menyimpan password dalam bentuk salted PBKDF2-SHA256 hash. Token sesi disimpan melalui cookie HttpOnly dan berlaku hingga enam jam.
- Akun baru mulai dari 0 poin. Setiap kemenangan menambahkan skor game ke total pemain di spreadsheet; kekalahan tidak menambah poin.
- Win rate dan hasil game akun disimpan per akun di spreadsheet, sehingga tersedia lintas perangkat. Guest tetap menggunakan statistik lokal pada perangkat.

## Pemeriksaan proyek

```powershell
npm run typecheck
npm run build
```

## Vercel

Untuk deployment Vercel, tambahkan environment variable `NUXT_APPS_SCRIPT_URL` pada **Project Settings > Environment Variables**, isi dengan URL Web App Apps Script, lalu deploy ulang. `.env` lokal tidak ikut diunggah ke Vercel.
