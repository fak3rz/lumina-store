# Lumia Store - Game Top-up Platform

Platform top-up game online yang modern dan user-friendly untuk berbagai game populer seperti Mobile Legends, Free Fire, Genshin Impact, dan lainnya.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Architecture](#architecture)

## ✨ Features

- 🎮 **Multiple Games Support** - Top-up untuk berbagai game populer
- 🔐 **User Authentication** - Sistem registrasi, login, dan verifikasi OTP
- 💳 **Multiple Payment Methods** - E-Wallet, QRIS, Bank Transfer, Retail, Pulsa
- 📦 **Instant Delivery** - Top-up dikirim langsung ke akun game
- 🔍 **Game Account Lookup** - Verifikasi User ID dan Zone ID
- 🛡️ **Security** - CAPTCHA protection, password hashing, SSL ready
- 📱 **Responsive Design** - Mobile-friendly interface
- 🎨 **Modern UI/UX** - Glassmorphism design dengan Tailwind CSS

## 🛠 Tech Stack

### Frontend
- **HTML5 + Tailwind + Vanilla JS** untuk halaman utama
- **React + Vite** untuk halaman autentikasi (login/register/forgot) di jalur website
- **AOS** - Animate On Scroll

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Repository Pattern** - Clean architecture for data access
- **JSON File Storage** - Simple file-based database (easy to migrate to real DB)

### Security & Utilities
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables management
- **node-fetch** - HTTP client for external APIs

## 📁 Project Structure

```
lumina-store/
├── assets/
│   ├── css/              # Stylesheets
│   │   ├── styles.css    # Main styles
│   │   └── payment.css   # Payment page styles
│   └── js/               # JavaScript files
│       ├── main.js       # Main frontend logic
│       ├── auth.js       # Authentication logic
│       └── payment.js    # Payment logic
├── pages/                # HTML pages
│   ├── login.html
│   ├── register.html
│   ├── verify-otp.html
│   ├── forgot.html
│   ├── profile.html
│   ├── topup.html
│   ├── faq.html
│   └── ...
├── server/
│   ├── app.js            # Express app configuration
│   ├── index.js          # Server entry point
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── models/           # Data models (wrappers)
│   ├── repositories/     # Data access layer
│   │   ├── base/         # Base repository classes
│   │   └── README.md     # Repository pattern docs
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   └── data/             # JSON data files
│       ├── users.json
│       ├── orders.json
│       └── otps.json
├── index.html            # Home page
└── package.json          # Dependencies
```

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lumina-store
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy .env.example to .env (if exists)
   # Or create .env file with required variables
   ```

4. **Start the server**
   ```bash
   npm start
   # Server will run on http://localhost:3000 (or PORT from env)
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000

# MLBB API (Optional - for game lookup)
MLBB_API_URL=https://api.example.com/mlbb/lookup
MLBB_API_KEY=your-api-key
MLBB_API_KEY_HEADER=x-api-key

# APIGames Integration (Optional)
APIGAMES_API_URL=https://api.apigames.com
APIGAMES_API_KEY=your-apigames-key

# Email Service (Optional - for OTP)
EMAIL_SERVICE_API_KEY=your-email-service-key
```

### Data Storage

By default, the application uses JSON files for data storage:
- `server/data/users.json` - User accounts
- `server/data/orders.json` - Order records
- `server/data/otps.json` - OTP codes

**Note:** For production, consider migrating to a proper database (MongoDB, PostgreSQL, etc.). The repository pattern makes this migration straightforward. See `server/repositories/README.md` for details.

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
Note: Alternatif dev/fallback gunakan `"captcha": "jawaban-captcha"`.

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
Note: Alternatif dev/fallback gunakan `"captcha": "jawaban-captcha"`.

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
Note: Alternatif dev/fallback gunakan `"captcha": "jawaban-captcha"`.

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
Note: Alternatif dev/fallback gunakan `"captcha": "jawaban-captcha"`.

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
Note: Alternatif dev/fallback gunakan `"captcha": "jawaban-captcha"`.

### Pencarian Akun Game

#### MLBB Account Lookup
```http
GET /api/mlbb/lookup?userId=123456&zoneId=1234
```

#### APIGames Account Info
```http
GET /api/apigames/account
```

#### Check Username (APIGames)
```http
GET /api/apigames/check-username?gameCode=mlbb&userId=123456&zoneId=1234
```

### Pesanan

#### Create Order
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

#### Get Order
```http
GET /api/orders/:id
```

### Pembayaran

#### Mock Payment Page
```http
GET /api/mock/pay?orderId=ord_xxxxx
```

#### Payment Webhook
```http
POST /api/webhook/payment
Content-Type: application/json

{
  "orderId": "ord_xxxxx",
  "status": "paid"
}
```

### Captcha

#### Get New Captcha
```http
GET /api/captcha/new
```

#### Get Captcha Site Key
```http
GET /api/captcha/sitekey
```

## 🔗 Jalur Website (Auth SPA)

Halaman autentikasi disajikan sebagai website:
- `/login`, `/register`, `/forgot`

Sementara halaman lain tetap berbasis HTML/JS di folder `pages/`.

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

- ✅ Separation of Concerns
- ✅ Testability
- ✅ Maintainability
- ✅ Easy migration to database
- ✅ Clean code structure

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

1. Create repository (if new entity)
2. Create model wrapper
3. Create service with business logic
4. Create controller for API endpoint
5. Add route in `server/routes/index.js`

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
