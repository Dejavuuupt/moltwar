import https from "https";
import fs from "fs";
import path from "path";

const ASSETS_JSON = path.join(process.cwd(), "public/data/assets.json");
const OUT_DIR = path.join(process.cwd(), "public/images/assets");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const assets = JSON.parse(fs.readFileSync(ASSETS_JSON, "utf-8"));
const sleep = ms => new Promise(r => setTimeout(r, ms));

function extractFilename(url) {
  // Extract the original filename from a Wikimedia URL
  // e.g. .../thumb/6/61/F-35A_flight_%28cropped%29.jpg/1280px-F-35A_flight_%28cropped%29.jpg
  // -> F-35A_flight_(cropped).jpg
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    // Find 'thumb' index, filename is 2 positions after
    const thumbIdx = parts.indexOf("thumb");
    if (thumbIdx >= 0 && thumbIdx + 3 < parts.length) {
      return decodeURIComponent(parts[thumbIdx + 3]); // The original filename
    }
    // If not a thumb URL, last segment
    return decodeURIComponent(parts[parts.length - 1]);
  } catch {
    return null;
  }
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": UA } }, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error("Invalid JSON")); }
      });
    }).on("error", reject);
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": UA } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        res.resume();
        return;
      }
      const ws = fs.createWriteStream(dest);
      res.pipe(ws);
      ws.on("finish", () => { ws.close(); resolve(res.statusCode); });
      ws.on("error", reject);
    }).on("error", reject);
  });
}

async function getCorrectUrl(wikiFilename) {
  // Use Wikimedia API to get the actual URL of the file
  const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(wikiFilename)}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json`;
  const data = await fetchJSON(apiUrl);
  const pages = data?.query?.pages || {};
  for (const page of Object.values(pages)) {
    if (page.imageinfo && page.imageinfo[0]) {
      // Prefer the thumbnail at 800px width if available
      return page.imageinfo[0].thumburl || page.imageinfo[0].url;
    }
  }
  return null;
}

async function main() {
  let success = 0, failed = 0;

  for (const asset of assets) {
    if (!asset.image_url) {
      console.log(`SKIP ${asset.id} - no image_url`);
      continue;
    }

    const ext = asset.image_url.match(/\.(jpg|jpeg|png|gif|svg|webp)/i)?.[1] || "jpg";
    const localFile = `${asset.id}.${ext.toLowerCase()}`;
    const dest = path.join(OUT_DIR, localFile);

    // Skip if already downloaded (and is a real image, > 500 bytes)
    if (fs.existsSync(dest) && fs.statSync(dest).size > 500) {
      console.log(`EXISTS ${asset.id} (${fs.statSync(dest).size} bytes)`);
      success++;
      continue;
    }

    const wikiFilename = extractFilename(asset.image_url);
    if (!wikiFilename) {
      console.log(`FAIL  ${asset.id} - could not parse filename`);
      failed++;
      continue;
    }

    console.log(`FETCH ${asset.id} => File:${wikiFilename}`);
    
    try {
      // First get the correct URL from the API
      const correctUrl = await getCorrectUrl(wikiFilename);
      if (!correctUrl) {
        console.log(`FAIL  ${asset.id} - API returned no URL`);
        failed++;
        await sleep(1000);
        continue;
      }

      console.log(`  URL: ${correctUrl.substring(0, 80)}...`);
      await download(correctUrl, dest);

      const size = fs.statSync(dest).size;
      if (size < 500) {
        console.log(`FAIL  ${asset.id} - file too small (${size} bytes)`);
        fs.unlinkSync(dest);
        failed++;
      } else {
        console.log(`OK    ${asset.id} (${size} bytes)`);
        success++;
      }
    } catch (err) {
      console.log(`FAIL  ${asset.id} - ${err.message}`);
      failed++;
    }

    // Delay between requests to avoid rate limiting
    await sleep(2000);
  }

  console.log(`\nDone: ${success} success, ${failed} failed out of ${assets.length}`);
}

main();
