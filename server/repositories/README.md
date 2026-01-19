# Implementasi Pola Repository

Direktori ini berisi implementasi Pola Repository untuk abstraksi akses data pada aplikasi Lumiastore.

## Gambaran Umum

Pola Repository memisahkan logika bisnis dari akses data. Hal ini membuat basis kode lebih mudah dirawat, diuji, dan memudahkan migrasi ke penyimpanan data lain di masa depan.

## Arsitektur

```
server/
├── repositories/
│   ├── base/
│   │   ├── BaseRepository.js       # Abstract base repository interface
│   │   └── JsonFileRepository.js   # Base implementation for JSON file storage
│   ├── UserRepository.js           # User data repository
│   ├── OrderRepository.js          # Order data repository
│   ├── OtpRepository.js            # OTP data repository
│   ├── index.js                    # Central export point
│   └── README.md                   # This file
├── models/
│   ├── userModel.js                # Wrapper using UserRepository
│   ├── orderModel.js               # Wrapper using OrderRepository
│   └── otpModel.js                 # Wrapper using OtpRepository
└── services/
    └── ...                         # Business logic using models
```

## Structure

### Base Repository (`base/BaseRepository.js`)
Kelas abstrak yang mendefinisikan antarmuka semua repository:
- `findById(id)` - Cari entitas berdasarkan ID
- `findAll(filter)` - Ambil semua entitas (opsional filter)
- `create(data)` - Buat entitas baru
- `update(id, updates)` - Perbarui entitas
- `delete(id)` - Hapus entitas
- `exists(id)` - Cek keberadaan entitas

### JSON File Repository (`base/JsonFileRepository.js`)
Implementasi dasar untuk penyimpanan berbasis file JSON:
- Menangani operasi I/O file
- Memastikan direktori dan berkas data tersedia
- Menyediakan operasi CRUD umum
- Dapat diperluas untuk tipe entitas spesifik

### Repository Konkret

#### UserRepository
- `create(userData)` - Buat pengguna baru (hashing password)
- `findByEmail(email)` - Cari pengguna berdasarkan email
- `verifyPassword(user, password)` - Verifikasi password pengguna
- `setVerified(email, verified)` - Perbarui status verifikasi
- `updatePassword(email, newPassword)` - Perbarui password

#### OrderRepository
- `create(orderData)` - Buat pesanan baru
- `findById(id)` - Cari pesanan berdasarkan ID
- `update(id, updates)` - Perbarui pesanan
- `updateStatus(id, status)` - Perbarui status pesanan
- `findByUserId(userId)` - Cari pesanan berdasarkan user ID
- `findByStatus(status)` - Cari pesanan berdasarkan status

#### OtpRepository
- `create(email, code, purpose, ttlMinutes)` - Buat OTP baru
- `findByEmail(email)` - Cari OTP berdasarkan email
- `validate(email, code, purpose)` - Validasi kode OTP
- `consume(email)` - Hapus OTP setelah dipakai
- `cleanExpired()` - Hapus OTP yang kedaluwarsa

## Penggunaan

### Penggunaan Langsung Repository
```javascript
const { UserRepository } = require('./repositories');

// Create user
const user = await UserRepository.create({ 
  email: 'user@example.com', 
  password: 'password123' 
});

// Find user
const foundUser = await UserRepository.findByEmail('user@example.com');

// Verify password
const isValid = UserRepository.verifyPassword(foundUser, 'password123');
```

### Melalui Model (Direkomendasikan)
Model bertindak sebagai wrapper repository untuk menjaga kompatibilitas API:

```javascript
const userModel = require('../models/userModel');

// Create user (same API as before)
const user = await userModel.createUser({ 
  email: 'user@example.com', 
  password: 'password123' 
});

// Find user
const foundUser = await userModel.findByEmail('user@example.com');
```

## Keuntungan

1. **Pemisahan Tanggung Jawab**: Akses data terpisah dari logika bisnis
2. **Dapat Diuji**: Mudah di-mock untuk unit test
3. **Fleksibel**: Mudah beralih dari file JSON ke database (PostgreSQL, dsb.)
4. **Mudah Dirawat**: Akses data terpusat
5. **Konsisten**: Antarmuka standar untuk semua operasi data
6. **Kompatibel Mundur**: Model mempertahankan API lama sambil memakai repository

## Panduan Migrasi

Jika ingin berpindah dari file JSON ke database:

1. Buat base repository baru (mis. `DatabaseRepository.js`)
2. Implementasikan repository khusus database yang mewarisi base baru
3. Perbarui ekspor model agar memakai repository database
4. Tidak perlu mengubah service atau controller!

Contoh:
```javascript
// server/repositories/base/DatabaseRepository.js
const BaseRepository = require('./BaseRepository');

class DatabaseRepository extends BaseRepository {
  constructor(db) {
    super();
    this.db = db;
  }
  
  async findById(id) {
    return await this.db.findById(id);
  }
  
  // ... implement other methods
}
```

## Peningkatan Mendatang

- [ ] Tambahkan implementasi repository database (PostgreSQL)
- [ ] Tambahkan caching layer
- [ ] Dukungan transaksi
- [ ] Query builder untuk filter kompleks
- [ ] Dukungan pagination
- [ ] Hook logging/monitoring

## Catatan

- Semua method repository bersifat async (Promise)
- Model menjaga API kompatibel namun memakai repository async
- Operasi file dibungkus async untuk konsistensi
- Penanganan error dilakukan di level service/controller
