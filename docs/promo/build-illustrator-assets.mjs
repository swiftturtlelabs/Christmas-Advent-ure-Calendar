/**
 * Individual PNGs for Illustrator (300 DPI), matching the promo card.
 * Trim 3.5"×2" + 1/8" bleed → full backgrounds 3.75"×2.25".
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import QRCode from 'qrcode';

const require = createRequire(import.meta.url);
const { PNG } = require('pngjs');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'illustrator-assets');
const fontsDir = path.join(__dirname, 'fonts');
const HOME_URL = 'https://christmasadventurecalendar.com/';
const DPI = 300;

const COLORS = {
  pine900: '#0b3d2e',
  pine950: '#06251c',
  pine600: '#22754f',
  holly: '#d63b3b',
  gold: '#f5c04c',
  goldSoft: '#ffe08a',
  snow: '#fffdf8',
  snow100: '#fbf6ea',
  cream: '#fff3d9',
};

function inPx(inches) {
  return Math.round(inches * DPI);
}

function b64(file) {
  return fs.readFileSync(file).toString('base64');
}

const fontFaces = `
@font-face {
  font-family: 'Mountains of Christmas';
  font-weight: 700;
  src: url(data:font/woff2;base64,${b64(path.join(fontsDir, 'mountains-700.woff2'))}) format('woff2');
}
@font-face {
  font-family: 'Poppins';
  font-weight: 700;
  src: url(data:font/woff2;base64,${b64(path.join(fontsDir, 'poppins-700.woff2'))}) format('woff2');
}
`;

fs.mkdirSync(outDir, { recursive: true });
const tmpDir = path.join(outDir, '_tmp');
fs.mkdirSync(tmpDir, { recursive: true });

const chrome =
  process.env.CHROME_PATH ||
  ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ].find((p) => fs.existsSync(p));
if (!chrome) {
  console.error('Chrome/Edge required');
  process.exit(1);
}

function runChrome(args) {
  const r = spawnSync(chrome, args, { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout || 'chrome failed');
    process.exit(r.status || 1);
  }
}

function screenshotHtml(html, outPng, cssW, cssH, scale = 1) {
  const htmlPath = path.join(tmpDir, `${path.basename(outPng, '.png')}.html`);
  fs.writeFileSync(htmlPath, html, 'utf8');
  runChrome([
    '--headless=new',
    '--disable-gpu',
    `--screenshot=${outPng}`,
    `--window-size=${cssW},${cssH}`,
    `--force-device-scale-factor=${scale}`,
    '--default-background-color=00000000',
    '--hide-scrollbars',
    pathToFileURL(htmlPath).href,
  ]);
  console.log('✓', path.basename(outPng));
}

/** Chrome often composites "transparent" to black — render on chroma, then punch to alpha. */
function chromaToAlpha(file, chroma = [255, 0, 255], threshold = 40) {
  const png = PNG.sync.read(fs.readFileSync(file));
  const [cr, cg, cb] = chroma;
  for (let i = 0; i < png.data.length; i += 4) {
    const dr = Math.abs(png.data[i] - cr);
    const dg = Math.abs(png.data[i + 1] - cg);
    const db = Math.abs(png.data[i + 2] - cb);
    if (dr <= threshold && dg <= threshold && db <= threshold) {
      png.data[i] = 0;
      png.data[i + 1] = 0;
      png.data[i + 2] = 0;
      png.data[i + 3] = 0;
    }
  }
  fs.writeFileSync(file, PNG.sync.write(png));
}

const CHROMA = '#ff00ff';
const CHROMA_RGB = [255, 0, 255];

function writePng(file, width, height, paint) {
  const png = new PNG({ width, height });
  png.data.fill(0);
  paint(png);
  fs.writeFileSync(file, PNG.sync.write(png));
  console.log('✓', path.basename(file));
}

function setPx(png, x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const i = (png.width * y + x) << 2;
  png.data[i] = r;
  png.data[i + 1] = g;
  png.data[i + 2] = b;
  png.data[i + 3] = a;
}

function hexRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

// ---------------------------------------------------------------------------
// 1) QR
// ---------------------------------------------------------------------------
const qrPath = path.join(outDir, '01-qr.png');
await QRCode.toFile(qrPath, HOME_URL, {
  margin: 2,
  width: 1024,
  errorCorrectionLevel: 'M',
  color: { dark: COLORS.pine950, light: COLORS.snow },
});
console.log('✓ 01-qr.png');

