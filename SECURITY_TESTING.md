# Security Testing Guide

Comprehensive security testing guide for Lumia Store application.

## 🔒 Security Checklist

### Authentication & Authorization
- [ ] Password strength validation
- [ ] Email format validation
- [ ] Rate limiting on authentication endpoints
- [ ] Account lockout after failed attempts
- [ ] Secure session/token management
- [ ] Password reset token expiration
- [ ] OTP rate limiting
- [ ] OTP brute force protection

### Input Validation
- [ ] Email sanitization and validation
- [ ] User ID validation (numeric, length)
- [ ] Zone ID validation
- [ ] Password validation (length, complexity)
- [ ] Order ID validation
- [ ] Input length limits
- [ ] Special character handling

### Data Protection
- [ ] Password hashing (scrypt with salt) ✅
- [ ] Sensitive data encryption
- [ ] Secure token generation
- [ ] OTP expiration ✅
- [ ] Data sanitization before storage

### API Security
- [ ] CAPTCHA protection ✅
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Request size limits
- [ ] HTTPS enforcement
- [ ] API key protection

### Error Handling
- [ ] Generic error messages
- [ ] No information leakage in errors
- [ ] Proper error logging
- [ ] Stack trace hiding in production

### File System Security
- [ ] File path validation
- [ ] File access restrictions
- [ ] JSON injection prevention
- [ ] Data file permissions

## 🧪 Security Test Cases

### 1. Authentication Tests

#### Test: Weak Password
```bash
# Should reject weak passwords
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123",
    "captchaToken": "test"
  }'
```
**Expected:** Should validate minimum password length (8+ characters)

#### Test: Invalid Email Format
```bash
# Should reject invalid email formats
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "password123",
    "captchaToken": "test"
  }'
```
**Expected:** Should validate email format

#### Test: SQL Injection Attempt (Email)
```bash
# Should sanitize email input
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com\"; DROP TABLE users; --",
    "password": "password123",
    "captchaToken": "test"
  }'
```
**Expected:** Should handle safely (using JSON, but should validate)

#### Test: XSS Attempt (Email)
```bash
# Should sanitize email to prevent XSS
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "<script>alert(\"XSS\")</script>@example.com",
    "password": "password123",
    "captchaToken": "test"
  }'
```
**Expected:** Should sanitize or reject

#### Test: Brute Force Attack
```bash
# Should rate limit after multiple failed attempts
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
**Expected:** Should implement rate limiting (currently not implemented)

#### Test: Account Enumeration
```bash
# Test if system reveals whether email exists
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "password123",
    "captchaToken": "test"
  }'
```
**Expected:** Should return generic error (not "Email tidak ditemukan")

### 2. OTP Security Tests

#### Test: OTP Brute Force
```bash
# Should limit OTP attempts
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
**Expected:** Should limit attempts or lock account

#### Test: OTP Replay Attack
```bash
# Should prevent reuse of consumed OTP
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456",
    "captchaToken": "test"
  }'
# Repeat same request
```
**Expected:** Should reject consumed OTP (currently handled ✅)

#### Test: OTP Rate Limiting
```bash
# Should limit OTP request frequency
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
**Expected:** Should implement rate limiting (currently not implemented)

### 3. Order Security Tests

#### Test: Invalid Order ID Format
```bash
# Should validate order ID format
curl http://localhost:3000/api/orders/../../../etc/passwd
```
**Expected:** Should validate format and reject invalid IDs

#### Test: Order ID Injection
```bash
# Should sanitize order ID
curl http://localhost:3000/api/orders/ord_123'; DROP TABLE orders; --
```
**Expected:** Should handle safely

#### Test: Unauthorized Order Access
```bash
# Should verify ownership (if implemented)
curl http://localhost:3000/api/orders/ord_another_users_order
```
**Expected:** Should verify ownership (currently not implemented)

#### Test: Negative Price
```bash
# Should validate order price
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
**Expected:** Should validate price > 0

### 4. Game Lookup Security Tests

#### Test: Invalid User ID
```bash
# Should validate user ID format
curl "http://localhost:3000/api/mlbb/lookup?userId=<script>alert('XSS')</script>&zoneId=1234"
```
**Expected:** Should sanitize and validate numeric input

#### Test: SQL Injection (User ID)
```bash
# Should handle safely
curl "http://localhost:3000/api/mlbb/lookup?userId=123456'; DROP TABLE orders; --&zoneId=1234"
```
**Expected:** Should validate format (numeric only)

#### Test: Extremely Long Input
```bash
# Should limit input length
curl "http://localhost:3000/api/mlbb/lookup?userId=$(python3 -c 'print("1"*10000)')&zoneId=1234"
```
**Expected:** Should enforce length limits

### 5. CAPTCHA Security Tests

#### Test: Missing CAPTCHA Token
```bash
# Should require CAPTCHA
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```
**Expected:** Should reject without CAPTCHA ✅ (implemented)

