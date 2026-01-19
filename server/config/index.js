require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  mlbb: {
    apiUrl: process.env.MLBB_API_URL || '',
    apiKey: process.env.MLBB_API_KEY || '',
    apiKeyHeader: process.env.MLBB_API_KEY_HEADER || 'x-api-key'
  },
  apigames: {
    baseUrl: process.env.APIGAMES_BASE_URL || 'https://v2.apigames.id',
    merchantId: process.env.APIGAMES_MERCHANT_ID || '',
    secretKey: process.env.APIGAMES_SECRET_KEY || ''
  },
  captcha: {
    enabled: String(process.env.CAPTCHA_ENABLED || '').toLowerCase() === 'true',
    bypass: String(process.env.CAPTCHA_BYPASS || '').toLowerCase() === 'true',
    token: process.env.CAPTCHA_TOKEN || ''
  },
  recaptcha: {
    siteKey: process.env.RECAPTCHA_SITE_KEY || '',
    secret: process.env.RECAPTCHA_SECRET || ''
  }
};