// ---------------------------------------------------------------------------
// 2) QR Border — gold frame, transparent center (matches ~1.08" frame)
// ---------------------------------------------------------------------------
{
  const size = inPx(1.08); // 324
  const stroke = Math.max(3, inPx(0.016));
  const [r, g, b] = hexRgb(COLORS.gold);
  writePng(path.join(outDir, '02-qr-border.png'), size, size, (png) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const onEdge =
          x < stroke || y < stroke || x >= size - stroke || y >= size - stroke;
        if (onEdge) setPx(png, x, y, r, g, b, 255);
      }
    }
  });
}

// ---------------------------------------------------------------------------
// 3) Gradient background — full bleed artboard
// ---------------------------------------------------------------------------
{
  const W = inPx(3.75);
  const H = inPx(2.25);
  // Render via CSS for smooth gradient + soft glows
  const cssW = Math.round(3.75 * 96);
  const cssH = Math.round(2.25 * 96);
  const scale = 300 / 96; // → 300 DPI
  screenshotHtml(
    `<!doctype html><html><head><style>
      html,body{margin:0;width:${cssW}px;height:${cssH}px;overflow:hidden}
      .bg{width:100%;height:100%;background:
        radial-gradient(circle at 88% 78%, rgba(245,192,76,0.14), transparent 42%),
        radial-gradient(circle at 10% 30%, rgba(214,59,59,0.06), transparent 40%),
        linear-gradient(165deg, ${COLORS.snow} 0%, ${COLORS.snow100} 55%, ${COLORS.cream} 100%);
      }
    </style></head><body><div class="bg"></div></body></html>`,
    path.join(outDir, '03-gradient-background.png'),
    cssW,
    cssH,
    scale,
  );
}

// ---------------------------------------------------------------------------
// 4) 24 background watermark — full artboard, transparent elsewhere
//     Rendered more visible (~45% gold); dial opacity down in Illustrator.
// ---------------------------------------------------------------------------
{
  const cssW = Math.round(3.75 * 96); // 360
  const cssH = Math.round(2.25 * 96); // 216
  const scale = 300 / 96;
  const out = path.join(outDir, '04-24-background.png');
  screenshotHtml(
    `<!doctype html><html><head><style>
      ${fontFaces}
      html,body{margin:0;width:${cssW}px;height:${cssH}px;overflow:hidden;background:${CHROMA}}
      .w{
        position:absolute; left:200px; top:30px;
        font-family:'Mountains of Christmas', Georgia, serif;
        font-weight:700; font-size:160px; line-height:0.9;
        color:${COLORS.gold}; margin:0;
      }
    </style></head><body><p class="w">24</p></body></html>`,
    out,
    cssW,
    cssH,
    scale,
  );
  chromaToAlpha(out, CHROMA_RGB, 60);
  {
    const png = PNG.sync.read(fs.readFileSync(out));
    for (let i = 0; i < png.data.length; i += 4) {
      if (png.data[i + 3] > 0) png.data[i + 3] = Math.round(png.data[i + 3] * 0.4);
    }
    fs.writeFileSync(out, PNG.sync.write(png));
  }
}

// ---------------------------------------------------------------------------
// 5) Green background — full-bleed solid pine (crop/place as header)
// ---------------------------------------------------------------------------
{
  const W = inPx(3.75);
  const H = inPx(2.25);
  const [r, g, b] = hexRgb(COLORS.pine900);
  writePng(path.join(outDir, '05-green-background.png'), W, H, (png) => {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) setPx(png, x, y, r, g, b, 255);
    }
  });
}

// ---------------------------------------------------------------------------
// 6–8) Candy stripe color squares (one each)
// ---------------------------------------------------------------------------
{
  const size = inPx(0.25); // 75px — easy to place/repeat
  for (const [name, hex] of [
    ['06-colorful-light-yellow', COLORS.gold],
    ['07-colorful-light-green', COLORS.pine600],
    ['08-colorful-light-red', COLORS.holly],
  ]) {
    const [r, g, b] = hexRgb(hex);
    writePng(path.join(outDir, `${name}.png`), size, size, (png) => {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) setPx(png, x, y, r, g, b, 255);
      }
    });
  }
}

