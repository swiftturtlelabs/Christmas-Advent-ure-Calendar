/**
 * Builds Adobe-friendly promo card files from the approved Light Scan First design.
 *
 * Best format for this project: Adobe Illustrator (editable vectors + type).
 * We write a structured SVG Illustrator opens natively (File → Open, then Save As .ai).
 * Also writes a layered Photoshop PSD for raster edits.
 *
 * Printer spec: trim 3.5" × 2" (business card) + 1/8" (0.125") bleed
 * Artboard / full bleed size: 3.75" × 2.25"
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import QRCode from 'qrcode';

const require = createRequire(import.meta.url);
const { writePsdBuffer } = require('ag-psd');
const { PNG } = require('pngjs');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOME_URL = 'https://christmasadventurecalendar.com/';
const DISPLAY_URL = 'ChristmasAdventureCalendar.com';

const DPI = 300;
const WIDTH_IN = 3.75;
const HEIGHT_IN = 2.25;
const W = Math.round(WIDTH_IN * DPI); // 1125
const H = Math.round(HEIGHT_IN * DPI); // 675

const COLORS = {
  pine950: '#06251c',
  pine900: '#0b3d2e',
  pine800: '#124a37',
  pine600: '#22754f',
  holly: '#d63b3b',
  gold: '#f5c04c',
  gold500: '#e0a825',
  goldSoft: '#ffe08a',
  snow: '#fffdf8',
  snow100: '#fbf6ea',
  cream: '#fff3d9',
  inkMuted: '#4d6358',
};

function inPx(inches) {
  return inches * DPI;
}

const qrPng = await QRCode.toBuffer(HOME_URL, {
  type: 'png',
  margin: 2,
  width: 1024,
  errorCorrectionLevel: 'M',
  color: { dark: COLORS.pine950, light: COLORS.snow },
});
const qrDataUrl = `data:image/png;base64,${qrPng.toString('base64')}`;

// ---------------------------------------------------------------------------
// 1) Illustrator SVG — editable text, grouped layers, inch artboard
// ---------------------------------------------------------------------------
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  Christmas Advent-ure Calendar — promo card (print)
  Open in Adobe Illustrator → File → Save As → Adobe Illustrator (*.ai)

  Printer: trim 3.5" × 2" with 1/8" (0.125") bleed on all sides
  Artboard: ${WIDTH_IN}" × ${HEIGHT_IN}"
  Fonts: Poppins Bold/Medium, Mountains of Christmas Bold
  QR encodes: ${HOME_URL}
-->
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${WIDTH_IN}in"
  height="${HEIGHT_IN}in"
  viewBox="0 0 ${W} ${H}"
  xml:space="preserve"
>
  <title>Christmas Advent-ure Calendar promo card</title>
  <desc>Printable business card. Bleed artboard ${WIDTH_IN}x${HEIGHT_IN} in. Trim 3.5x2 in.</desc>

  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="35%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.snow}"/>
      <stop offset="55%" stop-color="${COLORS.snow100}"/>
      <stop offset="100%" stop-color="${COLORS.cream}"/>
    </linearGradient>
    <radialGradient id="glowGold" cx="88%" cy="78%" r="42%">
      <stop offset="0%" stop-color="${COLORS.gold}" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="${COLORS.gold}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowHolly" cx="10%" cy="30%" r="40%">
      <stop offset="0%" stop-color="${COLORS.holly}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="${COLORS.holly}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.pine900}" stop-opacity="0.96"/>
      <stop offset="100%" stop-color="${COLORS.pine900}" stop-opacity="0.88"/>
    </linearGradient>
    <linearGradient id="chipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.goldSoft}"/>
      <stop offset="100%" stop-color="${COLORS.gold}"/>
    </linearGradient>
    <pattern id="candyStripe" patternUnits="userSpaceOnUse" width="246" height="15">
      <rect width="246" height="15" fill="transparent"/>
      <rect x="0" y="0" width="15" height="15" fill="${COLORS.holly}"/>
      <rect x="84" y="0" width="18" height="15" fill="${COLORS.gold}"/>
      <rect x="165" y="0" width="15" height="15" fill="${COLORS.pine600}"/>
    </pattern>
  </defs>

  <!-- Layer: Background -->
  <g id="Background">
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#bgGrad)"/>
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#glowGold)"/>
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#glowHolly)"/>
  </g>

  <!-- Layer: Watermark 24 -->
  <g id="Watermark-24">
    <text
      x="${W - inPx(0.12)}"
      y="${H * 0.62}"
      text-anchor="end"
      font-family="Mountains of Christmas, Georgia, serif"
      font-weight="700"
      font-size="${inPx(1.75)}"
      fill="${COLORS.gold}"
      fill-opacity="0.18"
    >24</text>
  </g>

  <!-- Layer: Header ribbon -->
  <g id="Header-Ribbon">
    <rect x="0" y="0" width="${W}" height="${inPx(0.36)}" fill="url(#ribbonGrad)"/>
    <rect x="0" y="${inPx(0.36)}" width="${W}" height="${inPx(0.05)}" fill="url(#candyStripe)"/>
    <text
      x="${W / 2}"
      y="${inPx(0.235)}"
      text-anchor="middle"
      font-family="Poppins, Arial, sans-serif"
      font-weight="700"
      font-size="${inPx(0.11)}"
      fill="${COLORS.gold}"
    >${DISPLAY_URL}</text>
  </g>

  <!-- Layer: QR -->
  <g id="QR-Code" transform="translate(${inPx(0.38)}, ${inPx(0.58)})">
    <rect
      x="0" y="0"
      width="${inPx(1.08)}" height="${inPx(1.08)}"
      fill="${COLORS.snow}"
      stroke="${COLORS.gold}"
      stroke-width="${inPx(0.016)}"
    />
    <image
      xlink:href="${qrDataUrl}"
      x="${inPx(0.048)}" y="${inPx(0.048)}"
      width="${inPx(0.984)}" height="${inPx(0.984)}"
      preserveAspectRatio="xMidYMid meet"
    />
    <text
      x="${inPx(0.54)}"
      y="${inPx(1.2)}"
      text-anchor="middle"
      font-family="Poppins, Arial, sans-serif"
      font-weight="700"
      font-size="${inPx(0.082)}"
      letter-spacing="0.12em"
      fill="${COLORS.pine800}"
    >SCAN ME</text>
  </g>

  <!-- Layer: Typography -->
  <g id="Typography" transform="translate(${inPx(0.38 + 1.12 + 0.18)}, ${inPx(0.56)})">
    <text
      font-family="Mountains of Christmas, Georgia, serif"
      font-weight="700"
      font-size="${inPx(0.275)}"
      fill="${COLORS.pine900}"
    >
      <tspan x="0" dy="0">Christmas</tspan>
      <tspan x="0" dy="${inPx(0.26)}">Advent-ure</tspan>
      <tspan x="0" dy="${inPx(0.26)}">Calendar</tspan>
    </text>

    <!-- FOR FREE badge -->
    <g id="For-Free-Badge" transform="translate(0, ${inPx(0.84)})">
      <rect width="${inPx(0.72)}" height="${inPx(0.17)}" rx="3" fill="url(#chipGrad)"/>
      <text
        x="${inPx(0.36)}" y="${inPx(0.12)}"
        text-anchor="middle"
        font-family="Poppins, Arial, sans-serif"
        font-weight="700"
        font-size="${inPx(0.085)}"
        letter-spacing="0.1em"
        fill="${COLORS.pine950}"
      >FOR FREE</text>
    </g>

    <text
      y="${inPx(1.14)}"
      font-family="Poppins, Arial, sans-serif"
      font-weight="500"
      font-size="${inPx(0.105)}"
      fill="${COLORS.inkMuted}"
    >
      <tspan x="0" dy="0">A personalized Christmas</tspan>
      <tspan x="0" dy="${inPx(0.135)}">adventure, one day at a time.</tspan>
    </text>

    <!-- Chips -->
    <g id="Feature-Chips" transform="translate(0, ${inPx(1.42)})">
      ${chip(0, 0, 'Daily surprises', 155)}
      ${chip(165, 0, 'Secret riddles', 145)}
      ${chip(0, 42, 'Printable QR codes for each day', 310)}
    </g>
  </g>

  <!-- Layer: Trim guides (non-printing helpers — delete before final export if desired) -->
  <g id="Trim-Guides" opacity="0.35">
    <rect
      x="${inPx(0.125)}" y="${inPx(0.125)}"
      width="${inPx(3.5)}" height="${inPx(2)}"
      fill="none"
      stroke="#00a0e3"
      stroke-width="1"
      stroke-dasharray="6 4"
    />
  </g>
</svg>
`;

function chip(x, y, label, approxWidth) {
  const h = 28;
  const padX = 12;
  return `
    <g transform="translate(${x}, ${y})">
      <rect width="${approxWidth}" height="${h}" rx="4" fill="url(#chipGrad)"/>
      <text
        x="${padX}" y="19"
        font-family="Poppins, Arial, sans-serif"
        font-weight="600"
        font-size="14"
        fill="${COLORS.pine950}"
      >${escapeXml(label)}</text>
    </g>`;
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const svgPath = path.join(__dirname, 'Christmas-Adventure-Calendar-promo-card.svg');
fs.writeFileSync(svgPath, svg, 'utf8');
console.log('Wrote', path.basename(svgPath), `(${svg.length} chars) — open in Illustrator, Save As .ai`);

// ---------------------------------------------------------------------------
// 2) Photoshop PSD — layered from final PNG + standalone QR
// ---------------------------------------------------------------------------
const flatPngPath = path.join(__dirname, 'Christmas-Adventure-Calendar-promo-card.png');
if (!fs.existsSync(flatPngPath)) {
  console.error('Missing flat PNG; run build-print-card.mjs first');
  process.exit(1);
}

function readPng(file) {
  return PNG.sync.read(fs.readFileSync(file));
}

function resizeNearest(src, tw, th) {
  const out = new PNG({ width: tw, height: th });
  for (let y = 0; y < th; y++) {
    const sy = Math.min(src.height - 1, Math.floor((y / th) * src.height));
    for (let x = 0; x < tw; x++) {
      const sx = Math.min(src.width - 1, Math.floor((x / tw) * src.width));
      const si = (sy * src.width + sx) << 2;
      const di = (y * tw + x) << 2;
      out.data[di] = src.data[si];
      out.data[di + 1] = src.data[si + 1];
      out.data[di + 2] = src.data[si + 2];
      out.data[di + 3] = src.data[si + 3];
    }
  }
  return out;
}

function blank(w, h) {
  const png = new PNG({ width: w, height: h });
  png.data.fill(0);
  return png;
}

function paste(dest, src, dx, dy) {
  for (let y = 0; y < src.height; y++) {
    const ty = dy + y;
    if (ty < 0 || ty >= dest.height) continue;
    for (let x = 0; x < src.width; x++) {
      const tx = dx + x;
      if (tx < 0 || tx >= dest.width) continue;
      const si = (y * src.width + x) << 2;
      const di = (ty * dest.width + tx) << 2;
      const a = src.data[si + 3] / 255;
      if (a <= 0) continue;
      dest.data[di] = Math.round(src.data[si] * a + dest.data[di] * (1 - a));
      dest.data[di + 1] = Math.round(src.data[si + 1] * a + dest.data[di + 1] * (1 - a));
      dest.data[di + 2] = Math.round(src.data[si + 2] * a + dest.data[di + 2] * (1 - a));
      dest.data[di + 3] = Math.min(255, dest.data[di + 3] + src.data[si + 3]);
    }
  }
}

function toImageData(png) {
  return {
    width: png.width,
    height: png.height,
    data: new Uint8ClampedArray(png.data),
  };
}

const flat = readPng(flatPngPath);
const flat300 = resizeNearest(flat, W, H);

const qrSrc = PNG.sync.read(qrPng);
const qrSize = Math.round(inPx(0.984));
const qrResized = resizeNearest(qrSrc, qrSize, qrSize);
const qrLayer = blank(W, H);
const qrX = Math.round(inPx(0.38 + 0.048));
const qrY = Math.round(inPx(0.58 + 0.048));
paste(qrLayer, qrResized, qrX, qrY);

// Background = flat with QR area punched to nearby cream (approximate) so QR layer sits on top
const background = blank(W, H);
background.data.set(flat300.data);
for (let y = qrY; y < qrY + qrSize; y++) {
  for (let x = qrX; x < qrX + qrSize; x++) {
    const i = (y * W + x) << 2;
    background.data[i] = 255;
    background.data[i + 1] = 253;
    background.data[i + 2] = 248;
    background.data[i + 3] = 255;
  }
}

const psd = {
  width: W,
  height: H,
  channels: 3,
  bitsPerChannel: 8,
  colorMode: 3, // RGB
  children: [
    {
      name: 'QR Code (editable swap)',
      opacity: 1,
      canvas: undefined,
      imageData: toImageData(qrLayer),
      left: 0,
      top: 0,
      right: W,
      bottom: H,
    },
    {
      name: 'Card Artwork',
      opacity: 1,
      imageData: toImageData(background),
      left: 0,
      top: 0,
      right: W,
      bottom: H,
    },
    {
      name: 'Flat Proof (reference)',
      opacity: 1,
      hidden: true,
      imageData: toImageData(flat300),
      left: 0,
      top: 0,
      right: W,
      bottom: H,
    },
  ],
};

// ag-psd prefers canvas in browsers; for node imageData should work with generateThumbnails etc.
const psdBuffer = writePsdBuffer(psd, { generateThumbnail: false, invalidateTextLayers: true });
const psdPath = path.join(__dirname, 'Christmas-Adventure-Calendar-promo-card.psd');
fs.writeFileSync(psdPath, Buffer.from(psdBuffer));
console.log('Wrote', path.basename(psdPath), `(${psdBuffer.byteLength} bytes) — ${W}×${H}px @ ${DPI}dpi`);

// Convenience: also copy SVG-named hint readme as plain text next to files
const readme = `Adobe files — Christmas Advent-ure Calendar promo card
=====================================================

PRINTER SPECS
  Trim:  3.5" × 2" (business card)
  Bleed: 1/8" (0.125") on all sides
  Full artwork / artboard: 3.75" × 2.25"

RECOMMENDED: Christmas-Adventure-Calendar-promo-card.svg
  • Open in Adobe Illustrator
  • Then: File → Save As → Adobe Illustrator (*.ai)
  • Install fonts for full editability: Poppins, Mountains of Christmas
  • Blue dashed rect = trim guide (hide/delete before sending to press)
  • Includes gold "FOR FREE" badge

ALSO: Christmas-Adventure-Calendar-promo-card.psd
  • Photoshop document @ 300 DPI
  • Layers: Card Artwork, QR Code (swap), Flat Proof (hidden reference)

PDF / PNG proofs also in this folder (fonts embedded in PDF)

QR encodes: ${HOME_URL}
URL shown: ${DISPLAY_URL}
`;
fs.writeFileSync(path.join(__dirname, 'ADOBE-README.txt'), readme, 'utf8');
console.log('Wrote ADOBE-README.txt');
