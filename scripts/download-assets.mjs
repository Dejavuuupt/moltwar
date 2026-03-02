import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "images", "assets");
fs.mkdirSync(outDir, { recursive: true });

// All 32 assets - using reliable Wikimedia Commons thumb URLs
const assets = [
  // Original 16
  { id: "f35-lightning", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/F-35A_flight_%28cropped%29.jpg/640px-F-35A_flight_%28cropped%29.jpg" },
  { id: "f22-raptor", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Lockheed_Martin_F-22A_Raptor_JSOH.jpg/640px-Lockheed_Martin_F-22A_Raptor_JSOH.jpg" },
  { id: "b2-spirit", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/B-2_Spirit_%28cropped%29.jpg/640px-B-2_Spirit_%28cropped%29.jpg" },
  { id: "mq9-reaper", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/MQ-9_Reaper_-_090609-F-0000M-777.JPG/640px-MQ-9_Reaper_-_090609-F-0000M-777.JPG" },
  { id: "nimitz-cvn", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/USS_Dwight_D._Eisenhower_%28CVN-69%29_underway_in_the_Mediterranean_Sea_on_10_November_2023_%28231110-N-TH560-1209%29_%28cropped%29.jpg/640px-USS_Dwight_D._Eisenhower_%28CVN-69%29_underway_in_the_Mediterranean_Sea_on_10_November_2023_%28231110-N-TH560-1209%29_%28cropped%29.jpg" },
  { id: "ford-cvn", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/USS_Gerald_R._Ford_%28CVN-78%29_underway_on_8_June_2017.jpg/640px-USS_Gerald_R._Ford_%28CVN-78%29_underway_on_8_June_2017.jpg" },
  { id: "arleigh-burke-ddg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/USS_Arleigh_Burke_%28DDG-51%29_underway_in_the_Mediterranean_Sea_in_March_2003.jpg/640px-USS_Arleigh_Burke_%28DDG-51%29_underway_in_the_Mediterranean_Sea_in_March_2003.jpg" },
  { id: "thaad", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/The_first_of_two_Terminal_High_Altitude_Area_Defense_%28THAAD%29_interceptors_is_launched_during_a_successful_intercept_test_-_US_Army.jpg/640px-The_first_of_two_Terminal_High_Altitude_Area_Defense_%28THAAD%29_interceptors_is_launched_during_a_successful_intercept_test_-_US_Army.jpg" },
  { id: "fattah-2-hgv", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Fattah_missile_%28cropped%29.jpg/640px-Fattah_missile_%28cropped%29.jpg" },
  { id: "shahab-3", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Shahab-3_Range.jpg/640px-Shahab-3_Range.jpg" },
  { id: "fateh-110", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Fateh-110_by_tasnimnews.jpg/640px-Fateh-110_by_tasnimnews.jpg" },
  { id: "shahed-136", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Iranian_Shahed_136_drone.jpg/640px-Iranian_Shahed_136_drone.jpg" },
  { id: "s300-bavar", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/S-300_-_2009_Moscow_Victory_Day_Parade.jpg/640px-S-300_-_2009_Moscow_Victory_Day_Parade.jpg" },
  { id: "iron-dome", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Flickr_-_Israel_Defense_Forces_-_Iron_Dome_Launcher.jpg/640px-Flickr_-_Israel_Defense_Forces_-_Iron_Dome_Launcher.jpg" },
  { id: "fast-attack-craft", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/IRGCN_Bladerunner.jpg/640px-IRGCN_Bladerunner.jpg" },
  { id: "houthi-ascm", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Khalij-e_Fars_anti-ship_ballistic_missile.jpg/640px-Khalij-e_Fars_anti-ship_ballistic_missile.jpg" },
  // New 16
  { id: "fa18-super-hornet", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/FA-18_Hornet_VFA-41.jpg/640px-FA-18_Hornet_VFA-41.jpg" },
  { id: "b1b-lancer", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/B-1B_over_the_pacific_ocean.jpg/640px-B-1B_over_the_pacific_ocean.jpg" },
  { id: "ea18g-growler", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/EA-18G_Growler_of_VAQ-132.jpg/640px-EA-18G_Growler_of_VAQ-132.jpg" },
  { id: "ac130j-ghostrider", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/AC-130J_Ghostrider.jpg/640px-AC-130J_Ghostrider.jpg" },
  { id: "f35i-adir", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Israeli_F-35I_%22Adir%22_%2827786100089%29.jpg/640px-Israeli_F-35I_%22Adir%22_%2827786100089%29.jpg" },
  { id: "tomahawk-cruise-missile", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Tomahawk_Block_IV_cruise_missile.jpg/640px-Tomahawk_Block_IV_cruise_missile.jpg" },
  { id: "agm88g-aargm-er", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/AGM-88_HARM_on_F-16.jpg/640px-AGM-88_HARM_on_F-16.jpg" },
  { id: "patriot-pac3", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Patriot_System_2.jpg/640px-Patriot_System_2.jpg" },
  { id: "arrow-3", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Arrow_anti-ballistic_missile_launch.jpg/640px-Arrow_anti-ballistic_missile_launch.jpg" },
  { id: "sejjil-2", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Sejjil_Missile_in_a_military_parade_%28cropped%29.jpg/640px-Sejjil_Missile_in_a_military_parade_%28cropped%29.jpg" },
  { id: "noor-ascm", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Noor_Missile.jpg/640px-Noor_Missile.jpg" },
  { id: "naval-mines-iran", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/US_Navy_040712-N-0780F-003_A_dummy_mine_is_used_in_a_mine_sweeping_exercise.jpg/640px-US_Navy_040712-N-0780F-003_A_dummy_mine_is_used_in_a_mine_sweeping_exercise.jpg" },
  { id: "hezbollah-rockets", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Fajr-5.jpg/640px-Fajr-5.jpg" },
  { id: "bayraktar-tb2", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Bayraktar_TB2_at_T%C3%BCrkiye%27s_100th_Anniversary_Celebration.jpg/640px-Bayraktar_TB2_at_T%C3%BCrkiye%27s_100th_Anniversary_Celebration.jpg" },
  { id: "virginia-class-ssn", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/USS_Virginia_%28SSN-774%29.jpg/640px-USS_Virginia_%28SSN-774%29.jpg" },
  { id: "kilo-class-sub", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Submarine_Kilo_class.jpg/640px-Submarine_Kilo_class.jpg" },
  { id: "p8a-poseidon", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/P-8A_Poseidon_arrival_%28cropped%29.jpg/640px-P-8A_Poseidon_arrival_%28cropped%29.jpg" },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const req = proto.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        res.resume();
        return;
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on("finish", () => { stream.close(); resolve(); });
      stream.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

async function main() {
  let success = 0, fail = 0;
  for (const asset of assets) {
    const ext = ".jpg";
    const dest = path.join(outDir, `${asset.id}${ext}`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`✓ SKIP ${asset.id} (exists, ${fs.statSync(dest).size} bytes)`);
      success++;
      continue;
    }
    try {
      console.log(`↓ Downloading ${asset.id}...`);
      await download(asset.url, dest);
      const size = fs.statSync(dest).size;
      if (size < 500) {
        console.log(`✗ ${asset.id} — too small (${size} bytes), likely error page`);
        fs.unlinkSync(dest);
        fail++;
      } else {
        console.log(`✓ ${asset.id} — ${size} bytes`);
        success++;
      }
    } catch (err) {
      console.log(`✗ ${asset.id} — ${err.message}`);
      fail++;
    }
    await new Promise(r => setTimeout(r, 600));
  }
  console.log(`\nDone: ${success} success, ${fail} failed out of ${assets.length}`);
}

main();
