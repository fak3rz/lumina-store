const express = require('express');
const router = express.Router();

const gameController = require('../controllers/gameController');
const orderController = require('../controllers/orderController');
const paymentController = require('../controllers/paymentController');
const apiGamesController = require('../controllers/apiGamesController');
const authController = require('../controllers/authController');
const captchaController = require('../controllers/captchaController');
const { captchaGuard } = require('../middlewares/captcha');
const config = require('../config');

// MLBB
router.get('/mlbb/lookup', (req, res) => gameController.lookup(req, res));

// Games Catalog
const gamesData = require('../data/games.json');
router.get('/games', (req, res) => {
  res.json({ status: 1, data: gamesData });
});
router.get('/games/:categoryId', (req, res) => {
  const cat = gamesData.categories.find(c => c.id === req.params.categoryId);
  if (!cat) return res.status(404).json({ status: 0, message: 'Category not found' });
  res.json({ status: 1, data: cat });
});

// APIGames Integration
router.get('/apigames/account', (req, res) => apiGamesController.getAccountInfo(req, res));
router.get('/apigames/check-username', (req, res) => apiGamesController.checkUsername(req, res));

// Captcha
router.get('/captcha/new', (req, res) => captchaController.new(req, res));
router.get('/captcha/sitekey', (req, res) => captchaController.sitekey(req, res));

// Auth
router.post('/auth/register', captchaGuard, (req, res) => authController.register(req, res));
router.post('/auth/login', captchaGuard, (req, res) => authController.login(req, res));
router.post('/auth/request-login-otp', captchaGuard, (req, res) => authController.requestLoginOtp(req, res));
router.post('/auth/verify-login-otp', (req, res) => authController.verifyLoginOtp(req, res));
router.post('/auth/request-otp', captchaGuard, (req, res) => authController.requestOtp(req, res));
router.post('/auth/verify-otp', (req, res) => authController.verifyOtp(req, res));
router.post('/auth/reset-password', (req, res) => authController.resetPassword(req, res));

// Orders
router.post('/orders', captchaGuard, (req, res) => orderController.create(req, res));
router.get('/orders/:id', (req, res) => orderController.get(req, res));

// Mock Payment
router.get('/mock/pay', (req, res) => paymentController.mockPayPage(req, res));
router.post('/webhook/payment', (req, res) => paymentController.handleWebhook(req, res));

router.get('/health', (req, res) => {
  res.json({
    ok: true,
    timestamp: Date.now(),
    port: Number(config.port) || 3000,
    captcha: {
      enabled: !!config.captcha.enabled,
      bypass: !!config.captcha.bypass,
      recaptcha_sitekey_present: !!config.recaptcha.siteKey
    },
    endpoints: [
      'GET /api/health',
      'GET /api/captcha/sitekey',
      'GET /api/captcha/new',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'POST /api/auth/request-otp',
      'POST /api/auth/verify-otp',
      'POST /api/auth/reset-password',
      'GET /api/mlbb/lookup',
      'POST /api/orders',
      'GET /api/orders/:id',
      'GET /api/mock/pay',
      'POST /api/webhook/payment'
    ]
  });
});

module.exports = router;
