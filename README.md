# Lumia Store - Game Top-up Platform

Platform top-up game online yang modern dan user-friendly untuk berbagai game populer seperti Mobile Legends, Free Fire, Genshin Impact, dan lainnya.

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Dokumentasi API](#dokumentasi-api)
- [Pengembangan](#pengembangan)
- [Arsitektur](#arsitektur)

## ✨ Fitur

- 🎮 **Dukungan Banyak Game** - Top-up untuk berbagai game populer (Mobile Legends, PUBG, dll)
- 🔐 **Autentikasi Pengguna** - Sistem registrasi, login, dan verifikasi OTP aman
- 💳 **Metode Pembayaran Beragam** - E-Wallet, QRIS, Transfer Bank, Retail, Pulsa
- 📦 **Pengiriman Instan** - Top-up dikirim langsung ke akun game secara real-time
- 🔍 **Pencarian Akun Game** - Verifikasi User ID dan Zone ID otomatis
- 🛡️ **Keamanan** - Proteksi CAPTCHA (reCAPTCHA v2), hashing password, siap SSL
- 📱 **Desain Responsif** - Tampilan optimal di Mobile, Tablet, dan Desktop
- 🎨 **UI/UX Modern** - Desain Glassmorphism dengan Tailwind CSS

## 🛠 Tech Stack

### Frontend
- **HTML5 + Tailwind + Vanilla JS** untuk halaman utama (Landing Page, Katalog, Top-up) - *Berada di direktori `legacy_static_site`*
- **React + Vite** untuk halaman autentikasi (Login, Register, Lupa Password) - *Berada di direktori `frontend`*
- **AOS** - Animate On Scroll untuk animasi UI

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Framework web
- **Repository Pattern** - Arsitektur bersih untuk akses data
- **JSON File Storage** - Database berbasis file sederhana (mudah dimigrasi ke DB sungguhan)

### Keamanan & Utilitas
- **CORS** - Cross-origin resource sharing
- **dotenv** - Manajemen variabel lingkungan
- **node-fetch** - HTTP client untuk API eksternal

## 📁 Struktur Proyek

```
lumina-store/
├── legacy_static_site/   # Situs Statis Utama (Halaman Landing, Katalog Game)
│   ├── assets/
│   │   ├── css/          # Stylesheets (styles.css, payment.css)
│   │   └── js/           # JavaScript (main.js, payment.js)
│   └── index.html        # Halaman Utama
├── frontend/             # Aplikasi React (Halaman Autentikasi)
│   ├── src/              # Source code React (Login, Register, Forgot Password)
│   └── dist/             # Build output yang disajikan oleh server
├── server/               # Backend API & Server
│   ├── app.js            # Konfigurasi aplikasi Express
│   ├── index.js          # Entry point server
│   ├── controllers/      # Logika penanganan request
│   ├── services/         # Logika bisnis
│   ├── models/           # Wrapper data
│   ├── repositories/     # Akses data (JSON/DB)
│   ├── middleware/       # Middleware Express
│   ├── routes/           # Rute API
│   └── data/             # Penyimpanan data JSON
├── index.html            # Redirect ke legacy_static_site/index.html (saat dev)
└── package.json          # Dependensi proyek
```

## 🚀 Instalasi

### Prasyarat
- Node.js (v14 atau lebih baru)
- npm atau yarn

### Langkah-langkah

1. **Clone repositori**
   ```bash
   git clone <repository-url>
   cd lumina-store
   ```

2. **Instal dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi variabel lingkungan**
   ```bash
   # Salin .env.example ke .env (jika ada)
   # Atau buat file .env dengan variabel yang diperlukan
   ```

4. **Jalankan server**
   ```bash
   npm start
   # Server akan berjalan di http://localhost:3000 (atau PORT dari env)
   ```

5. **Buka di browser**
   ```
   http://localhost:3000
   ```

## ⚙️ Konfigurasi

### Variabel Lingkungan

Buat file `.env` di direktori root:

```env
# Konfigurasi Server
PORT=3000

# API MLBB (Opsional - untuk pencarian game)
MLBB_API_URL=https://api.example.com/mlbb/lookup
MLBB_API_KEY=your-api-key
MLBB_API_KEY_HEADER=x-api-key

# Integrasi APIGames (Opsional)
APIGAMES_API_URL=https://api.apigames.com
APIGAMES_API_KEY=your-apigames-key

# Layanan Email (Opsional - untuk OTP)
EMAIL_SERVICE_API_KEY=your-email-service-key
```

### Penyimpanan Data

Secara default, aplikasi menggunakan file JSON untuk penyimpanan data:
- `server/data/users.json` - Akun pengguna
- `server/data/orders.json` - Riwayat pesanan
- `server/data/otps.json` - Kode OTP

**Catatan:** Untuk produksi, pertimbangkan migrasi ke database yang tepat (MongoDB, PostgreSQL, dll). Pola repositori membuat migrasi ini mudah. Lihat `server/repositories/README.md` untuk detailnya.

## 📚 Dokumentasi API

Base URL: `http://localhost:3000/api` (atau sesuai `PORT` pada env)

### Autentikasi

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "recaptcha": "recaptcha-token"
}
```
Catatan: Alternatif dev/fallback gunakan `"captcha": "jawaban-captcha"`.

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "recaptcha": "recaptcha-token"
}
```
Catatan: Alternatif dev/fallback gunakan `"captcha": "jawaban-captcha"`.

#### Request OTP
```http
POST /api/auth/request-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "purpose": "verify" | "reset",
  "recaptcha": "recaptcha-token"
}
```
Catatan: Alternatif dev/fallback gunakan `"captcha": "jawaban-captcha"`.

#### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456",
  "recaptcha": "recaptcha-token"
}
```
Catatan: Alternatif dev/fallback gunakan `"captcha": "jawaban-captcha"`.

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newpassword123",
  "recaptcha": "recaptcha-token"
}
```
Catatan: Alternatif dev/fallback gunakan `"captcha": "jawaban-captcha"`.

### Pencarian Akun Game

#### Cek Akun MLBB
```http
GET /api/mlbb/lookup?userId=123456&zoneId=1234
```

#### Info Akun APIGames
```http
GET /api/apigames/account
```

#### Cek Username (APIGames)
```http
GET /api/apigames/check-username?gameCode=mlbb&userId=123456&zoneId=1234
```

### Pesanan

#### Buat Pesanan
```http
POST /api/orders
Content-Type: application/json

{
  "userId": "123456",
  "zoneId": "1234",
  "sku": "diamond_86",
  "amount": 86,
  "price": 23000,
  "paymentMethod": "dana",
  "recaptcha": "recaptcha-token"
}
```

#### Ambil Pesanan
```http
GET /api/orders/:id
```

### Pembayaran

#### Halaman Pembayaran Mock
```http
GET /api/mock/pay?orderId=ord_xxxxx
```

#### Webhook Pembayaran
```http
POST /api/webhook/payment
Content-Type: application/json

{
  "orderId": "ord_xxxxx",
  "status": "paid"
}
```

### Captcha

#### Dapatkan Captcha Baru
```http
GET /api/captcha/new
```

#### Dapatkan Site Key Captcha
```http
GET /api/captcha/sitekey
```

## 🔗 Jalur Website (Auth SPA)

Halaman autentikasi disajikan sebagai aplikasi React SPA (Single Page Application):
- `/login`, `/register`, `/forgot`

Sementara halaman lain tetap berbasis HTML/JS Statis di dalam folder `legacy_static_site` (atau `pages/` saat diakses melalu URL).

## 🏗 Arsitektur

### Pola Repository

Aplikasi menggunakan Pola Repository untuk abstraksi akses data:
- Repository dasar (Base) sebagai antarmuka umum
- Repository JSON File sebagai implementasi penyimpanan berkas
- Repository konkret: User, Order, OTP

Lihat `server/repositories/README.md` untuk detail.

### Arsitektur Berlapis

```
Controller (Endpoint API)
    ↓
Service (Logika Bisnis)
    ↓
Model (Wrapper Data)
    ↓
Repository (Akses Data)
    ↓
Penyimpanan Data (File JSON / Database)
```

### Keuntungan

- ✅ Pemisahan Tanggung Jawab (Separation of Concerns)
- ✅ Mudah Diuji (Testability)
- ✅ Mudah Dipelihara (Maintainability)
- ✅ Migrasi mudah ke database
- ✅ Struktur kode bersih

## 🧪 Pengembangan

### Menjalankan Mode Pengembangan

```bash
npm start
```

### Panduan Struktur Proyek

- **Controller** - Menangani request/response HTTP
- **Service** - Berisi logika bisnis
- **Model** - Antarmuka akses data
- **Repository** - Implementasi akses data
- **Middleware** - Concern lintas-lapisan (auth, validasi, dll.)

### Menambahkan Fitur Baru

1. Buat repository (jika entitas baru)
2. Buat model wrapper
3. Buat service dengan logika bisnis
4. Buat controller untuk endpoint API
5. Tambahkan rute di `server/routes/index.js`

## 📝 Catatan

- Password di-hash menggunakan Node.js `crypto.scryptSync`
- Kode OTP kedaluwarsa setelah 10 menit
- Pesanan disimpan dengan pelacakan status
- CAPTCHA pada endpoint sensitif
- CORS aktif untuk permintaan lintas-origin

## 🔐 Pertimbangan Keamanan

- Password di-hash dengan salt
- OTP memiliki masa berlaku
- CAPTCHA pada endpoint autentikasi
- Validasi input pada semua endpoint
- Siap SSL/TLS untuk produksi

## 📄 Lisensi

ISC

## 👥 Kontribusi

Kontribusi sangat dipersilakan! Silakan buat Pull Request.

## 📞 Bantuan

Untuk bantuan, lihat [halaman FAQ](./pages/faq.html) atau hubungi tim pengembangan.

---

**Dibangun dengan ❤️ menggunakan Node.js dan Express**
