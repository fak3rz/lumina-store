const crypto = require('crypto');
const fetch = require('node-fetch');
const config = require('../config');

function generateSignature(merchantId, secretKey) {
  const data = `${merchantId}:${secretKey}`;
  return crypto.createHash('md5').update(data).digest('hex');
}

function candidateHosts(baseUrl) {
  const u = String(baseUrl || '').trim();
  const list = [];
  if (u) list.push(u.replace(/\/+$/, ''));
  if (u.includes('v2.apigames.id')) list.push('https://v1.apigames.id');
  else if (u.includes('v1.apigames.id')) list.push('https://v2.apigames.id');
  else { list.push('https://v2.apigames.id'); list.push('https://v1.apigames.id'); }
  return Array.from(new Set(list));
}

async function fetchFirstOk(urls, options = {}) {
  let lastErr;
  for (const url of urls) {
    try {
      const r = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, ...options });
      if (r.ok) return r;
      lastErr = new Error(`HTTP ${r.status} on ${url}`);
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('All APIGames endpoints failed');
}

async function getAccountInfo() {
  const merchantId = config.apigames.merchantId;
  const secretKey = config.apigames.secretKey;
  if (!merchantId || !secretKey) throw new Error('APIGames Merchant ID or Secret Key not configured');
  const signature = generateSignature(merchantId, secretKey);
  const hosts = candidateHosts(config.apigames.baseUrl);
  const urls = hosts.map(h => `${h}/merchant/${merchantId}?signature=${signature}`);
  const resp = await fetchFirstOk(urls);
  return await resp.json();
}

async function checkUsername(gameCode, userId, zoneId = '') {
  const merchantId = config.apigames.merchantId;
  const secretKey = config.apigames.secretKey;
  if (!merchantId || !secretKey) throw new Error('APIGames Merchant ID or Secret Key not configured');
  let finalUserId = userId;
  if (gameCode === 'mobilelegend' && zoneId) finalUserId = `${userId}${zoneId}`;
  const signature = generateSignature(merchantId, secretKey);
  const hosts = candidateHosts(config.apigames.baseUrl);
  const urls = hosts.map(h => `${h}/merchant/${merchantId}/cek-username/${gameCode}?user_id=${finalUserId}&signature=${signature}`);
  const resp = await fetchFirstOk(urls);
  return await resp.json();
}

const fs = require('fs');
const path = require('path');
const priceFallbackPath = path.join(__dirname, '../data/apigames_prices.json');

async function getPricelist() {
  const merchantId = config.apigames.merchantId;
  const secretKey = config.apigames.secretKey;

  // Try fetching from API first
  try {
    if (merchantId && secretKey) {
      const signature = generateSignature(merchantId, secretKey);
      // Try v2 endpoint then v1/others if needed (using candidateHosts logic or explicit v2)
      // Per plan, we try the likely v2 endpoint
      const hosts = candidateHosts(config.apigames.baseUrl);
      // Prioritize v2 for products
      const v2Hosts = hosts.filter(h => h.includes('v2'));
      const otherHosts = hosts.filter(h => !h.includes('v2'));
      const sortedHosts = [...v2Hosts, ...otherHosts];

      const urls = sortedHosts.map(h => `${h}/merchant/${merchantId}/produk?signature=${signature}`);

      const resp = await fetchFirstOk(urls);
      const json = await resp.json();

      if (json.status === 1 || json.rc === 200) {
        return { source: 'api', data: json.data };
      }
    }
  } catch (e) {
    console.warn('APIGames pricelist fetch failed, using fallback:', e.message);
  }

  // Fallback to local JSON
  try {
    if (fs.existsSync(priceFallbackPath)) {
      const data = fs.readFileSync(priceFallbackPath, 'utf8');
      return { source: 'fallback', data: JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to read fallback pricelist:', e.message);
  }

  return { source: 'none', data: [] };
}

module.exports = {
  getAccountInfo,
  checkUsername,
  getPricelist
};
