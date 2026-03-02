const sharp = require("sharp");

async function generate() {
  const W = 1200, H = 630;
  const logo = await sharp("public/logomoltwar.jpg")
    .resize(280, 280)
    .png()
    .toBuffer();

  // Scanlines
  const scanlines = Array.from({ length: Math.floor(H / 3) }, (_, i) =>
    `<rect x="0" y="${i * 3}" width="${W}" height="1" fill="rgba(0,0,0,0.12)"/>`
  ).join("\n");

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0a0a0c"/>
        <stop offset="40%" stop-color="#0f1117"/>
        <stop offset="100%" stop-color="#0c1a12"/>
      </linearGradient>
      <radialGradient id="glow1" cx="0.15" cy="0.3" r="0.5">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glow2" cx="0.85" cy="0.7" r="0.5">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0.06"/>
        <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glow3" cx="0.5" cy="0.5" r="0.35">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.04"/>
        <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.025)" stroke-width="0.5"/>
      </pattern>
      <linearGradient id="line-fade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0"/>
        <stop offset="20%" stop-color="#10b981" stop-opacity="0.4"/>
        <stop offset="80%" stop-color="#10b981" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="line-fade-red" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0"/>
        <stop offset="30%" stop-color="#ef4444" stop-opacity="0.15"/>
        <stop offset="70%" stop-color="#ef4444" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#ef4444" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="border-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.3"/>
        <stop offset="50%" stop-color="#10b981" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="#ef4444" stop-opacity="0.2"/>
      </linearGradient>
    </defs>

    <!-- Base -->
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#grid)"/>
    <rect width="${W}" height="${H}" fill="url(#glow1)"/>
    <rect width="${W}" height="${H}" fill="url(#glow2)"/>
    <rect width="${W}" height="${H}" fill="url(#glow3)"/>

    <!-- Horizontal accent lines -->
    <rect x="0" y="174" width="${W}" height="1" fill="url(#line-fade)" opacity="0.3"/>
    <rect x="0" y="456" width="${W}" height="1" fill="url(#line-fade)" opacity="0.2"/>
    <rect x="0" y="80" width="${W}" height="1" fill="url(#line-fade-red)" opacity="0.4"/>

    <!-- Corner brackets -->
    <path d="M 30 30 L 30 60" stroke="#10b981" stroke-width="1.5" opacity="0.5" fill="none"/>
    <path d="M 30 30 L 60 30" stroke="#10b981" stroke-width="1.5" opacity="0.5" fill="none"/>
    <path d="M ${W - 30} 30 L ${W - 30} 60" stroke="#10b981" stroke-width="1.5" opacity="0.5" fill="none"/>
    <path d="M ${W - 30} 30 L ${W - 60} 30" stroke="#10b981" stroke-width="1.5" opacity="0.5" fill="none"/>
    <path d="M 30 ${H - 30} L 30 ${H - 60}" stroke="#ef4444" stroke-width="1.5" opacity="0.4" fill="none"/>
    <path d="M 30 ${H - 30} L 60 ${H - 30}" stroke="#ef4444" stroke-width="1.5" opacity="0.4" fill="none"/>
    <path d="M ${W - 30} ${H - 30} L ${W - 30} ${H - 60}" stroke="#ef4444" stroke-width="1.5" opacity="0.4" fill="none"/>
    <path d="M ${W - 30} ${H - 30} L ${W - 60} ${H - 30}" stroke="#ef4444" stroke-width="1.5" opacity="0.4" fill="none"/>

    <!-- Border frame -->
    <rect x="20" y="20" width="${W - 40}" height="${H - 40}" rx="4" fill="none" stroke="url(#border-grad)" stroke-width="1"/>

    <!-- Scanlines -->
    ${scanlines}

    <!-- Status dot -->
    <circle cx="70" cy="${H - 55}" r="4" fill="#10b981"/>
    <circle cx="70" cy="${H - 55}" r="7" fill="none" stroke="#10b981" stroke-width="0.5" opacity="0.4"/>

    <!-- Bottom status text -->
    <text x="85" y="${H - 50}" font-family="monospace" font-size="11" fill="#10b981" opacity="0.6" letter-spacing="2">SYSTEM ONLINE</text>
    <text x="${W - 200}" y="${H - 50}" font-family="monospace" font-size="10" fill="#71717a" opacity="0.5" letter-spacing="1">MAR 01, 2026</text>

    <!-- Classification bar -->
    <rect x="${W / 2 - 100}" y="35" width="200" height="22" rx="3" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" stroke-width="0.5"/>
    <text x="${W / 2}" y="50" font-family="monospace" font-size="9" fill="#ef4444" text-anchor="middle" letter-spacing="4" font-weight="700">TOP SECRET // SI</text>

    <!-- Small vertical accent bar (left of title) -->
    <rect x="575" y="240" width="3" height="70" rx="1" fill="#10b981" opacity="0.5"/>

    <!-- Title -->
    <text x="590" y="270" font-family="system-ui, -apple-system, sans-serif" font-size="58" fill="#f4f4f5" font-weight="800" letter-spacing="8">MOLTWAR</text>

    <!-- Thin accent under title -->
    <rect x="590" y="285" width="380" height="1" fill="#10b981" opacity="0.2"/>

    <!-- Subtitle -->
    <text x="592" y="310" font-family="monospace" font-size="13" fill="#10b981" letter-spacing="3" opacity="0.8">CONFLICT INTELLIGENCE PLATFORM</text>

    <!-- Description -->
    <text x="592" y="350" font-family="system-ui, sans-serif" font-size="15" fill="#a1a1aa" letter-spacing="0.5">Real-time AI-powered</text>
    <text x="592" y="372" font-family="system-ui, sans-serif" font-size="15" fill="#a1a1aa" letter-spacing="0.5">war intelligence</text>

    <!-- Decorative status codes -->
    <text x="592" y="410" font-family="monospace" font-size="10" fill="#3f3f46" letter-spacing="1">6 AGENTS  //  8 THEATERS  //  LIVE PULSE</text>
  </svg>`;

  const svgBuf = Buffer.from(svg);
  const bg = await sharp(svgBuf).png().toBuffer();

  // Round the logo corners
  const logoRounded = await sharp(logo)
    .composite([{
      input: Buffer.from(
        `<svg width="280" height="280"><rect width="280" height="280" rx="24" fill="white"/></svg>`
      ),
      blend: "dest-in"
    }])
    .png()
    .toBuffer();

  // Glowing ring around logo
  const ringSize = 300;
  const logoRing = Buffer.from(
    `<svg width="${ringSize}" height="${ringSize}">
      <rect x="2" y="2" width="${ringSize - 4}" height="${ringSize - 4}" rx="30" fill="none" stroke="#10b981" stroke-width="2" opacity="0.35"/>
      <rect x="6" y="6" width="${ringSize - 12}" height="${ringSize - 12}" rx="26" fill="none" stroke="rgba(16,185,129,0.08)" stroke-width="1"/>
    </svg>`
  );

  // Shadow behind logo
  const shadow = await sharp({
    create: { width: 300, height: 300, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 80 } }
  }).png().toBuffer();

  const shadowBlurred = await sharp(shadow)
    .blur(20)
    .png()
    .toBuffer();

  // Logo position: centered as a group with text
  const logoX = 230;
  const logoY = (H - 280) / 2;

  await sharp(bg)
    .composite([
      { input: logoRing, left: logoX - 10, top: logoY - 10 },
      { input: logoRounded, left: logoX, top: logoY },
    ])
    .png({ quality: 95 })
    .toFile("public/og-image.png");

  console.log("OG image generated: 1200x630");
}

generate().catch(e => console.error(e));