// ---------------------------------------------------------------------------
// 9) Title — Christmas Advent-ure Calendar (stacked, transparent)
// ---------------------------------------------------------------------------
{
  const cssW = Math.round(2.2 * 96);
  const cssH = Math.round(1.15 * 96);
  const scale = 300 / 96;
  const out = path.join(outDir, '09-christmas-adventure-calendar.png');
  screenshotHtml(
    `<!doctype html><html><head><style>
      ${fontFaces}
      html,body{margin:0;width:${cssW}px;height:${cssH}px;overflow:hidden;background:${CHROMA}}
      h1{
        margin:0; padding:0.04in 0.06in;
        font-family:'Mountains of Christmas', Georgia, serif;
        font-weight:700; font-size:0.29in; line-height:0.95;
        color:${COLORS.pine900};
      }
    </style></head><body>
      <h1>Christmas<br/>Advent-ure<br/>Calendar</h1>
    </body></html>`,
    out,
    cssW,
    cssH,
    scale,
  );
  chromaToAlpha(out, CHROMA_RGB, 50);
}

// ---------------------------------------------------------------------------
// 10) Yellow tag background — empty gold pill
// ---------------------------------------------------------------------------
{
  const cssW = Math.round(1.15 * 96);
  const cssH = Math.round(0.28 * 96);
  const scale = 300 / 96;
  const out = path.join(outDir, '10-yellow-tag-background.png');
  screenshotHtml(
    `<!doctype html><html><head><style>
      html,body{margin:0;width:${cssW}px;height:${cssH}px;overflow:hidden;background:${CHROMA}}
      .pill{
        box-sizing:border-box;
        width:100%; height:100%;
        border-radius:0.05in;
        background: linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold});
      }
    </style></head><body><div class="pill"></div></body></html>`,
    out,
    cssW,
    cssH,
    scale,
  );
  chromaToAlpha(out, CHROMA_RGB, 50);
}

// ---------------------------------------------------------------------------
// README + ZIP
// ---------------------------------------------------------------------------
const readme = `Illustrator asset pack — Christmas Advent-ure Calendar promo card
================================================================

Printer: trim 3.5" × 2", bleed 1/8" (0.125") → full backgrounds 3.75" × 2.25" @ 300 DPI

Files
-----
01-qr.png                         QR → https://christmasadventurecalendar.com/
02-qr-border.png                  Gold square frame (transparent center)
03-gradient-background.png        Cream gradient full bleed
04-24-background.png              Soft gold "24" watermark (transparent elsewhere; lower opacity in AI if needed)
05-green-background.png           Solid pine green full bleed (crop for header bar)
06-colorful-light-yellow.png      Candy-stripe square (gold) — duplicate to repeat
07-colorful-light-green.png       Candy-stripe square (green)
08-colorful-light-red.png         Candy-stripe square (red)
09-christmas-adventure-calendar.png   Title (transparent background)
10-yellow-tag-background.png      Empty gold pill — duplicate; type chip text yourself

You add manually
----------------
• Header URL: ChristmasAdventureCalendar.com
• Hook: A personalized Christmas adventure, one day at a time.
• Chip labels inside yellow tags
• SCAN ME
• FOR FREE (optional — can type on a yellow tag)

Place order tip
---------------
gradient → 24 → green header (cropped) → candy squares → QR border → QR → title → tags
`;

fs.writeFileSync(path.join(outDir, 'README.txt'), readme, 'utf8');

// Zip with PowerShell Compress-Archive via spawning
const zipPath = path.join(__dirname, 'Christmas-Adventure-Calendar-illustrator-assets.zip');
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

// Remove tmp before zipping
fs.rmSync(tmpDir, { recursive: true, force: true });

const ps = spawnSync(
  'powershell.exe',
  [
    '-NoProfile',
    '-Command',
    `Compress-Archive -Path '${outDir}\\*' -DestinationPath '${zipPath}' -Force`,
  ],
  { encoding: 'utf8' },
);
if (ps.status !== 0) {
  console.error(ps.stderr || ps.stdout);
  process.exit(ps.status || 1);
}

console.log('\nZip:', zipPath);
console.log('Bytes:', fs.statSync(zipPath).size);
