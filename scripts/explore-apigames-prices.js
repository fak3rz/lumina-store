const crypto = require('crypto');
const fetch = require('node-fetch');
require('dotenv').config();

const config = {
    apigames: {
        baseUrl: process.env.APIGAMES_BASE_URL || 'https://v2.apigames.id',
        merchantId: process.env.APIGAMES_MERCHANT_ID,
        secretKey: process.env.APIGAMES_SECRET_KEY
    }
};

function generateSignature(merchantId, secretKey) {
    const data = `${merchantId}:${secretKey}`;
    return crypto.createHash('md5').update(data).digest('hex');
}

const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, 'apigames_log.txt');

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

async function testEndpoint(endpointName, url) {
    log(`Testing ${endpointName}: ${url}`);
    try {
        const resp = await fetch(url);
        const text = await resp.text();
        log(`Status: ${resp.status}`);
        try {
            const json = JSON.parse(text);
            log(`Response JSON keys: ${Object.keys(json).join(', ')}`);
            if (json.data) log(`Data sample: ${JSON.stringify(json.data).substring(0, 200)}`);
            if (json.message) log(`Message: ${json.message}`);
            return json;
        } catch (e) {
            log(`Response (text): ${text.substring(0, 200)}`);
        }
    } catch (e) {
        log(`Error fetching ${url}: ${e.message}`);
    }
}

async function run() {
    fs.writeFileSync(logFile, ''); // Clear log
    const { merchantId, secretKey, baseUrl } = config.apigames;
    if (!merchantId || !secretKey) {
        log('Missing APIGAMES_MERCHANT_ID or APIGAMES_SECRET_KEY in .env');
        return;
    }

    // Force v2
    const forcedBaseUrl = 'https://v2.apigames.id';
    log(`Testing with Forced Base URL: ${forcedBaseUrl}`);

    // Candidate endpoints
    const candidates = [
        // Standard account info
        `${forcedBaseUrl}/merchant/${merchantId}?signature=${signature}`,
        // Possible product/price endpoints
        `${forcedBaseUrl}/merchant/${merchantId}/produk?signature=${signature}`,
        `${forcedBaseUrl}/v2/merchant/${merchantId}/produk?signature=${signature}`,
        `${forcedBaseUrl}/v2/merchant/${merchantId}/pricelist?signature=${signature}`
    ];

    for (const url of candidates) {
        await testEndpoint(url.split('?')[0].split('/').pop(), url);
        log('---');
    }
}

run();
