# Pemisahan OTP Login dan Forgot Password

## Ringkasan Perubahan

Sistem OTP telah dipisahkan menjadi 3 flow yang berbeda:

### 1. **Login Flow** (dengan OTP)
- **Halaman**: `login.html` → `login-otp.html`
- **Endpoint API**:
  - `POST /api/auth/request-login-otp` - Validasi kredensial & kirim OTP
  - `POST /api/auth/verify-login-otp` - Verifikasi OTP & login
- **LocalStorage**: `login_email`

### 2. **Forgot Password Flow** (dengan OTP)
- **Halaman**: `forgot.html` → `forgot-otp.html`
- **Endpoint API**:
  - `POST /api/auth/request-otp` (purpose: 'reset')
  - `POST /api/auth/reset-password` - Verifikasi OTP & reset password
- **LocalStorage**: `forgot_email`

### 3. **Registration Flow** (dengan OTP)
- **Halaman**: `register.html` → `verify-otp.html`
- **Endpoint API**:
  - `POST /api/auth/register` - Otomatis kirim OTP
  - `POST /api/auth/verify-otp` - Verifikasi akun
- **LocalStorage**: `pending_email`

## File yang Dibuat

1. **`legacy_static_site/pages/login-otp.html`**
   - Halaman verifikasi OTP khusus untuk login
   - 6 input box untuk OTP
   - Tombol "Kirim Ulang OTP"

2. **`legacy_static_site/pages/forgot-otp.html`**
   - Halaman verifikasi OTP khusus untuk reset password
   - 6 input box untuk OTP
   - Input untuk password baru
   - Tombol "Kirim Ulang OTP"

## File yang Dimodifikasi

### Frontend

1. **`legacy_static_site/assets/js/auth.js`**
   - ✅ Ditambahkan fungsi `setupOtpInput()` - Auto-focus antar input OTP
   - ✅ Ditambahkan fungsi `getOtpValue()` - Mengambil nilai OTP 6 digit
   - ✅ Diperbarui `bindLogin()` - Redirect ke `login-otp.html`
   - ✅ Diperbarui `bindForgot()` - Redirect ke `forgot-otp.html`
   - ✅ Ditambahkan `bindLoginOtp()` - Handle verifikasi login OTP
   - ✅ Ditambahkan `bindForgotOtp()` - Handle reset password dengan OTP
   - ✅ Diperbarui `resendOtp()` - Support semua halaman OTP
   - ✅ Diperbarui `bindResend()` - Handler untuk semua tombol resend

### Backend

2. **`server/routes/index.js`**
   - ✅ Ditambahkan route `POST /auth/request-login-otp`
   - ✅ Ditambahkan route `POST /auth/verify-login-otp`
   - ✅ Dihapus route `POST /auth/login/verify` (deprecated)

3. **`server/controllers/authController.js`**
   - ✅ Diperbarui `login()` - Hanya validasi kredensial
   - ✅ Ditambahkan `requestLoginOtp()` - Validasi & kirim OTP
   - ✅ Ditambahkan `verifyLoginOtp()` - Verifikasi OTP & return token

4. **`server/services/authService.js`**
   - ✅ Ditambahkan `validateCredentials()` - Validasi email & password
   - ✅ Ditambahkan `requestLoginOtp()` - Generate & kirim OTP login

## Flow Diagram

### Login Flow
```
User → login.html (email + password + captcha)
     ↓
     POST /api/auth/request-login-otp
     ↓
     login-otp.html (6 digit OTP)
     ↓
     POST /api/auth/verify-login-otp
     ↓
     index.html (logged in)
```

### Forgot Password Flow
```
User → forgot.html (email + captcha)
     ↓
     POST /api/auth/request-otp (purpose: reset)
     ↓
     forgot-otp.html (6 digit OTP + new password)
     ↓
     POST /api/auth/reset-password
     ↓
     login.html (password reset success)
```

### Registration Flow
```
User → register.html (email + password + captcha)
     ↓
     POST /api/auth/register (auto send OTP)
     ↓
     verify-otp.html (6 digit OTP)
     ↓
     POST /api/auth/verify-otp
     ↓
     login.html (account verified)
```

## Testing Checklist

- [ ] Login dengan kredensial valid → Redirect ke login-otp.html
- [ ] Input OTP login yang benar → Berhasil login
- [ ] Input OTP login yang salah → Error message
- [ ] Klik "Kirim Ulang OTP" di login-otp.html → OTP baru dikirim
- [ ] Forgot password → Redirect ke forgot-otp.html
- [ ] Input OTP reset + password baru → Password berhasil direset
- [ ] Klik "Kirim Ulang OTP" di forgot-otp.html → OTP baru dikirim
- [ ] Register akun baru → Redirect ke verify-otp.html
- [ ] Verifikasi OTP registrasi → Akun terverifikasi

## Keuntungan Pemisahan

1. ✅ **Lebih Jelas** - Setiap flow memiliki halaman OTP sendiri
2. ✅ **Lebih Aman** - Setiap OTP memiliki purpose yang berbeda
3. ✅ **Lebih Mudah Maintain** - Kode terpisah untuk setiap flow
4. ✅ **Better UX** - User tahu context dari OTP yang diminta
5. ✅ **Scalable** - Mudah menambahkan flow OTP baru di masa depan
