const fetch = require('node-fetch');

async function test() {
    const url = 'http://localhost:3001/api/apigames/pricelist';
    console.log('Fetching:', url);
    try {
        const r = await fetch(url);
        const j = await r.json();
        console.log('Response Status:', r.status);
        console.log('Source:', j.source);
        console.log('Data keys:', Object.keys(j.data || {}));
        if (j.data && j.data.mobilelegend) {
            console.log('Sample Data (Mobile Legend):', j.data.mobilelegend[0]);
        } else {
            console.log('No mobilelegend data found in response.');
        }
    } catch (e) {
        console.error('Test failed:', e.message);
    }
}

test();
