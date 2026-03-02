import https from "https";
import fs from "fs";
import path from "path";

const OUT_DIR = path.join(process.cwd(), "public/images/assets");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Manual mapping: asset id -> Commons search term + known filename
const SEARCH_MAP = {
  "f35-lightning":        { search: "F-35A Lightning II flight", file: "F-35A_flight_(cropped).jpg" },
  "f22-raptor":           { search: "F-22 Raptor", file: "Lockheed_Martin_F-22A_Raptor_JSOH.jpg" },
  "b2-spirit":            { search: "B-2 Spirit stealth bomber", file: "B-2_Spirit_(cropped).jpg" },
  "mq9-reaper":           { search: "MQ-9 Reaper drone", file: "MQ-9_Reaper_-_090609-F-0000M-777.JPG" },
  "nimitz-cvn":           { search: "USS Eisenhower aircraft carrier CVN-69" },
  "ford-cvn":             { search: "USS Gerald Ford CVN-78 aircraft carrier" },
  "arleigh-burke-ddg":    { search: "USS Arleigh Burke DDG-51 destroyer" },
  "thaad":                { search: "THAAD missile defense interceptor", file: "The_first_of_two_Terminal_High_Altitude_Area_Defense_(THAAD)_interceptors_is_launched_during_a_successful_intercept_test_-_US_Army.jpg" },
  "fattah-2-hgv":         { search: "Fattah missile Iran hypersonic" },
  "shahab-3":             { search: "Shahab-3 missile Iran", file: "Shahab-3_Range.jpg" },
  "fateh-110":            { search: "Fateh-110 missile Iran" },
  "shahed-136":           { search: "Shahed 136 drone Iran" },
  "s300-bavar":           { search: "S-300 missile system" },
  "iron-dome":            { search: "Iron Dome launcher Israel" },
  "fast-attack-craft":    { search: "IRGC fast attack boat navy" },
  "houthi-ascm":          { search: "anti-ship ballistic missile Iran Khalij Fars" },
  "fa18-super-hornet":    { search: "F/A-18 Super Hornet", file: "FA-18_Hornet_VFA-41.jpg" },
  "b1b-lancer":           { search: "B-1B Lancer bomber", file: "B-1B_over_the_pacific_ocean.jpg" },
  "ea18g-growler":        { search: "EA-18G Growler electronic warfare aircraft" },
  "ac130j-ghostrider":    { search: "AC-130 gunship Ghostrider" },
  "f35i-adir":            { search: "F-35I Adir Israel" },
  "tomahawk-cruise-missile": { search: "Tomahawk cruise missile launch", file: "Tomahawk_Block_IV_cruise_missile.jpg" },
  "agm88g-aargm-er":      { search: "AGM-88 HARM missile" },
  "patriot-pac3":         { search: "Patriot missile system PAC-3", file: "Patriot_System_2.jpg" },
  "arrow-3":              { search: "Arrow missile defense Israel", file: "Arrow_anti-ballistic_missile_launch.jpg" },
  "sejjil-2":             { search: "Sejjil missile Iran" },
  "noor-ascm":            { search: "Noor missile Iran anti-ship" },
  "naval-mines-iran":     { search: "naval mine sweeping exercise" },
  "hezbollah-rockets":    { search: "Fajr-5 rocket", file: "Fajr-5.jpg" },
  "bayraktar-tb2":        { search: "Bayraktar TB2 drone" },
  "virginia-class-ssn":   { search: "Virginia class submarine SSN" },
  "kilo-class-sub":       { search: "Kilo class submarine", file: "Submarine_Kilo_class.jpg" },
  "p8a-poseidon":         { search: "P-8A Poseidon maritime patrol" },
};

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": UA } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJSON(res.headers.location).then(resolve).catch(reject);
      }
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error("Invalid JSON: " + data.substring(0, 200))); }
      });
    });
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

function download(url, dest, maxRedirects = 5) {
  if (maxRedirects <= 0) return Promise.reject(new Error("Too many redirects"));
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": UA } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return download(res.headers.location, dest, maxRedirects - 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const ws = fs.createWriteStream(dest);
      res.pipe(ws);
      ws.on("finish", () => { ws.close(); resolve(res.statusCode); });
      ws.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error("Download timeout")); });
  });
}

async function searchCommons(query) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=5&format=json`;
  const data = await fetchJSON(apiUrl);
  const results = data?.query?.search || [];
  
  // Filter for image files
  for (const r of results) {
    const title = r.title; // e.g. "File:Something.jpg"
    if (/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(title)) {
      return title;
    }
  }
  return null;
}

async function getImageUrl(fileTitle) {
  // fileTitle like "File:Something.jpg"
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json`;
  const data = await fetchJSON(apiUrl);
  const pages = data?.query?.pages || {};
  for (const page of Object.values(pages)) {
    if (page.imageinfo && page.imageinfo[0]) {
      return page.imageinfo[0].thumburl || page.imageinfo[0].url;
    }
  }
  return null;
}

async function main() {
  let success = 0, failed = 0;
  const ids = Object.keys(SEARCH_MAP);

  for (const id of ids) {
    const dest = path.join(OUT_DIR, `${id}.jpg`);
    
    // Skip if already downloaded and valid
    if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) {
      console.log(`EXISTS ${id} (${fs.statSync(dest).size} bytes)`);
      success++;
      continue;
    }

    // Delete bad files
    if (fs.existsSync(dest)) {
      fs.unlinkSync(dest);
    }

    const entry = SEARCH_MAP[id];
    let downloadUrl = null;

    // Method 1: If we have a known filename, try to get it from the API
    if (entry.file) {
      console.log(`API   ${id} => File:${entry.file}`);
      try {
        downloadUrl = await getImageUrl(`File:${entry.file}`);
      } catch (e) {
        console.log(`  API error: ${e.message}`);
      }
      await sleep(500);
    }

    // Method 2: Search Commons
    if (!downloadUrl) {
      console.log(`SRCH  ${id} => "${entry.search}"`);
      try {
        const fileTitle = await searchCommons(entry.search);
        if (fileTitle) {
          console.log(`  Found: ${fileTitle}`);
          downloadUrl = await getImageUrl(fileTitle);
        } else {
          console.log(`  No search results`);
        }
      } catch (e) {
        console.log(`  Search error: ${e.message}`);
      }
      await sleep(500);
    }

    if (!downloadUrl) {
      console.log(`FAIL  ${id} - no URL found`);
      failed++;
      await sleep(1000);
      continue;
    }

    // Download
    console.log(`DL    ${id} => ${downloadUrl.substring(0, 80)}...`);
    try {
      await download(downloadUrl, dest);
      const size = fs.statSync(dest).size;
      if (size < 2000) {
        console.log(`FAIL  ${id} - file too small (${size} bytes)`);
        fs.unlinkSync(dest);
        failed++;
      } else {
        console.log(`OK    ${id} (${(size / 1024).toFixed(0)} KB)`);
        success++;
      }
    } catch (e) {
      console.log(`FAIL  ${id} - ${e.message}`);
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      failed++;
    }

    await sleep(2000);
  }

  console.log(`\nDone: ${success} success, ${failed} failed out of ${ids.length}`);
  
  // List remaining failures
  const missing = ids.filter(id => {
    const dest = path.join(OUT_DIR, `${id}.jpg`);
    return !fs.existsSync(dest) || fs.statSync(dest).size < 2000;
  });
  if (missing.length > 0) {
    console.log("Missing:", missing.join(", "));
  }
}

main();
