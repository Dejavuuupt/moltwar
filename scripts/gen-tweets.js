const sharp = require("sharp");
const path = require("path");

const W = 1200, H = 675;
const EMERALD = "#10b981";
const RED = "#ef4444";
const ZINC = "#a1a1aa";

async function loadLogo(size = 280) {
  return sharp(path.join(__dirname, "../public/logomoltwar.jpg"))
    .resize(size, size)
    .png()
    .toBuffer();
}

async function roundImage(buf, size, radius) {
  return sharp(buf)
    .composite([{
      input: Buffer.from(
        `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="white"/></svg>`
      ),
      blend: "dest-in"
    }])
    .png()
    .toBuffer();
}

function baseSvg(W, H, { accent = EMERALD, extraDefs = "", content = "", topBar = "", bottomLeft = "", bottomRight = "", accentOpacity = 0.08 } = {}) {
  const scanlines = Array.from({ length: Math.floor(H / 3) }, (_, i) =>
    `<rect x="0" y="${i * 3}" width="${W}" height="1" fill="rgba(0,0,0,0.12)"/>`
  ).join("\n");

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0a0a0c"/>
        <stop offset="40%" stop-color="#0f1117"/>
        <stop offset="100%" stop-color="#0c1a12"/>
      </linearGradient>
      <radialGradient id="glow1" cx="0.15" cy="0.3" r="0.5">
        <stop offset="0%" stop-color="${accent}" stop-opacity="${accentOpacity}"/>
        <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glow2" cx="0.85" cy="0.7" r="0.5">
        <stop offset="0%" stop-color="${RED}" stop-opacity="0.06"/>
        <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.025)" stroke-width="0.5"/>
      </pattern>
      <linearGradient id="line-fade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0"/>
        <stop offset="20%" stop-color="${accent}" stop-opacity="0.4"/>
        <stop offset="80%" stop-color="${accent}" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="line-fade-red" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${RED}" stop-opacity="0"/>
        <stop offset="30%" stop-color="${RED}" stop-opacity="0.15"/>
        <stop offset="70%" stop-color="${RED}" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="${RED}" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="border-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.3"/>
        <stop offset="50%" stop-color="${accent}" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="${RED}" stop-opacity="0.2"/>
      </linearGradient>
      ${extraDefs}
    </defs>

    <!-- Base -->
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#grid)"/>
    <rect width="${W}" height="${H}" fill="url(#glow1)"/>
    <rect width="${W}" height="${H}" fill="url(#glow2)"/>

    <!-- Accent lines -->
    <rect x="0" y="80" width="${W}" height="1" fill="url(#line-fade-red)" opacity="0.4"/>
    <rect x="0" y="174" width="${W}" height="1" fill="url(#line-fade)" opacity="0.2"/>
    <rect x="0" y="${H - 100}" width="${W}" height="1" fill="url(#line-fade)" opacity="0.15"/>

    <!-- Corner brackets -->
    <path d="M 30 30 L 30 60" stroke="${accent}" stroke-width="1.5" opacity="0.5" fill="none"/>
    <path d="M 30 30 L 60 30" stroke="${accent}" stroke-width="1.5" opacity="0.5" fill="none"/>
    <path d="M ${W - 30} 30 L ${W - 30} 60" stroke="${accent}" stroke-width="1.5" opacity="0.5" fill="none"/>
    <path d="M ${W - 30} 30 L ${W - 60} 30" stroke="${accent}" stroke-width="1.5" opacity="0.5" fill="none"/>
    <path d="M 30 ${H - 30} L 30 ${H - 60}" stroke="${RED}" stroke-width="1.5" opacity="0.4" fill="none"/>
    <path d="M 30 ${H - 30} L 60 ${H - 30}" stroke="${RED}" stroke-width="1.5" opacity="0.4" fill="none"/>
    <path d="M ${W - 30} ${H - 30} L ${W - 30} ${H - 60}" stroke="${RED}" stroke-width="1.5" opacity="0.4" fill="none"/>
    <path d="M ${W - 30} ${H - 30} L ${W - 60} ${H - 30}" stroke="${RED}" stroke-width="1.5" opacity="0.4" fill="none"/>

    <!-- Border -->
    <rect x="20" y="20" width="${W - 40}" height="${H - 40}" rx="4" fill="none" stroke="url(#border-grad)" stroke-width="1"/>

    <!-- Scanlines -->
    ${scanlines}

    <!-- Top bar -->
    ${topBar}

    <!-- Content -->
    ${content}

    <!-- Bottom left -->
    ${bottomLeft}

    <!-- Bottom right -->
    ${bottomRight}
  </svg>`;
}

function glowRing(size, radius = 30) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="${size - 4}" height="${size - 4}" rx="${radius}" fill="none" stroke="${EMERALD}" stroke-width="2" opacity="0.35"/>
      <rect x="6" y="6" width="${size - 12}" height="${size - 12}" rx="${radius - 4}" fill="none" stroke="rgba(16,185,129,0.08)" stroke-width="1"/>
    </svg>`
  );
}

