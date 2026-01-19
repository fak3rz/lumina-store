# Lumia Store Server

Server backend untuk platform top up game Lumia Store.

## 🚀 Mulai Cepat

1. **Instal dependensi**
   ```bash
   npm install
   ```

2. **Konfigurasi variabel lingkungan**
   
   Buat file `.env`:
   ```env
   PORT=3000
   MLBB_API_URL=https://api.example.com/mlbb/lookup
   MLBB_API_KEY=your-api-key
   MLBB_API_KEY_HEADER=x-api-key
   APIGAMES_API_URL=https://api.apigames.com
   APIGAMES_API_KEY=your-apigames-key
   CAPTCHA_ENABLED=false
   CAPTCHA_BYPASS=false
   RECAPTCHA_SITE_KEY=your-site-key
   RECAPTCHA_SECRET=your-secret
   ```

3. **Jalankan server**
   ```bash
   npm start
   # atau
   node server/index.js
   ```

## 📁 Struktur Direktori

```
server/
├── app.js              # Konfigurasi aplikasi Express
├── index.js            # Titik masuk server
├── config/             # Berkas konfigurasi
│   └── index.js        # Loader konfigurasi
├── controllers/        # Handler request
│   ├── authController.js
│   ├── orderController.js
│   ├── paymentController.js
│   ├── gameController.js
│   ├── apiGamesController.js
│   └── captchaController.js
├── services/           # Lapisan logika bisnis
│   ├── authService.js
│   ├── orderService.js
│   ├── emailService.js
│   ├── mlbbService.js
│   └── apiGamesService.js
├── models/             # Model data (wrapper)
│   ├── userModel.js
│   ├── orderModel.js
│   └── otpModel.js
├── repositories/       # Lapisan akses data (Repository Pattern)
│   ├── base/
│   │   ├── BaseRepository.js
│   │   └── JsonFileRepository.js
│   ├── UserRepository.js
│   ├── OrderRepository.js
│   ├── OtpRepository.js
│   └── README.md       # Dokumentasi pola repository
├── middleware/         # Middleware Express
│   └── captcha.js
├── routes/             # Definisi rute API
│   └── index.js
└── data/               # Penyimpanan data JSON
    ├── users.json
    ├── orders.json
    └── otps.json
```

## 🔌 Endpoint API

### Endpoint Autentikasi

- `POST /api/auth/register` - Daftarkan pengguna baru
- `POST /api/auth/login` - Masuk pengguna
- `POST /api/auth/request-otp` - Minta OTP untuk verifikasi/reset
- `POST /api/auth/verify-otp` - Verifikasi kode OTP
- `POST /api/auth/reset-password` - Reset kata sandi dengan OTP

**Catatan:** Semua endpoint autentikasi memerlukan CAPTCHA pada body:
- Gunakan `recaptcha` untuk token Google reCAPTCHA
- Atau `captcha` untuk jawaban CAPTCHA matematika (fallback/dev)

### Endpoint Game

- `GET /api/mlbb/lookup?userId=xxx&zoneId=xxx` - Cek akun MLBB
- `GET /api/apigames/account` - Ambil info akun APIGames
- `GET /api/apigames/check-username?gameCode=xxx&userId=xxx&zoneId=xxx` - Validasi username

### Endpoint Pesanan

- `POST /api/orders` - Buat pesanan baru (memerlukan captcha)
- `GET /api/orders/:id` - Ambil pesanan berdasarkan ID

### Endpoint Pembayaran

- `GET /api/mock/pay?orderId=xxx` - Halaman pembayaran mock
- `POST /api/webhook/payment` - Handler webhook pembayaran

### Endpoint Captcha

- `GET /api/captcha/new` - Generate captcha baru
- `GET /api/captcha/sitekey` - Ambil site key captcha

## 🏗 Arsitektur

### Pola Repository

Server menggunakan Pola Repository untuk akses data:

- **Base Repository** - Antarmuka abstrak
- **JSON File Repository** - Implementasi penyimpanan berbasis berkas
- **Concrete Repositories** - Logika spesifik untuk User, Order, OTP

Model bertindak sebagai wrapper di atas repository untuk menjaga kompatibilitas.

Lihat `repositories/README.md` untuk dokumentasi rinci.

### Alur Permintaan

