# Panduan Deployment Lumina Store

Panduan ini akan membantu Anda mengunggah kode ke GitHub dan men-deploy aplikasi ke Vercel.

## 1. Persiapan GitHub

Pastikan Anda sudah memiliki akun GitHub dan Git terinstal di komputer.

1.  **Buat Repository Baru di GitHub**
    *   Buka [GitHub.com](https://github.com) dan login.
    *   Klik tombol **+** di pojok kanan atas -> **New repository**.
    *   Beri nama repository (misal: `lumina-store`).
    *   Pilih **Public** atau **Private**.
    *   **JANGAN** centang "Initialize this repository with a README/gitignore" (karena kita sudah punya di lokal).
    *   Klik **Create repository**.

2.  **Upload Kode dari VS Code / Terminal**
    Buka terminal di VS Code (Ctrl+`), lalu jalankan perintah berikut satu per satu:

    ```bash
    # 1. Inisialisasi git (jika belum pernah)
    git init

    # 2. Tambahkan semua file
    git add .

    # 3. Simpan perubahan (commit)
    git commit -m "Initial deployment setup: Refactored structure"

    # 4. Hubungkan ke repository GitHub yang baru dibuat
    # Ganti URL_REPOSITORY_ANDA dengan URL dari GitHub (contoh: https://github.com/username/lumina-store.git)
    git remote add origin URL_REPOSITORY_ANDA

    # 5. Upload (Push)
    git push -u origin master
    # (Jika error "master" tidak ada, coba "main": git push -u origin main)
    ```

## 2. Deployment ke Vercel

Pastikan Anda sudah punya akun di [Vercel.com](https://vercel.com) (bisa login pakai GitHub).

1.  **Import Project**
    *   Buka Dashboard Vercel -> **Add New...** -> **Project**.
    *   Pilih **Import Git Repository**.
    *   Cari repository `lumina-store` yang baru Anda upload, klik **Import**.

2.  **Konfigurasi Project**
    *   **Framework Preset**: Biarkan **Other**.
    *   **Root Directory**: Biarkan `./` (default).
    *   **Build Command**: Kosongkan (atau `npm run build:frontend` jika ingin build React).
        *   *Catatan: Saat ini konfigurasi kita menggunakan Express untuk melayani file statis, jadi build command opsional kecuali Anda ingin memutakhirkan file React.*
    *   **Environment Variables**:
        Copy isi dari file `.env` Anda ke sini. (Nama = Nilai).
        Contoh:
        *   `MLBB_API_KEY` = `abc123...`
        *   `CAPTCHA_ENABLED` = `false`
        (Jangan copy `.env` file langsung, tapi masukkan key-value nya satu per satu di dashboard Vercel).

3.  **Deploy**
    *   Klik **Deploy**.
    *   Tunggu proses selesai.

## 3. Catatan Penting

*   **Vercel Configuration (`vercel.json`)**:
    Saya sudah mengatur `vercel.json` agar **semua request** diarahkan ke server Express (`api/index.js`). Ini berarti Vercel akan bertindak seperti server biasa:
    *   Halaman login lama: `domain-anda.vercel.app/pages/login.html`
    *   API: `domain-anda.vercel.app/api/...`
    *   React App (jika di-build): `domain-anda.vercel.app/assets/...`

Selamat! Aplikasi Anda sekarang sudah online.
