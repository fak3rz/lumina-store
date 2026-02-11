# Panduan Pengujian Keamanan

Panduan pengujian keamanan komprehensif untuk aplikasi Lumia Store.

## 🔒 Daftar Periksa Keamanan

### Autentikasi & Otorisasi
- [ ] Validasi kekuatan password
- [ ] Validasi format email
- [ ] Rate limiting pada endpoint autentikasi
- [ ] Penguncian akun setelah percobaan gagal
- [ ] Manajemen sesi/token yang aman
- [ ] Kedaluwarsa token reset password
- [ ] Rate limiting OTP
- [ ] Proteksi brute force OTP

### Validasi Input
- [ ] Sanitasi dan validasi email
- [ ] Validasi User ID (numerik, panjang)
- [ ] Validasi Zone ID
- [ ] Validasi Password (panjang, kompleksitas)
- [ ] Validasi Order ID
- [ ] Batas panjang input
- [ ] Penanganan karakter khusus

### Perlindungan Data
- [ ] Hashing password (scrypt dengan salt) ✅
- [ ] Enkripsi data sensitif
- [ ] Pembuatan token yang aman
- [ ] Kedaluwarsa OTP ✅
- [ ] Sanitasi data sebelum penyimpanan

### Keamanan API
- [ ] Proteksi CAPTCHA ✅
- [ ] Rate limiting
- [ ] Konfigurasi CORS
- [ ] Batas ukuran request (Request size limits)
- [ ] Penegakan HTTPS
- [ ] Proteksi API key

### Penanganan Error
- [ ] Pesan error generik
- [ ] Tidak ada kebocoran informasi dalam error
- [ ] Logging error yang tepat
- [ ] Menyembunyikan stack trace di produksi

### Keamanan Sistem File
- [ ] Validasi path file
- [ ] Pembatasan akses file
- [ ] Pencegahan injeksi JSON
- [ ] Izin (permissions) file data

## 🧪 Kasus Uji Keamanan

### 1. Pengujian Autentikasi

#### Uji: Password Lemah
```bash
# Seharusnya menolak password lemah
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123",
    "captchaToken": "test"
  }'
```
**Harapan:** Harus memvalidasi panjang minimal password (8+ karakter)

#### Uji: Format Email Tidak Valid
```bash
# Seharusnya menolak format email yang salah
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "password123",
    "captchaToken": "test"
  }'
```
**Harapan:** Harus memvalidasi format email

#### Uji: Percobaan SQL Injection (Email)
```bash
# Seharusnya sanitasi input email
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com\"; DROP TABLE users; --",
    "password": "password123",
    "captchaToken": "test"
  }'
```
**Harapan:** Harus menangani dengan aman (menggunakan JSON, tapi tetap harus divalidasi)

#### Uji: Percobaan XSS (Email)
```bash
# Seharusnya sanitasi email untuk mencegah XSS
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "<script>alert(\"XSS\")</script>@example.com",
    "password": "password123",
    "captchaToken": "test"
  }'
```
**Harapan:** Harus disanitasi atau ditolak

#### Uji: Serangan Brute Force
```bash
# Seharusnya membatasi laju (rate limit) setelah beberapa kali gagal
for i in {1..20}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "wrongpassword",
      "captchaToken": "test"
    }'
done
```
**Harapan:** Harus mengimplementasikan rate limiting (saat ini belum diimplementasikan)

#### Uji: Enumerasi Akun
```bash
# Uji apakah sistem mengungkapkan email yang terdaftar
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "password123",
    "captchaToken": "test"
  }'
```
**Harapan:** Harus mengembalikan error generik (bukan "Email tidak ditemukan")

### 2. Pengujian Keamanan OTP

#### Uji: Brute Force OTP
```bash
# Seharusnya membatasi percobaan OTP
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/auth/verify-otp \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "code": "'$i'00000",
      "captchaToken": "test"
    }'
done
```
**Harapan:** Harus membatasi percobaan atau mengunci akun

#### Uji: Serangan Replay OTP
```bash
# Seharusnya mencegah penggunaan ulang OTP yang sudah dipakai
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456",
    "captchaToken": "test"
  }'
# Ulangi request yang sama
```
**Harapan:** Harus menolak OTP yang sudah dikonsumsi (saat ini sudah ditangani ✅)

#### Uji: Rate Limiting Permintaan OTP
```bash
# Seharusnya membatasi frekuensi permintaan OTP
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/request-otp \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "purpose": "verify",
      "captchaToken": "test"
    }'
  sleep 1
done
```
**Harapan:** Harus mengimplementasikan rate limiting (saat ini belum diimplementasikan)

### 3. Pengujian Keamanan Pesanan