```
HTTP Request
    ↓
Routes (server/routes/index.js)
    ↓
Middleware (Captcha, Auth, dll.)
    ↓
Controller (server/controllers/)
    ↓
Service (server/services/)
    ↓
Model (server/models/)
    ↓
Repository (server/repositories/)
    ↓
Penyimpanan Data (Berkas JSON / Database)
```

## 📝 Variabel Lingkungan

| Variabel | Deskripsi | Wajib | Default |
|----------|-----------|-------|---------|
| `PORT` | Port server | Tidak | `3000` |
| `MLBB_API_URL` | URL API lookup MLBB | Tidak | - |
| `MLBB_API_KEY` | API key MLBB | Tidak | - |
| `MLBB_API_KEY_HEADER` | Nama header untuk API key | Tidak | `x-api-key` |
| `APIGAMES_API_URL` | URL API APIGames | Tidak | - |
| `APIGAMES_API_KEY` | API key APIGames | Tidak | - |
| `CAPTCHA_ENABLED` | Aktifkan proteksi CAPTCHA | Tidak | `false` |
| `CAPTCHA_BYPASS` | Lewati CAPTCHA (dev) | Tidak | `false` |
| `RECAPTCHA_SITE_KEY` | Site key reCAPTCHA | Tidak | - |
| `RECAPTCHA_SECRET` | Secret reCAPTCHA | Tidak | - |

## 🔒 Fitur Keamanan

- **Hashing Password** - Menggunakan Node.js `crypto.scryptSync` dengan salt
- **Kedaluwarsa OTP** - Kode OTP kedaluwarsa setelah 10 menit
- **Proteksi CAPTCHA** - Wajib pada endpoint sensitif
- **Validasi Input** - Semua input divalidasi
- **CORS** - Berbagi sumber lintas origin diaktifkan

## 📦 Penyimpanan Data

### Implementasi Saat Ini: Berkas JSON

- `data/users.json` - Akun pengguna
- `data/orders.json` - Catatan pesanan
- `data/otps.json` - Penyimpanan sementara OTP

### Migrasi ke Database

Pola repository memudahkan migrasi dari berkas JSON ke database (MongoDB, PostgreSQL, dll.):

1. Buat repository database yang meng-extend `BaseRepository`
2. Implementasikan metode spesifik database
3. Perbarui model untuk menggunakan repository database
4. Tidak perlu mengubah service atau controller!

Lihat `repositories/README.md` untuk panduan migrasi.

## 🧪 Pengembangan

### Menambahkan Endpoint Baru

1. Buat controller di `controllers/`
2. Buat service di `services/` (jika diperlukan)
3. Tambah rute di `routes/index.js`
4. Terapkan middleware sesuai kebutuhan (captcha, auth, dll.)

### Menambahkan Jenis Entitas Baru

1. Buat repository di `repositories/`
2. Buat wrapper model di `models/`
3. Gunakan pada service sesuai kebutuhan

### Pengujian

Saat ini proyek menggunakan pengujian manual. Pertimbangkan untuk menambahkan:
- Unit test (Jest/Mocha)
- Integration test
- API test (Supertest)

### Frontend (Halaman Autentikasi)

Halaman autentikasi disajikan sebagai website dengan React di jalur:
- `/login`, `/register`, `/forgot`

Build frontend disimpan di `frontend/dist` dan dilayani oleh Express. Aset di `/assets`, fallback routing mengarah ke `index.html` pada jalur di atas.

## 📚 Dokumentasi Tambahan

- [Dokumentasi Pola Repository](./repositories/README.md)
- [README Proyek Utama](../README.md)

## ⚠️ Catatan

- Proxy lookup MLBB menghindari masalah CORS dan menjaga API key tetap aman
- Jika `MLBB_API_URL` tidak diatur, proxy mengembalikan 501 dan frontend menggunakan mock
- Semua operasi async menggunakan pola async/await
- Operasi berkas dibungkus dalam async untuk konsistensi

## 🔄 Peningkatan Mendatang

- [ ] Tambahkan dukungan database (MongoDB/PostgreSQL)
- [ ] Tambahkan cakupan pengujian komprehensif
- [ ] Tambahkan pembatasan laju (rate limiting) API
- [ ] Tambahkan logging/monitoring request
- [ ] Tambahkan autentikasi JWT
- [ ] Tambahkan API dashboard admin
- [ ] Tambahkan notifikasi email
- [ ] Tambahkan integrasi payment gateway (Midtrans, Xendit, dll.)

---

**Untuk informasi lebih lanjut, lihat [README.md](../README.md) utama**
