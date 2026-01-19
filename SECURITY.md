# Dokumentasi Keamanan

Dokumen ini memberikan gambaran tentang langkah-langkah keamanan, kerentanan, dan prosedur pengujian untuk aplikasi Lumia Store.

## 🔒 Ikhtisar Keamanan

Aplikasi ini menerapkan sejumlah langkah keamanan namun masih memiliki area yang perlu ditingkatkan. Dokumen ini merangkum fitur keamanan yang sudah diimplementasikan serta kerentanan yang diketahui.

## ✅ Fitur Keamanan yang Diimplementasikan

### Autentikasi & Otorisasi
- **Hashing Password**: Password di-hash menggunakan Node.js `crypto.scryptSync` dengan salt
- **Sistem OTP**: One-time password dengan kedaluwarsa 10 menit
- **Proteksi CAPTCHA**: CAPTCHA wajib pada endpoint sensitif (registrasi, login, OTP)
- **OTP Sekali Pakai**: Kode OTP dikonsumsi setelah verifikasi (tidak dapat digunakan ulang)

### Perlindungan Data
- **Pembuatan Token Aman**: Token menggunakan hash dari user ID + timestamp
- **Kedaluwarsa OTP**: Kode OTP kedaluwarsa setelah 10 menit
- **Password Salt**: Setiap password menggunakan salt unik untuk hashing

### Keamanan API
- **CAPTCHA Guard**: Proteksi middleware pada endpoint autentikasi
- **CORS Diaktifkan**: Berbagi sumber lintas origin dikonfigurasi
- **Penanganan Error**: Blok try-catch mencegah kebocoran crash
- **Validasi Input**: Pengecekan bidang wajib dasar

### Keamanan Penyimpanan
- **Penyimpanan Berkas JSON**: Saat ini menggunakan penyimpanan berbasis berkas (mudah dimigrasikan ke database)
- **Pola Repository**: Pemisahan jelas memungkinkan migrasi akses data yang aman

## ⚠️ Isu Keamanan yang Diketahui

### Prioritas Tinggi

1. **Tidak Ada Rate Limiting**
   - **Masalah**: Tidak ada perlindungan terhadap serangan brute force
   - **Risiko**: Penyerang dapat mencoba login/permintaan OTP tanpa batas
   - **Rekomendasi**: Implementasi middleware `express-rate-limit`
   - **Dampak**: Tinggi

2. **Tidak Ada Sanitasi Input**
   - **Masalah**: Input pengguna tidak disanitasi untuk XSS/injection
   - **Risiko**: Potensi serangan XSS dan injection
   - **Rekomendasi**: Gunakan pustaka seperti `validator` dan `sanitize-html`
   - **Dampak**: Tinggi

3. **Tidak Ada Verifikasi Kepemilikan Pesanan**
   - **Masalah**: Pengguna dapat mengakses pesanan apa pun berdasarkan ID
   - **Risiko**: Akses tidak sah ke pesanan pengguna lain
   - **Rekomendasi**: Tambahkan autentikasi pengguna dan pengecekan kepemilikan
   - **Dampak**: Tinggi

### Prioritas Menengah

4. **Tidak Ada Validasi Kekuatan Password**
   - **Masalah**: Password lemah dapat digunakan
   - **Risiko**: Akun rentan terhadap brute force
   - **Rekomendasi**: Wajib minimal 8 karakter, dengan kompleksitas
   - **Dampak**: Menengah

5. **Enumerasi Akun**
   - **Masalah**: Pesan error mengungkapkan apakah email ada
   - **Risiko**: Penyerang dapat menemukan alamat email yang valid
   - **Rekomendasi**: Kembalikan pesan error generik
   - **Dampak**: Menengah

6. **CORS Terlalu Longgar**
   - **Masalah**: CORS mengizinkan semua origin
   - **Risiko**: Serangan CSRF mungkin terjadi
   - **Rekomendasi**: Konfigurasikan origin yang diizinkan secara spesifik
   - **Dampak**: Menengah

7. **Tidak Ada Validasi Format Email**
   - **Masalah**: Format email tidak valid dapat tersimpan
   - **Risiko**: Masalah integritas data, potensi eksploitasi
   - **Rekomendasi**: Tambahkan validasi regex email
   - **Dampak**: Menengah

8. **Tidak Ada Batas Ukuran Request**
   - **Masalah**: Tidak ada batas ukuran pada body parser
   - **Risiko**: DoS melalui payload besar
   - **Rekomendasi**: Tambahkan opsi `limit` pada body parser
   - **Dampak**: Menengah

### Prioritas Rendah

9. **Tidak Ada Kedaluwarsa Token**
   - **Masalah**: Token tidak kedaluwarsa setelah tidak aktif
   - **Risiko**: Token yang dicuri tetap valid tanpa batas
   - **Rekomendasi**: Implementasi kedaluwarsa token
   - **Dampak**: Rendah

10. **Tidak Ada Penguncian Akun**
    - **Masalah**: Tidak ada penguncian setelah percobaan gagal
    - **Risiko**: Serangan brute force lebih mudah
    - **Rekomendasi**: Kunci akun setelah N percobaan gagal
    - **Dampak**: Rendah

11. **Stack Trace dalam Error**
    - **Masalah**: Detail error bisa bocor di produksi
    - **Risiko**: Kebocoran informasi
    - **Rekomendasi**: Gunakan error generik pada mode produksi
    - **Dampak**: Rendah

## 🧪 Pengujian Keamanan

### Menjalankan Pengujian Keamanan

```bash
# Jalankan pengujian keamanan otomatis
npm run test:security

# Jalankan npm audit untuk kerentanan dependensi
npm audit

# Perbaiki kerentanan yang bisa diperbaiki otomatis
npm audit fix
```