#### Uji: Format Order ID Tidak Valid
```bash
# Seharusnya memvalidasi format order ID
curl http://localhost:3000/api/orders/../../../etc/passwd
```
**Harapan:** Harus memvalidasi format dan menolak ID yang tidak valid

#### Uji: Injeksi Order ID
```bash
# Seharusnya sanitasi order ID
curl http://localhost:3000/api/orders/ord_123'; DROP TABLE orders; --
```
**Harapan:** Harus ditangani dengan aman

#### Uji: Akses Pesanan Tidak Sah
```bash
# Seharusnya memverifikasi kepemilikan (jika diimplementasikan)
curl http://localhost:3000/api/orders/ord_another_users_order
```
**Harapan:** Harus memverifikasi kepemilikan (saat ini belum diimplementasikan)

#### Uji: Harga Negatif
```bash
# Seharusnya memvalidasi harga pesanan
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123456",
    "zoneId": "1234",
    "sku": "diamond_86",
    "amount": -86,
    "price": -23000,
    "paymentMethod": "dana",
    "captchaToken": "test"
  }'
```
**Harapan:** Harus memvalidasi harga > 0

### 4. Pengujian Keamanan Pencarian Game

#### Uji: User ID Tidak Valid
```bash
# Seharusnya memvalidasi format User ID
curl "http://localhost:3000/api/mlbb/lookup?userId=<script>alert('XSS')</script>&zoneId=1234"
```
**Harapan:** Harus sanitasi dan validasi input numerik

#### Uji: SQL Injection (User ID)
```bash
# Seharusnya ditangani dengan aman
curl "http://localhost:3000/api/mlbb/lookup?userId=123456'; DROP TABLE orders; --&zoneId=1234"
```
**Harapan:** Harus memvalidasi format (hanya angka)

#### Uji: Input Sangat Panjang
```bash
# Seharusnya membatasi panjang input
curl "http://localhost:3000/api/mlbb/lookup?userId=$(python3 -c 'print("1"*10000)')&zoneId=1234"
```
**Harapan:** Harus menegakkan batas panjang karakter

### 5. Pengujian Keamanan CAPTCHA

#### Uji: Token CAPTCHA Hilang
```bash
# Seharusnya mewajibkan CAPTCHA
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```
**Harapan:** Harus menolak tanpa CAPTCHA ✅ (sudah diimplementasikan)

#### Uji: Token CAPTCHA Tidak Valid
```bash
# Seharusnya memvalidasi CAPTCHA
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "captchaToken": "invalid_token"
  }'
```
**Harapan:** Harus menolak CAPTCHA tidak valid ✅ (sudah diimplementasikan)

### 6. Pengujian Keamanan CORS

#### Uji: Permintaan Lintas Origin (Cross-Origin)
```javascript
// Uji dari browser console pada origin berbeda
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    captchaToken: 'test'
  })
})
```
**Harapan:** Harus mengkonfigurasi CORS dengan benar (saat ini mengizinkan semua ✅)

### 7. Pengujian Keamanan Sistem File

#### Uji: Path Traversal
```bash
# Seharusnya mencegah directory traversal
curl http://localhost:3000/api/orders/../../../etc/passwd
```
**Harapan:** Harus memvalidasi format order ID

#### Uji: Injeksi JSON
```bash
# Seharusnya mencegah injeksi JSON di file data
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com}",
    "password": "password123",
    "captchaToken": "test"
  }'
```
**Harapan:** Harus menangani parsing JSON dengan aman

### 8. Pengujian Pengungkapan Informasi

#### Uji: Kebocoran Informasi Pesan Error
```bash
# Seharusnya tidak mengungkapkan informasi sensitif
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "wrong",
    "captchaToken": "test"
  }'
```
**Harapan:** Harus mengembalikan error generik (tidak mengungkapkan jika email ada)

#### Uji: Paparan Stack Trace
```bash
# Memicu error internal
curl http://localhost:3000/api/orders/invalid_id_that_causes_error
```
**Harapan:** Seharusnya tidak mengekspos stack traces di produksi

### 9. Pengujian Keamanan Sesi/Token

#### Uji: Prediktabilitas Token
```bash
# Dapatkan beberapa token dan cek polanya
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "password123",
      "captchaToken": "test"
    }' | jq -r '.token'
done
```
**Harapan:** Token harus tidak dapat diprediksi (saat ini menggunakan timestamp ✅)

#### Uji: Kedaluwarsa Token
```bash
# Gunakan token lama dan verifikasi kedaluwarsa
# (Memerlukan implementasi kedaluwarsa token)
```
**Harapan:** Token harus kedaluwarsa setelah tidak aktif