// ─── TWEET 1: TEASER ────────────────────────────────────────
async function genTweet1() {
  const logo = await loadLogo(260);
  const logoRounded = await roundImage(logo, 260, 24);

  const topBar = `
    <rect x="${W / 2 - 100}" y="35" width="200" height="22" rx="3" fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.3)" stroke-width="0.5"/>
    <text x="${W / 2}" y="50" font-family="monospace" font-size="9" fill="${RED}" text-anchor="middle" letter-spacing="4" font-weight="700">CLASSIFIED</text>
  `;

  const content = `
    <!-- Centered logo group -->
    <text x="${W / 2}" y="400" font-family="monospace" font-size="14" fill="${EMERALD}" text-anchor="middle" letter-spacing="6" opacity="0.7">INCOMING TRANSMISSION</text>

    <!-- Big question -->
    <text x="${W / 2}" y="460" font-family="system-ui, -apple-system, sans-serif" font-size="38" fill="#f4f4f5" text-anchor="middle" font-weight="700" letter-spacing="3">SOMETHING IS COMING</text>

    <!-- Divider -->
    <rect x="${W / 2 - 120}" y="480" width="240" height="1" fill="${EMERALD}" opacity="0.3"/>

    <!-- Subtitle -->
    <text x="${W / 2}" y="510" font-family="monospace" font-size="12" fill="#71717a" text-anchor="middle" letter-spacing="2">INTELLIGENCE BEYOND THE FOG OF WAR</text>
  `;

  const bottomLeft = `
    <circle cx="55" cy="${H - 50}" r="4" fill="${RED}"/>
    <circle cx="55" cy="${H - 50}" r="7" fill="none" stroke="${RED}" stroke-width="0.5" opacity="0.4"/>
    <text x="70" y="${H - 46}" font-family="monospace" font-size="10" fill="${RED}" opacity="0.7" letter-spacing="2">SIGNAL DETECTED</text>
  `;

  const bottomRight = `
    <text x="${W - 60}" y="${H - 46}" font-family="monospace" font-size="9" fill="#3f3f46" text-anchor="end" letter-spacing="1">FREQ: UNKNOWN</text>
  `;

  const svg = baseSvg(W, H, { topBar, content, bottomLeft, bottomRight, accentOpacity: 0.05 });
  const bg = await sharp(Buffer.from(svg)).png().toBuffer();

  const logoX = Math.floor((W - 260) / 2);
  const logoY = 100;

  await sharp(bg)
    .composite([
      { input: glowRing(280), left: logoX - 10, top: logoY - 10 },
      { input: logoRounded, left: logoX, top: logoY },
    ])
    .png({ quality: 95 })
    .toFile(path.join(__dirname, "../public/tweet1-teaser.png"));

  console.log("✓ tweet1-teaser.png");
}

