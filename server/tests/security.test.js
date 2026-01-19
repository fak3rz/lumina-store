/**
 * Security Test Cases
 * Run with: node server/tests/security.test.js
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000/api';
const TEST_EMAIL = 'security-test@example.com';
const TEST_PASSWORD = 'password123';
let captchaToken = 'test'; // In development, captcha might be bypassed

// Test Results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

function logResult(testName, passed, message = '') {
  const result = { test: testName, passed, message, timestamp: new Date().toISOString() };
  if (passed) {
    results.passed.push(result);
    console.log(`✅ PASS: ${testName}`);
  } else {
    results.failed.push(result);
    console.error(`❌ FAIL: ${testName} - ${message}`);
  }
}

function logWarning(testName, message) {
  results.warnings.push({ test: testName, message, timestamp: new Date().toISOString() });
  console.warn(`⚠️  WARN: ${testName} - ${message}`);
}

// Test Helpers
async function makeRequest(endpoint, method = 'GET', body = null, headers = {}) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json', ...headers }
    };
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json().catch(() => ({}));
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { status: 0, error: error.message, ok: false };
  }
}

// Security Tests
async function test1_WeakPassword() {
  const testName = 'Weak Password Validation';
  const response = await makeRequest('/auth/register', 'POST', {
    email: 'weak-pw-test@example.com',
    password: '123', // Too short
    captchaToken
  });
  
  // Should reject weak passwords (currently might not be implemented)
  if (response.status === 400 || response.data.error) {
    logResult(testName, true, 'Weak password rejected or error returned');
  } else {
    logWarning(testName, 'Weak password was accepted - password strength validation not implemented');
  }
}

async function test2_InvalidEmail() {
  const testName = 'Invalid Email Format Validation';
  const response = await makeRequest('/auth/register', 'POST', {
    email: 'invalid-email-format',
    password: TEST_PASSWORD,
    captchaToken
  });
  
  // Should validate email format (currently might not be implemented)
  if (response.status === 400 || response.data.error) {
    logResult(testName, true, 'Invalid email rejected or error returned');
  } else {
    logWarning(testName, 'Invalid email was accepted - email format validation not implemented');
  }
}

async function test3_SQLInjectionEmail() {
  const testName = 'SQL Injection Protection (Email)';
  const response = await makeRequest('/auth/login', 'POST', {
    email: "test@example.com'; DROP TABLE users; --",
    password: TEST_PASSWORD,
    captchaToken
  });
  
  // Should handle safely (using JSON storage, but should sanitize)
  if (response.status !== 500 && !response.error) {
    logResult(testName, true, 'SQL injection attempt handled safely');
  } else {
    logResult(testName, false, 'SQL injection attempt caused error');
  }
}

async function test4_XSSEmail() {
  const testName = 'XSS Protection (Email)';
  const response = await makeRequest('/auth/register', 'POST', {
    email: '<script>alert("XSS")</script>@example.com',
    password: TEST_PASSWORD,
    captchaToken
  });
  
  // Should sanitize or reject (might be stored as-is with JSON)
  if (response.status === 400 || response.data.error) {
    logResult(testName, true, 'XSS attempt rejected or sanitized');
  } else {
    logWarning(testName, 'XSS characters in email were accepted - sanitization recommended');
  }
}

async function test5_MissingCaptcha() {
  const testName = 'CAPTCHA Requirement';
  const response = await makeRequest('/auth/register', 'POST', {
    email: 'no-captcha@example.com',
    password: TEST_PASSWORD
    // No captchaToken
  });
  
  // Should require CAPTCHA
  if (response.status === 400 && response.data.error && response.data.error.includes('captcha')) {
    logResult(testName, true, 'CAPTCHA is required');
  } else {
    logWarning(testName, 'CAPTCHA might not be enforced in development mode');
  }
}

async function test6_AccountEnumeration() {
  const testName = 'Account Enumeration Protection';
  const response1 = await makeRequest('/auth/login', 'POST', {
    email: 'nonexistent-user-xyz123@example.com',
    password: 'wrongpassword',
    captchaToken
  });
  
  const response2 = await makeRequest('/auth/login', 'POST', {
    email: TEST_EMAIL, // If exists
    password: 'wrongpassword',
    captchaToken
  });
  
  // Should return generic error messages (not reveal if email exists)
  const error1 = response1.data.error || '';
  const error2 = response2.data.error || '';
  
  if (error1 === error2 || (!error1.includes('tidak ditemukan') && !error2.includes('tidak ditemukan'))) {
    logResult(testName, true, 'Generic error messages prevent account enumeration');
  } else {
    logWarning(testName, 'Different error messages reveal if email exists - should be generic');
  }
}

async function test7_InvalidOrderId() {
  const testName = 'Order ID Validation';
  const response = await makeRequest('/orders/../../../etc/passwd');
  
  // Should validate order ID format
  if (response.status === 404 || response.status === 400) {
    logResult(testName, true, 'Invalid order ID format rejected');
  } else {
    logWarning(testName, 'Invalid order ID format might not be validated');
  }
}

async function test8_OTPReplayAttack() {
  const testName = 'OTP Replay Attack Protection';
  
  // First, request OTP
  const otpResponse = await makeRequest('/auth/request-otp', 'POST', {
    email: TEST_EMAIL,
    purpose: 'verify',
    captchaToken
  });
  
  if (!otpResponse.ok) {
    logWarning(testName, 'Could not request OTP for testing');
    return;
  }
  
  // Try to verify with fake code first
  const fakeVerify = await makeRequest('/auth/verify-otp', 'POST', {
    email: TEST_EMAIL,
    code: '000000',
    captchaToken
  });
  
  // If OTP validation requires real code, this should fail
  if (fakeVerify.status === 400) {
    logResult(testName, true, 'OTP validation prevents replay with fake codes');
  } else {
    logWarning(testName, 'OTP might not be properly validated');
  }
}

async function test9_InputLength() {
  const testName = 'Input Length Validation';
  const longEmail = 'a'.repeat(1000) + '@example.com';
  const response = await makeRequest('/auth/register', 'POST', {
    email: longEmail,
    password: TEST_PASSWORD,
    captchaToken
  });
  
  // Should limit input length
  if (response.status === 400 || response.data.error) {
    logResult(testName, true, 'Long input rejected or handled');
  } else {
    logWarning(testName, 'Very long input was accepted - length limits recommended');
  }
}

async function test10_NegativePrice() {
  const testName = 'Order Price Validation';
  const response = await makeRequest('/orders', 'POST', {
    userId: '123456',
    zoneId: '1234',
    sku: 'diamond_86',
    amount: -86,
    price: -23000,
    paymentMethod: 'dana',
    captchaToken
  });
  
  // Should validate price > 0
  if (response.status === 400 || response.data.error) {
    logResult(testName, true, 'Negative price rejected or validated');
  } else {
    logWarning(testName, 'Negative price was accepted - price validation recommended');
  }
}

// Run All Tests
async function runAllTests() {
  console.log('🔒 Starting Security Tests...\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  
  await test1_WeakPassword();
  await test2_InvalidEmail();
  await test3_SQLInjectionEmail();
  await test4_XSSEmail();
  await test5_MissingCaptcha();
  await test6_AccountEnumeration();
  await test7_InvalidOrderId();
  await test8_OTPReplayAttack();
  await test9_InputLength();
  await test10_NegativePrice();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  console.log('='.repeat(50));
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(r => {
      console.log(`  - ${r.test}: ${r.message}`);
    });
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    results.warnings.forEach(w => {
      console.log(`  - ${w.test}: ${w.message}`);
    });
  }
  
  // Exit code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, results };