### Pengujian Manual

Lihat [SECURITY_TESTING.md](./SECURITY_TESTING.md) untuk prosedur pengujian manual yang komprehensif.

### Cakupan Pengujian

Pengujian keamanan mencakup:
- ✅ Validasi password lemah
- ✅ Format email tidak valid
- ✅ Upaya SQL injection
- ✅ Upaya XSS
- ✅ Persyaratan CAPTCHA
- ✅ Enumerasi akun
- ✅ Validasi ID pesanan
- ✅ Proteksi replay OTP
- ✅ Validasi panjang input
- ✅ Validasi harga

## 🛠 Rekomendasi Keamanan

### Tindakan Segera (Prioritas Tinggi)

1. **Implementasi Rate Limiting**
   ```bash
   npm install express-rate-limit
   ```
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 menit
     max: 5 // batasi tiap IP 5 request per window
   });
   app.use('/api/auth', limiter);
   ```

2. **Tambahkan Sanitasi Input**
   ```bash
   npm install validator
   ```
   ```javascript
   const validator = require('validator');
   const email = validator.normalizeEmail(req.body.email);
   if (!validator.isEmail(email)) {
     return res.status(400).json({ error: 'Email tidak valid' });
   }
   ```

3. **Tambahkan Pengecekan Kepemilikan Pesanan**
   ```javascript
   async get(req, res) {
     const order = await orderModel.findById(req.params.id);
     const user = await getCurrentUser(req); // Dari token/sesi
     if (order.userId !== user.id) {
       return res.status(403).json({ error: 'Terlarang' });
     }
     // ... kembalikan pesanan
   }
   ```

### Perbaikan Jangka Pendek (Prioritas Menengah)

4. **Validasi Kekuatan Password**
   ```javascript
   function validatePassword(password) {
     if (password.length < 8) return false;
     if (!/[A-Z]/.test(password)) return false;
     if (!/[a-z]/.test(password)) return false;
     if (!/[0-9]/.test(password)) return false;
     return true;
   }
   ```

5. **Pesan Error Generik**
   ```javascript
   // Alih-alih: "Email tidak ditemukan" atau "Password salah"
   // Gunakan: "Email atau password salah"
   ```

6. **Konfigurasi CORS**
   ```javascript
   const cors = require('cors');
   app.use(cors({
     origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
     credentials: true
   }));
   ```

7. **Batas Ukuran Request**
   ```javascript
   app.use(express.json({ limit: '10mb' }));
   app.use(express.urlencoded({ limit: '10mb', extended: true }));
   ```

### Peningkatan Jangka Panjang (Prioritas Rendah)

8. **JWT dengan Kedaluwarsa**
   ```bash
   npm install jsonwebtoken
   ```

9. **Penguncian Akun**
   ```javascript
   // Lacak percobaan gagal dalam model pengguna
   // Kunci akun setelah N percobaan
   ```

10. **Header Keamanan**
    ```bash
    npm install helmet
    ```
    ```javascript
    const helmet = require('helmet');
    app.use(helmet());
    ```

## 📋 Daftar Periksa Keamanan

### Pengembangan
- [ ] Jalankan `npm audit` secara berkala
- [ ] Tinjau dependensi untuk kerentanan
- [ ] Jaga dependensi tetap mutakhir
- [ ] Gunakan variabel lingkungan untuk rahasia
- [ ] Jangan pernah commit berkas `.env`
- [ ] Gunakan HTTPS di produksi

### Review Kode
- [ ] Validasi semua input
- [ ] Sanitasi input pengguna
- [ ] Gunakan query terparameter (saat menggunakan DB)
- [ ] Implementasi rate limiting
- [ ] Cek otorisasi pada semua endpoint
- [ ] Gunakan pembuatan token yang aman
- [ ] Implementasi penanganan error yang tepat

### Deploy
- [ ] Gunakan HTTPS/TLS
- [ ] Konfigurasi CORS dengan benar
- [ ] Atur header HTTP yang aman
- [ ] Aktifkan rate limiting
- [ ] Monitor log error
- [ ] Audit keamanan rutin
- [ ] Backup data secara aman

## 🔄 Pemeliharaan Keamanan

### Tugas Rutin
- **Mingguan**: Jalankan `npm audit` dan tinjau kerentanan
- **Bulanan**: Tinjau log keamanan dan insiden
- **Triwulanan**: Audit keamanan dan pengujian penetrasi
- **Tahunan**: Tinjau keamanan menyeluruh dan pembaruan kebijakan

### Monitoring
- Pantau log error untuk pola mencurigakan
- Lacak percobaan login gagal
- Pantau frekuensi permintaan OTP
- Beri peringatan pada penggunaan API yang tidak biasa

## 📞 Respons Insiden Keamanan

Jika kerentanan keamanan ditemukan:

1. **Jangan** mengungkapkan secara publik hingga diperbaiki
2. Buat issue privat atau hubungi tim keamanan
3. Nilai tingkat keparahan dan dampak
4. Kembangkan dan uji perbaikan
5. Deploy perbaikan segera
6. Dokumentasikan insiden dan perbaikan

## 📚 Sumber Tambahan

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [SECURITY_TESTING.md](./SECURITY_TESTING.md) - Panduan pengujian terperinci

## 📝 Catatan Perubahan Keamanan

### Status Saat Ini
- ✅ Langkah keamanan dasar telah diterapkan
- ⚠️ Beberapa kerentanan telah diidentifikasi
- 📋 Rencana perbaikan sedang berjalan

---

**Terakhir Diperbarui**: 2024
**Kontak Keamanan**: Lihat pengelola proyek

**Ingat**: Keamanan adalah proses berkelanjutan, bukan tugas sekali saja. Tinjauan dan pembaruan rutin sangat penting.