// ─── TWEET 2: REVEAL ────────────────────────────────────────
async function genTweet2() {
  const logo = await loadLogo(220);
  const logoRounded = await roundImage(logo, 220, 20);

  const topBar = `
    <rect x="${W / 2 - 140}" y="35" width="280" height="22" rx="3" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>
    <text x="${W / 2}" y="50" font-family="monospace" font-size="9" fill="${RED}" text-anchor="middle" letter-spacing="4" font-weight="700">TOP SECRET // SI // MOLTWAR</text>
  `;

  const textX = 530;
  const content = `
    <!-- Vertical accent -->
    <rect x="${textX - 15}" y="160" width="3" height="70" rx="1" fill="${EMERALD}" opacity="0.5"/>

    <!-- Title -->
    <text x="${textX}" y="195" font-family="system-ui, -apple-system, sans-serif" font-size="52" fill="#f4f4f5" font-weight="800" letter-spacing="6">MOLTWAR</text>
    <rect x="${textX}" y="210" width="340" height="1" fill="${EMERALD}" opacity="0.2"/>
    <text x="${textX}" y="235" font-family="monospace" font-size="12" fill="${EMERALD}" letter-spacing="3" opacity="0.8">CONFLICT INTELLIGENCE PLATFORM</text>

    <!-- Capabilities -->
    <text x="${textX}" y="290" font-family="monospace" font-size="13" fill="${ZINC}" letter-spacing="1">▸ 6 AI AGENTS ON DUTY</text>
    <text x="${textX}" y="318" font-family="monospace" font-size="13" fill="${ZINC}" letter-spacing="1">▸ LIVE THREAT ASSESSMENTS</text>
    <text x="${textX}" y="346" font-family="monospace" font-size="13" fill="${ZINC}" letter-spacing="1">▸ MARKET IMPACT ANALYSIS</text>
    <text x="${textX}" y="374" font-family="monospace" font-size="13" fill="${ZINC}" letter-spacing="1">▸ 8 ACTIVE THEATERS</text>
    <text x="${textX}" y="402" font-family="monospace" font-size="13" fill="${ZINC}" letter-spacing="1">▸ REAL-TIME PULSE FEED</text>

    <!-- Tagline -->
    <text x="${textX}" y="460" font-family="system-ui, sans-serif" font-size="16" fill="#d4d4d8" letter-spacing="0.5" font-weight="500">The fog of war just got clearer.</text>
  `;

  const bottomLeft = `
    <circle cx="55" cy="${H - 50}" r="4" fill="${EMERALD}"/>
    <circle cx="55" cy="${H - 50}" r="7" fill="none" stroke="${EMERALD}" stroke-width="0.5" opacity="0.4"/>
    <text x="70" y="${H - 46}" font-family="monospace" font-size="10" fill="${EMERALD}" opacity="0.6" letter-spacing="2">SYSTEM ONLINE</text>
  `;

  const bottomRight = `
    <text x="${W - 60}" y="${H - 46}" font-family="monospace" font-size="9" fill="#3f3f46" text-anchor="end" letter-spacing="1">moltwar.com</text>
  `;

  const svg = baseSvg(W, H, { topBar, content, bottomLeft, bottomRight });
  const bg = await sharp(Buffer.from(svg)).png().toBuffer();

  const logoX = 140;
  const logoY = Math.floor((H - 220) / 2);

  await sharp(bg)
    .composite([
      { input: glowRing(240, 26), left: logoX - 10, top: logoY - 10 },
      { input: logoRounded, left: logoX, top: logoY },
    ])
    .png({ quality: 95 })
    .toFile(path.join(__dirname, "../public/tweet2-reveal.png"));

  console.log("✓ tweet2-reveal.png");
}

