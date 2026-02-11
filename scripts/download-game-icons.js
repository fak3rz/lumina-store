const https = require('https');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'legacy_static_site', 'assets', 'img', 'games');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// LapakGaming game slugs mapped to our game codes
const gameSlugs = {
  mobilelegend: 'mobile-legends',
  freefire: 'free-fire',
  genshin: 'genshin-impact',
  pubgm: 'pubg-mobile',
  codm: 'call-of-duty-mobile',
  lolwr: 'league-of-legends',
  aov: 'arena-of-valor',
  hok: 'honor-of-kings',
  honkaisr: 'honkai-star-rail',
  nikke: 'nikke',
  clash: 'clash-of-clans',
  clashroyale: 'clash-royale',
  brawlstars: 'brawl-stars',
  ragnarokm: 'ragnarok-m-eternal-love',
  zenless: 'zenless-zone-zero',
  valorant: 'valorant',
  steam: 'voucher-steam-wallet',
  roblox: 'roblox',
  minecraft: 'voucher-minecraft',
  fortnite: 'fortnite-v-bucks',
  gplay: 'voucher-google-play',
  garena: 'voucher-garena-shells',
  spotify: 'spotify',
};

function fetchPage(slug) {
  return new Promise((resolve, reject) => {
    const url = `https://www.lapakgaming.com/id-id/${slug}`;
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/*,*/*;q=0.8',
      },
      timeout: 15000
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        resolve(null);
        return;
      }
      let data = '';
      response.on('data', c => data += c);
      response.on('end', () => resolve(data));
    }).on('error', reject).on('timeout', function () { this.destroy(); reject(new Error('Timeout')); });
  });
}

function extractImageUrl(html) {
  // Look for og:image meta tag
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (ogMatch) return ogMatch[1];

  // Look for game image in JSON-LD
  const jsonLdMatch = html.match(/"image"\s*:\s*"([^"]+)"/);
  if (jsonLdMatch) return jsonLdMatch[1];

  return null;
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : require('http');
    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*,*/*',
        'Referer': 'https://www.lapakgaming.com/'
      },
      timeout: 15000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadImage(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', reject);
    }).on('error', reject).on('timeout', function () { this.destroy(); reject(new Error('Timeout')); });
  });
}

async function main() {
  let success = 0, fail = 0;
  const results = {};

  for (const [code, slug] of Object.entries(gameSlugs)) {
    try {
      console.log(`Fetching ${code} (${slug})...`);
      const html = await fetchPage(slug);
      if (!html) { console.log(`  SKIP: redirect`); fail++; continue; }

      const imgUrl = extractImageUrl(html);
      if (!imgUrl) { console.log(`  SKIP: no image found`); fail++; continue; }

      console.log(`  Found: ${imgUrl.substring(0, 80)}...`);
      results[code] = imgUrl;

      // Download the image
      const ext = imgUrl.match(/\.(jpg|jpeg|png|webp)/i)?.[1] || 'jpg';
      const dest = path.join(outDir, `${code}.${ext}`);
      await downloadImage(imgUrl, dest);
      const stat = fs.statSync(dest);
      console.log(`  OK: ${(stat.size / 1024).toFixed(0)}KB`);
      success++;

      // Small delay between requests
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.log(`  FAIL: ${e.message}`);
      fail++;
    }
  }

  console.log(`\nDone: ${success} success, ${fail} fail`);
  console.log('\nImage URLs found:');
  for (const [code, url] of Object.entries(results)) {
    console.log(`  ${code}: ${url}`);
  }
}

main();