## 🛠 Alat Pengujian Keamanan

### Pemindaian Otomatis
```bash
# Instal alat keamanan
npm install --save-dev eslint-plugin-security

# Jalankan audit keamanan
npm audit

# Cek kerentanan
npm audit fix
```

### Daftar Periksa Pengujian Manual
1. **Autentikasi**
   - [ ] Uji password lemah
   - [ ] Uji validasi email
   - [ ] Uji proteksi brute force
   - [ ] Uji penguncian akun

2. **Otorisasi**
   - [ ] Uji akses tidak sah
   - [ ] Uji eskalasi hak akses
   - [ ] Uji kepemilikan sumber daya

3. **Validasi Input**
   - [ ] Uji SQL injection
   - [ ] Uji upaya XSS
   - [ ] Uji command injection
   - [ ] Uji path traversal

4. **Perlindungan Data**
   - [ ] Verifikasi hashing password
   - [ ] Cek paparan data sensitif
   - [ ] Verifikasi enkripsi saat transit

5. **Penanganan Error**
   - [ ] Cek kebocoran pesan error
   - [ ] Verifikasi penyembunyian stack trace
   - [ ] Cek logging error

## 🚨 Isu Keamanan yang Diketahui

### Kerentanan Saat Ini

1. **❌ Tidak Ada Validasi Kekuatan Password**
   - **Risiko:** Pengguna bisa mengatur password lemah
   - **Dampak:** Menengah
   - **Rekomendasi:** Tambahkan syarat panjang dan kompleksitas minimal

2. **❌ Tidak Ada Validasi Format Email**
   - **Risiko:** Email tidak valid bisa tersimpan
   - **Dampak:** Rendah
   - **Rekomendasi:** Tambahkan validasi regex email

3. **❌ Tidak Ada Rate Limiting**
   - **Risiko:** Serangan brute force dimungkinkan
   - **Dampak:** Tinggi
   - **Rekomendasi:** Implementasikan middleware rate limiting

4. **❌ Enumerasi Akun**
   - **Risiko:** Penyerang bisa menemukan email valid
   - **Dampak:** Menengah
   - **Rekomendasi:** Kembalikan pesan error generik

5. **❌ Tidak Ada Sanitasi Input**
   - **Risiko:** Serangan XSS dan injeksi
   - **Dampak:** Tinggi
   - **Rekomendasi:** Sanitasi semua input pengguna

6. **❌ CORS Terlalu Longgar**
   - **Risiko:** Serangan CSRF
   - **Dampak:** Menengah
   - **Rekomendasi:** Konfigurasikan origin spesifik

7. **❌ Tidak Ada Batas Ukuran Request**
   - **Risiko:** DoS melalui payload besar
   - **Dampak:** Menengah
   - **Rekomendasi:** Tambahkan batas (limits) pada body parser

8. **❌ Tidak Ada Verifikasi Kepemilikan Pesanan**
   - **Risiko:** Pengguna bisa mengakses pesanan pengguna lain
   - **Dampak:** Tinggi
   - **Rekomendasi:** Tambahkan pengecekan kepemilikan

## ✅ Praktik Terbaik Keamanan yang Diimplementasikan

1. **✅ Hashing Password** - Menggunakan scrypt dengan salt
2. **✅ Kedaluwarsa OTP** - TTL 10 menit
3. **✅ Proteksi CAPTCHA** - Pada endpoint sensitif
4. **✅ OTP Sekali Pakai** - Dikonsumsi setelah verifikasi
5. **✅ CORS Diaktifkan** - Untuk dukungan lintas origin
6. **✅ Penanganan Error** - Blok try-catch
7. **✅ Validasi Input** - Pengecekan field wajib dasar

## 📋 Perbaikan Prioritas

### Prioritas Tinggi
1. Implementasi rate limiting
2. Tambahkan sanitasi input
3. Tambahkan validasi kekuatan password
4. Verifikasi kepemilikan pesanan

### Prioritas Menengah
1. Tambahkan validasi format email
2. Pesan error generik
3. Konfigurasi CORS
4. Batas ukuran request

### Prioritas Rendah
1. Kedaluwarsa token
2. Penguncian akun
3. Logging yang ditingkatkan
4. Header keamanan

## 🔄 Keamanan Berkelanjutan

- Jalankan `npm audit` secara berkala
- Tinjau dependensi untuk kerentanan
- Pantau log error untuk aktivitas mencurigakan
- Jaga dependensi tetap mutakhir
- Audit keamanan rutin
- Tes penetrasi (Penetration testing)

---

**Catatan:** Dokumen ini harus diperbarui secara berkala seiring dengan peningkatan keamanan yang dilakukan.