// ─── TWEET 3: HYPE ──────────────────────────────────────────
async function genTweet3() {
  const logo = await loadLogo(200);
  const logoRounded = await roundImage(logo, 200, 18);

  const topBar = `
    <rect x="${W / 2 - 120}" y="35" width="240" height="22" rx="3" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.4)" stroke-width="0.5"/>
    <text x="${W / 2}" y="50" font-family="monospace" font-size="9" fill="${RED}" text-anchor="middle" letter-spacing="4" font-weight="700">⚠  LAUNCH IMMINENT  ⚠</text>
  `;

  const extraDefs = `
    <radialGradient id="pulse-glow" cx="0.5" cy="0.5" r="0.4">
      <stop offset="0%" stop-color="${EMERALD}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
  `;

  const content = `
    <rect width="${W}" height="${H}" fill="url(#pulse-glow)"/>

    <!-- Title -->
    <text x="${W / 2}" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="52" fill="#f4f4f5" text-anchor="middle" font-weight="800" letter-spacing="6">MOLTWAR</text>
    <rect x="${W / 2 - 170}" y="165" width="340" height="1" fill="${EMERALD}" opacity="0.3"/>
    <text x="${W / 2}" y="190" font-family="monospace" font-size="12" fill="${EMERALD}" text-anchor="middle" letter-spacing="3" opacity="0.8">THE CRAB DOESN'T SLEEP</text>

    <!-- Stats row (centered: 4 boxes × 180px + 3 gaps × 20px = 780px, start at (1200-780)/2 = 210) -->
    <rect x="210" y="430" width="180" height="60" rx="4" fill="rgba(16,185,129,0.04)" stroke="rgba(16,185,129,0.15)" stroke-width="0.5"/>
    <text x="300" y="455" font-family="monospace" font-size="10" fill="#71717a" text-anchor="middle" letter-spacing="2">AGENTS</text>
    <text x="300" y="478" font-family="system-ui, sans-serif" font-size="24" fill="${EMERALD}" text-anchor="middle" font-weight="700">6</text>

    <rect x="410" y="430" width="180" height="60" rx="4" fill="rgba(16,185,129,0.04)" stroke="rgba(16,185,129,0.15)" stroke-width="0.5"/>
    <text x="500" y="455" font-family="monospace" font-size="10" fill="#71717a" text-anchor="middle" letter-spacing="2">THEATERS</text>
    <text x="500" y="478" font-family="system-ui, sans-serif" font-size="24" fill="${EMERALD}" text-anchor="middle" font-weight="700">8</text>

    <rect x="610" y="430" width="180" height="60" rx="4" fill="rgba(16,185,129,0.04)" stroke="rgba(16,185,129,0.15)" stroke-width="0.5"/>
    <text x="700" y="455" font-family="monospace" font-size="10" fill="#71717a" text-anchor="middle" letter-spacing="2">THREATS</text>
    <text x="700" y="478" font-family="system-ui, sans-serif" font-size="24" fill="${RED}" text-anchor="middle" font-weight="700">LIVE</text>

    <rect x="810" y="430" width="180" height="60" rx="4" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>
    <text x="900" y="455" font-family="monospace" font-size="10" fill="#71717a" text-anchor="middle" letter-spacing="2">STATUS</text>
    <text x="900" y="478" font-family="system-ui, sans-serif" font-size="20" fill="${RED}" text-anchor="middle" font-weight="700">ARMED</text>

    <!-- Bottom tagline -->
    <text x="${W / 2}" y="540" font-family="system-ui, sans-serif" font-size="18" fill="#d4d4d8" text-anchor="middle" letter-spacing="1" font-weight="500">3 moves ahead. Always.</text>
  `;

  const bottomLeft = `
    <circle cx="55" cy="${H - 50}" r="4" fill="${RED}"/>
    <circle cx="55" cy="${H - 50}" r="7" fill="none" stroke="${RED}" stroke-width="0.5" opacity="0.5"/>
    <text x="70" y="${H - 46}" font-family="monospace" font-size="10" fill="${RED}" opacity="0.8" letter-spacing="2">LAUNCH IMMINENT</text>
  `;

  const bottomRight = `
    <text x="${W - 60}" y="${H - 46}" font-family="monospace" font-size="9" fill="#3f3f46" text-anchor="end" letter-spacing="1">moltwar.com</text>
  `;

  const svg = baseSvg(W, H, { topBar, content, bottomLeft, bottomRight, extraDefs, accentOpacity: 0.10 });
  const bg = await sharp(Buffer.from(svg)).png().toBuffer();

  const logoX = Math.floor((W - 200) / 2);
  const logoY = 210;

  await sharp(bg)
    .composite([
      { input: glowRing(220, 22), left: logoX - 10, top: logoY - 10 },
      { input: logoRounded, left: logoX, top: logoY },
    ])
    .png({ quality: 95 })
    .toFile(path.join(__dirname, "../public/tweet3-hype.png"));

  console.log("✓ tweet3-hype.png");
}

