# Aplikasi Manajemen Data Warga

Aplikasi web modern untuk mengelola dan mendata informasi warga secara lengkap. Dibangun di atas platform Cloudflare Pages dan D1, serta dilengkapi dengan fitur AI untuk menghasilkan data contoh menggunakan Gemini API.

## Fitur Utama

-   **CRUD Lengkap**: Tambah, lihat, edit, dan hapus data warga.
-   **Penyimpanan Permanen**: Data disimpan secara aman dan persisten di database Cloudflare D1.
-   **Backend Serverless**: Logika backend ditangani oleh Cloudflare Functions yang aman dan skalabel.
-   **AI Data Generator**: Hasilkan data warga contoh secara acak dengan satu klik, didukung oleh Google Gemini.
-   **Pencarian & Filter**: Cari data berdasarkan nama, NIK, alamat, serta filter berdasarkan jenis kelamin dan status perkawinan.
-   **Paginasi**: Navigasi data yang banyak dengan mudah menggunakan sistem halaman.
-   **UI Responsif**: Tampilan yang optimal di berbagai perangkat, dari desktop hingga mobile.

## Tumpukan Teknologi

-   **Frontend**: React.js, Tailwind CSS
-   **Backend**: Cloudflare Pages Functions
-   **Database**: Cloudflare D1
-   **AI**: Google Gemini API

---

## Panduan Instalasi dan Deployment

Ikuti langkah-langkah di bawah ini untuk menyiapkan, menjalankan, dan mendeploy aplikasi ini.

### 1. Prasyarat

Sebelum memulai, pastikan Anda memiliki:
-   Akun [Cloudflare](https://dash.cloudflare.com/sign-up).
-   [Node.js](https://nodejs.org/) (versi 18.x atau lebih tinggi).
-   [npm](https://www.npmjs.com/) (terinstal bersama Node.js).
-   **Wrangler CLI**: Buka terminal dan jalankan perintah berikut untuk menginstal command-line tool dari Cloudflare.
    ```bash
    npm install -g wrangler
    ```
-   **Google Gemini API Key**: Dapatkan API Key Anda dari [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Penyiapan Proyek

1.  **Login ke Wrangler**: Hubungkan Wrangler CLI dengan akun Cloudflare Anda.
    ```bash
    wrangler login
    ```

2.  **Buat Database D1**: Buat database D1 baru dari terminal. Ganti `nama-database-warga` dengan nama yang Anda inginkan.
    ```bash
    wrangler d1 create nama-database-warga
    ```
    Catat `database_name` dan `database_id` yang muncul di output.

3.  **Inisialisasi Skema Database**: Gunakan file `schema.sql` yang ada di proyek ini untuk membuat tabel `citizens`.
    ```bash
    wrangler d1 execute nama-database-warga --file=./schema.sql
    ```

### 3. Konfigurasi Environment

Aplikasi ini membutuhkan API Key untuk fitur AI. Kunci ini harus disimpan sebagai environment variable yang aman.

#### Untuk Pengembangan Lokal:
1.  Buat file bernama `.dev.vars` di root direktori proyek.
2.  Tambahkan API Key Gemini Anda ke dalam file tersebut:
    ```ini
    API_KEY="MASUKKAN_GEMINI_API_KEY_ANDA_DI_SINI"
    ```
    *File `.dev.vars` bersifat rahasia dan tidak boleh di-commit ke Git.*

### 4. Menjalankan Secara Lokal

1.  **Jalankan Server Pengembangan**: Gunakan Wrangler untuk menjalankan aplikasi secara lokal. Perintah ini akan melayani frontend, menjalankan backend function, dan menghubungkannya dengan database D1 yang sudah Anda buat.
    ```bash
    # Ganti 'nama-database-warga' dengan nama database D1 Anda
    npx wrangler pages dev . --d1=DB=nama-database-warga
    ```
    -   `pages dev .`: Menjalankan server dev untuk direktori saat ini.
    -   `--d1=DB=nama-database-warga`: Membuat *binding* atau tautan. Ini memberitahu function bahwa variabel `env.DB` harus menunjuk ke database D1 `nama-database-warga`.

2.  **Buka Aplikasi**: Buka browser dan akses `http://localhost:8788` atau alamat lain yang ditampilkan di terminal.

### 5. Deployment ke Cloudflare Pages

1.  **Buat Proyek di Cloudflare Pages**:
    -   Login ke dashboard Cloudflare.
    -   Navigasi ke **Workers & Pages** > **Create application** > **Pages**.
    -   Pilih **Upload assets**.

2.  **Upload Proyek**:
    -   Beri nama proyek Anda (contoh: `manajemen-warga`).
    -   Seret (drag and drop) seluruh folder proyek Anda ke area upload.
    -   Klik **Deploy site**.

3.  **Konfigurasi Binding Database & Environment Variable**:
    -   Setelah deployment pertama selesai, masuk ke pengaturan proyek Pages Anda.
    -   Pilih tab **Settings** > **Functions**.
    -   **D1 database bindings**:
        -   Klik **Add binding**.
        -   Variable name: `DB`
        -   D1 database: Pilih database D1 yang Anda buat sebelumnya (`nama-database-warga`).
    -   **Environment variables (production)**:
        -   Klik **Add variable**.
        -   Variable name: `API_KEY`
        -   Value: Masukkan Gemini API Key Anda.
        -   **PENTING**: Klik **Encrypt** untuk menyimpan kunci ini secara aman.
    -   Klik **Save**. Perubahan ini akan memicu redeployment otomatis dengan konfigurasi baru.

Setelah deployment selesai, aplikasi Anda akan live di URL proyek Pages Anda (contoh: `manajemen-warga.pages.dev`) dan terhubung sepenuhnya dengan database D1 dan Gemini API.