#### Test: Invalid CAPTCHA Token
```bash
# Should validate CAPTCHA
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "captchaToken": "invalid_token"
  }'
```
**Expected:** Should reject invalid CAPTCHA ✅ (implemented)

### 6. CORS Security Tests

#### Test: Cross-Origin Request
```javascript
// Test from browser console on different origin
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
**Expected:** Should configure CORS properly (currently allows all ✅)

### 7. File System Security Tests

#### Test: Path Traversal
```bash
# Should prevent directory traversal
curl http://localhost:3000/api/orders/../../../etc/passwd
```
**Expected:** Should validate order ID format

#### Test: JSON Injection
```bash
# Should prevent JSON injection in data files
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com}",
    "password": "password123",
    "captchaToken": "test"
  }'
```
**Expected:** Should handle JSON parsing safely

### 8. Information Disclosure Tests

#### Test: Error Message Information Leakage
```bash
# Should not reveal sensitive information
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "wrong",
    "captchaToken": "test"
  }'
```
**Expected:** Should return generic error (not reveal if email exists)

#### Test: Stack Trace Exposure
```bash
# Trigger internal error
curl http://localhost:3000/api/orders/invalid_id_that_causes_error
```
**Expected:** Should not expose stack traces in production

### 9. Session/Token Security Tests

#### Test: Token Predictability
```bash
# Get multiple tokens and check patterns
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
**Expected:** Tokens should be unpredictable (currently using timestamp ✅)

#### Test: Token Expiration
```bash
# Use old token and verify expiration
# (Requires token expiration implementation)
```
**Expected:** Tokens should expire after inactivity

## 🛠 Security Testing Tools

### Automated Scanning
```bash
# Install security tools
npm install --save-dev eslint-plugin-security

# Run security audit
npm audit

# Check for vulnerabilities
npm audit fix
```

### Manual Testing Checklist
1. **Authentication**
   - [ ] Test weak passwords
   - [ ] Test email validation
   - [ ] Test brute force protection
   - [ ] Test account lockout

2. **Authorization**
   - [ ] Test unauthorized access
   - [ ] Test privilege escalation
   - [ ] Test resource ownership

3. **Input Validation**
   - [ ] Test SQL injection
   - [ ] Test XSS attempts
   - [ ] Test command injection
   - [ ] Test path traversal

4. **Data Protection**
   - [ ] Verify password hashing
   - [ ] Check sensitive data exposure
   - [ ] Verify encryption in transit

5. **Error Handling**
   - [ ] Check error message leakage
   - [ ] Verify stack trace hiding
   - [ ] Check error logging

## 🚨 Known Security Issues

### Current Vulnerabilities

1. **❌ No Password Strength Validation**
   - **Risk:** Users can set weak passwords
   - **Impact:** Medium
   - **Recommendation:** Add minimum length and complexity requirements

2. **❌ No Email Format Validation**
   - **Risk:** Invalid emails can be stored
   - **Impact:** Low
   - **Recommendation:** Add email regex validation

3. **❌ No Rate Limiting**
   - **Risk:** Brute force attacks possible
   - **Impact:** High
   - **Recommendation:** Implement rate limiting middleware

4. **❌ Account Enumeration**
   - **Risk:** Attackers can discover valid emails
   - **Impact:** Medium
   - **Recommendation:** Return generic error messages

5. **❌ No Input Sanitization**
   - **Risk:** XSS and injection attacks
   - **Impact:** High
   - **Recommendation:** Sanitize all user inputs

6. **❌ CORS Too Permissive**
   - **Risk:** CSRF attacks
   - **Impact:** Medium
   - **Recommendation:** Configure specific origins

7. **❌ No Request Size Limits**
   - **Risk:** DoS via large payloads
   - **Impact:** Medium
   - **Recommendation:** Add body parser limits

8. **❌ No Order Ownership Verification**
   - **Risk:** Users can access other users' orders
   - **Impact:** High
   - **Recommendation:** Add ownership checks

## ✅ Security Best Practices Implemented

1. **✅ Password Hashing** - Using scrypt with salt
2. **✅ OTP Expiration** - 10 minute TTL
3. **✅ CAPTCHA Protection** - On sensitive endpoints
4. **✅ OTP One-Time Use** - Consumed after verification
5. **✅ CORS Enabled** - For cross-origin support
6. **✅ Error Handling** - Try-catch blocks
7. **✅ Input Validation** - Basic required field checks

## 📋 Priority Fixes

### High Priority
1. Implement rate limiting
2. Add input sanitization
3. Add password strength validation
4. Verify order ownership

### Medium Priority
1. Add email format validation
2. Generic error messages
3. CORS configuration
4. Request size limits

### Low Priority
1. Token expiration
2. Account lockout
3. Enhanced logging
4. Security headers

## 🔄 Continuous Security

- Run `npm audit` regularly
- Review dependencies for vulnerabilities
- Monitor error logs for suspicious activity
- Keep dependencies updated
- Regular security audits
- Penetration testing

---

**Note:** This document should be updated regularly as security improvements are made.
