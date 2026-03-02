import { writeFileSync, mkdirSync, existsSync } from 'fs';
import https from 'https';
import path from 'path';

const dir = 'public/images/actors';
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

// Country flags from flagcdn.com (reliable, free)
const imgs = {
  'united-states': 'https://flagcdn.com/w320/us.png',
  'iran': 'https://flagcdn.com/w320/ir.png',
  'israel': 'https://flagcdn.com/w320/il.png',
  'saudi-arabia': 'https://flagcdn.com/w320/sa.png',
  'uae-forces': 'https://flagcdn.com/w320/ae.png',
  'hezbollah-flag': 'https://flagcdn.com/w320/lb.png',
  'houthis-flag': 'https://flagcdn.com/w320/ye.png',
  'pmf-flag': 'https://flagcdn.com/w320/iq.png',
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function download(id, url) {
  return new Promise((resolve) => {
    const fp = path.join(dir, id + '.png');
    const opts = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/png,image/*',
      }
    };
    https.get(url, opts, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const loc = res.headers.location;
        https.get(loc.startsWith('http') ? loc : `https://flagcdn.com${loc}`, opts, (r2) => {
          const chunks = [];
          r2.on('data', c => chunks.push(c));
          r2.on('end', () => {
            const buf = Buffer.concat(chunks);
            writeFileSync(fp, buf);
            console.log(`OK: ${id} (${buf.length} bytes) [redirect]`);
            resolve(true);
          });
        }).on('error', e => { console.log(`FAIL redirect: ${id} - ${e.message}`); resolve(false); });
        return;
      }
      if (res.statusCode !== 200) {
        console.log(`FAIL: ${id} - HTTP ${res.statusCode}`);
        resolve(false);
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        writeFileSync(fp, buf);
        console.log(`OK: ${id} (${buf.length} bytes)`);
        resolve(true);
      });
    }).on('error', e => { console.log(`FAIL: ${id} - ${e.message}`); resolve(false); });
  });
}

const entries = Object.entries(imgs);
let ok = 0;
for (const [id, url] of entries) {
  const result = await download(id, url);
  if (result) ok++;
  await sleep(500);
}
console.log(`\nDone! ${ok}/${entries.length} images downloaded`);


