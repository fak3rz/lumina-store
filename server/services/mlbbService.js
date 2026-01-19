const fetch = require('node-fetch');
const config = require('../config');

class MlbbService {
  async lookupUser(userId, zoneId) {
    if (!userId || !zoneId) {
      throw new Error('userId and zoneId required');
    }
    if (!config.mlbb.apiUrl) {
      throw new Error('MLBB lookup not configured on server. Set MLBB_API_URL in env.');
    }

    try {
      const url = new URL(config.mlbb.apiUrl);
      url.searchParams.set('userId', userId);
      url.searchParams.set('zoneId', zoneId);

      const headers = {};
      if (config.mlbb.apiKey) {
        headers[config.mlbb.apiKeyHeader] = config.mlbb.apiKey;
      }

      const upstream = await fetch(url.toString(), { headers });
      const ctype = upstream.headers.get('content-type') || '';
      
      if (!upstream.ok) {
        const text = await upstream.text();
        throw new Error(`Upstream returned ${upstream.status}: ${text}`);
      }

      if (ctype.includes('application/json')) {
        const j = await upstream.json();
        const nickname = this.extractNickname(j);
        if (nickname) return { ok: true, nickname };
        return { ok: true, raw: j };
      }

      const text = await upstream.text();
      return { ok: true, nickname: text };
    } catch (e) {
      console.error('Lookup error', e);
      throw e;
    }
  }

  extractNickname(j) {
    return j.nickname || j.nick || j.name || (j.data && (j.data.nickname || j.data.name));
  }
}

module.exports = new MlbbService();
