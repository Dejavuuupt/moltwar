const sharp = require("sharp");

async function generate() {
  // ── 1. Twitter Profile Picture (400x400) ──
  // Use the logo with rounded circle mask for Twitter's circular crop
  const pfpSize = 400;
  const logoPfp = await sharp("public/logomoltwar.jpg")
    .resize(pfpSize, pfpSize)
    .png()
    .toBuffer();

  await sharp(logoPfp)
    .toFile("public/twitter-pfp.png");
  console.log("twitter-pfp.png (400x400)");


  // ── 2. Twitter Banner / Cover Photo (1500x500) ──
  const W = 1500, H = 500;

  const scanlines = Array.from({ length: Math.floor(H / 3) }, (_, i) =>
    `<rect x="0" y="${i * 3}" width="${W}" height="1" fill="rgba(0,0,0,0.1)"/>`
  ).join("\n");

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0a0a0c"/>
        <stop offset="35%" stop-color="#0f1117"/>
        <stop offset="65%" stop-color="#0d1210"/>
        <stop offset="100%" stop-color="#0c1a12"/>
      </linearGradient>
      <radialGradient id="glow1" cx="0.2" cy="0.5" r="0.45">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.07"/>
        <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glow2" cx="0.8" cy="0.5" r="0.45">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glow-center" cx="0.5" cy="0.5" r="0.3">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.03"/>
        <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" stroke-width="0.5"/>
      </pattern>
      <linearGradient id="line-fade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0"/>
        <stop offset="15%" stop-color="#10b981" stop-opacity="0.3"/>
        <stop offset="85%" stop-color="#10b981" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="line-fade-red" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0"/>
        <stop offset="25%" stop-color="#ef4444" stop-opacity="0.12"/>
        <stop offset="75%" stop-color="#ef4444" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="#ef4444" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="border-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.25"/>
        <stop offset="50%" stop-color="#10b981" stop-opacity="0.04"/>
        <stop offset="100%" stop-color="#ef4444" stop-opacity="0.15"/>
      </linearGradient>
      <linearGradient id="title-line" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
      </linearGradient>
    </defs>

    <!-- Base layers -->
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#grid)"/>
    <rect width="${W}" height="${H}" fill="url(#glow1)"/>
    <rect width="${W}" height="${H}" fill="url(#glow2)"/>
    <rect width="${W}" height="${H}" fill="url(#glow-center)"/>

    <!-- Horizontal accent lines -->
    <rect x="0" y="60" width="${W}" height="1" fill="url(#line-fade-red)" opacity="0.35"/>
    <rect x="0" y="140" width="${W}" height="1" fill="url(#line-fade)" opacity="0.2"/>
    <rect x="0" y="360" width="${W}" height="1" fill="url(#line-fade)" opacity="0.15"/>
    <rect x="0" y="${H - 60}" width="${W}" height="1" fill="url(#line-fade-red)" opacity="0.25"/>

    <!-- Corner brackets -->
    <path d="M 24 24 L 24 54" stroke="#10b981" stroke-width="1.5" opacity="0.45" fill="none"/>
    <path d="M 24 24 L 54 24" stroke="#10b981" stroke-width="1.5" opacity="0.45" fill="none"/>
    <path d="M ${W - 24} 24 L ${W - 24} 54" stroke="#10b981" stroke-width="1.5" opacity="0.45" fill="none"/>
    <path d="M ${W - 24} 24 L ${W - 54} 24" stroke="#10b981" stroke-width="1.5" opacity="0.45" fill="none"/>
    <path d="M 24 ${H - 24} L 24 ${H - 54}" stroke="#ef4444" stroke-width="1.5" opacity="0.35" fill="none"/>
    <path d="M 24 ${H - 24} L 54 ${H - 24}" stroke="#ef4444" stroke-width="1.5" opacity="0.35" fill="none"/>
    <path d="M ${W - 24} ${H - 24} L ${W - 24} ${H - 54}" stroke="#ef4444" stroke-width="1.5" opacity="0.35" fill="none"/>
    <path d="M ${W - 24} ${H - 24} L ${W - 54} ${H - 24}" stroke="#ef4444" stroke-width="1.5" opacity="0.35" fill="none"/>

    <!-- Outer border frame -->
    <rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="4" fill="none" stroke="url(#border-grad)" stroke-width="1"/>

    <!-- Scanlines -->
    ${scanlines}

    <!-- Classification bar top center -->
    <rect x="${W / 2 - 90}" y="28" width="180" height="20" rx="3" fill="rgba(239,68,68,0.07)" stroke="rgba(239,68,68,0.18)" stroke-width="0.5"/>
    <text x="${W / 2}" y="42" font-family="monospace" font-size="8" fill="#ef4444" text-anchor="middle" letter-spacing="4" font-weight="700">TOP SECRET // SI</text>

    <!-- Vertical accent bar left of title -->
    <rect x="597" y="165" width="3" height="70" rx="1" fill="#10b981" opacity="0.5"/>

    <!-- Title -->
    <text x="612" y="200" font-family="system-ui, -apple-system, sans-serif" font-size="62" fill="#f4f4f5" font-weight="800" letter-spacing="10">MOLTWAR</text>

    <!-- Accent line under title -->
    <rect x="612" y="215" width="420" height="1" fill="url(#title-line)"/>

    <!-- Subtitle -->
    <text x="614" y="245" font-family="monospace" font-size="13" fill="#10b981" letter-spacing="3.5" opacity="0.8">CONFLICT INTELLIGENCE PLATFORM</text>

    <!-- Description -->
    <text x="614" y="285" font-family="system-ui, sans-serif" font-size="15" fill="#a1a1aa" letter-spacing="0.5">Real-time AI-powered war intelligence</text>



    <!-- Bottom left status -->
    <circle cx="55" cy="${H - 42}" r="3.5" fill="#10b981"/>
    <circle cx="55" cy="${H - 42}" r="6" fill="none" stroke="#10b981" stroke-width="0.5" opacity="0.4"/>
    <text x="68" y="${H - 38}" font-family="monospace" font-size="10" fill="#10b981" opacity="0.5" letter-spacing="2">SYSTEM ONLINE</text>



    <!-- Decorative crosshair marks -->
    <circle cx="200" cy="${H / 2}" r="1.5" fill="#10b981" opacity="0.15"/>
    <line x1="190" y1="${H / 2}" x2="210" y2="${H / 2}" stroke="#10b981" stroke-width="0.5" opacity="0.1"/>
    <line x1="200" y1="${H / 2 - 10}" x2="200" y2="${H / 2 + 10}" stroke="#10b981" stroke-width="0.5" opacity="0.1"/>

    <circle cx="${W - 200}" cy="${H / 2}" r="1.5" fill="#ef4444" opacity="0.12"/>
    <line x1="${W - 210}" y1="${H / 2}" x2="${W - 190}" y2="${H / 2}" stroke="#ef4444" stroke-width="0.5" opacity="0.08"/>
    <line x1="${W - 200}" y1="${H / 2 - 10}" x2="${W - 200}" y2="${H / 2 + 10}" stroke="#ef4444" stroke-width="0.5" opacity="0.08"/>
  </svg>`;

  const svgBuf = Buffer.from(svg);
  const bg = await sharp(svgBuf).png().toBuffer();

  // Logo for banner - 240px
  const logoBanner = await sharp("public/logomoltwar.jpg")
    .resize(240, 240)
    .png()
    .toBuffer();

  // Round corners
  const logoRounded = await sharp(logoBanner)
    .composite([{
      input: Buffer.from(
        `<svg width="240" height="240"><rect width="240" height="240" rx="22" fill="white"/></svg>`
      ),
      blend: "dest-in"
    }])
    .png()
    .toBuffer();

  // Glow ring
  const ringSize = 256;
  const logoRing = Buffer.from(
    `<svg width="${ringSize}" height="${ringSize}">
      <rect x="2" y="2" width="${ringSize - 4}" height="${ringSize - 4}" rx="28" fill="none" stroke="#10b981" stroke-width="1.5" opacity="0.3"/>
    </svg>`
  );

  const logoX = 310;
  const logoY = (H - 240) / 2;

  await sharp(bg)
    .composite([
      { input: logoRing, left: logoX - 8, top: logoY - 8 },
      { input: logoRounded, left: logoX, top: logoY },
    ])
    .png({ quality: 95 })
    .toFile("public/twitter-banner.png");

  console.log("twitter-banner.png (1500x500)");
}

generate().catch(e => console.error(e));
