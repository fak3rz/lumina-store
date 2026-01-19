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
  if (u) list.push(u.replace(/\/+$/,''));
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

module.exports = {
  getAccountInfo,
  checkUsername
};