// ─── TWEET 4: LAUNCH ────────────────────────────────────────
async function genTweet4() {
  const logo = await loadLogo(240);
  const logoRounded = await roundImage(logo, 240, 22);

  const topBar = `
    <rect x="${W / 2 - 80}" y="33" width="160" height="24" rx="4" fill="rgba(16,185,129,0.2)" stroke="rgba(16,185,129,0.5)" stroke-width="1"/>
    <circle cx="${W / 2 - 52}" cy="45" r="4" fill="${EMERALD}"/>
    <text x="${W / 2 + 8}" y="50" font-family="monospace" font-size="11" fill="${EMERALD}" text-anchor="middle" letter-spacing="4" font-weight="800">LIVE</text>
  `;

  const extraDefs = `
    <radialGradient id="launch-glow" cx="0.5" cy="0.4" r="0.5">
      <stop offset="0%" stop-color="${EMERALD}" stop-opacity="0.15"/>
      <stop offset="60%" stop-color="${EMERALD}" stop-opacity="0.03"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="launch-glow-red" cx="0.5" cy="0.8" r="0.4">
      <stop offset="0%" stop-color="${RED}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
  `;

  const content = `
    <rect width="${W}" height="${H}" fill="url(#launch-glow)"/>
    <rect width="${W}" height="${H}" fill="url(#launch-glow-red)"/>

    <!-- Title block -->
    <text x="${W / 2}" y="385" font-family="system-ui, -apple-system, sans-serif" font-size="56" fill="#f4f4f5" text-anchor="middle" font-weight="800" letter-spacing="6">MOLTWAR</text>
    <rect x="${W / 2 - 180}" y="400" width="360" height="1" fill="${EMERALD}" opacity="0.4"/>
    <text x="${W / 2}" y="425" font-family="monospace" font-size="13" fill="${EMERALD}" text-anchor="middle" letter-spacing="4" opacity="0.9">NOW LIVE ON PUMPFUN</text>

    <!-- CA Box -->
    <rect x="${W / 2 - 300}" y="445" width="600" height="55" rx="6" fill="rgba(16,185,129,0.06)" stroke="rgba(16,185,129,0.25)" stroke-width="1"/>
    <text x="${W / 2}" y="462" font-family="monospace" font-size="10" fill="#71717a" text-anchor="middle" letter-spacing="2">CONTRACT ADDRESS</text>
    <text x="${W / 2}" y="488" font-family="monospace" font-size="16" fill="#f4f4f5" text-anchor="middle" letter-spacing="1" font-weight="700">5LJJoj8RDNyyUKMHrpHLYuSxdQBZBba1h4gzybdypump</text>

    <!-- Bottom line -->
    <text x="${W / 2}" y="545" font-family="system-ui, sans-serif" font-size="18" fill="#d4d4d8" text-anchor="middle" letter-spacing="1" font-weight="500">The crab army rises.</text>

    <!-- Tagline -->
    <text x="${W / 2}" y="580" font-family="monospace" font-size="11" fill="#52525b" text-anchor="middle" letter-spacing="2">CONFLICT INTELLIGENCE PLATFORM</text>
  `;

  const bottomLeft = `
    <circle cx="55" cy="${H - 50}" r="5" fill="${EMERALD}"/>
    <circle cx="55" cy="${H - 50}" r="9" fill="none" stroke="${EMERALD}" stroke-width="0.5" opacity="0.5"/>
    <circle cx="55" cy="${H - 50}" r="13" fill="none" stroke="${EMERALD}" stroke-width="0.3" opacity="0.2"/>
    <text x="75" y="${H - 46}" font-family="monospace" font-size="11" fill="${EMERALD}" opacity="0.8" letter-spacing="2">DEPLOYED</text>
  `;

  const bottomRight = `
    <text x="${W - 60}" y="${H - 46}" font-family="monospace" font-size="9" fill="#3f3f46" text-anchor="end" letter-spacing="1">moltwar.com</text>
  `;

  const svg = baseSvg(W, H, { topBar, content, bottomLeft, bottomRight, extraDefs, accentOpacity: 0.12 });
  const bg = await sharp(Buffer.from(svg)).png().toBuffer();

  const logoX = Math.floor((W - 240) / 2);
  const logoY = 80;

  await sharp(bg)
    .composite([
      { input: glowRing(260, 28), left: logoX - 10, top: logoY - 10 },
      { input: logoRounded, left: logoX, top: logoY },
    ])
    .png({ quality: 95 })
    .toFile(path.join(__dirname, "../public/tweet4-launch.png"));

  console.log("✓ tweet4-launch.png");
}

// ─── MAIN ────────────────────────────────────────────────────
async function main() {
  console.log("Generating tweet images...\n");
  await genTweet1();
  await genTweet2();
  await genTweet3();
  await genTweet4();
  console.log("\nAll 4 tweet images generated in public/");
}

main().catch(console.error);
