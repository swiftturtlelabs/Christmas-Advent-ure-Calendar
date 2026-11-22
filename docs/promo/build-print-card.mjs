/**
 * Round 3 — strictly based on #3 Scan First (not #2 Snow Hero).
 *
 * Keep from #3:
 *   - Full-bleed field (NO floating inner card/panel)
 *   - Oversized QR on the LEFT as the hero
 *   - “SCAN ME” under QR
 *   - Brand stacked on the RIGHT
 *   - Feature chips
 *
 * Add:
 *   - #4 candy-stripe ribbon across the top
 *   - Light site palette (snow/cream field, pine + holly type, gold accents)
 *   - Soft background “24” + gold from #5
 *   - Roomy safe margins
 *   - Bigger CamelCase URL: ChristmasAdventureCalendar.com
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import QRCode from 'qrcode';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOME_URL = 'https://christmasadventurecalendar.com/';
const DISPLAY_URL = 'ChristmasAdventureCalendar.com';
const fontsDir = path.join(__dirname, 'fonts');
const outDir = path.join(__dirname, 'designs-v3');

function b64(file) {
  return fs.readFileSync(file).toString('base64');
}

const fontFaces = `
@font-face {
  font-family: 'Mountains of Christmas';
  font-style: normal;
  font-weight: 700;
  src: url(data:font/woff2;base64,${b64(path.join(fontsDir, 'mountains-700.woff2'))}) format('woff2');
}
@font-face {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 500;
  src: url(data:font/woff2;base64,${b64(path.join(fontsDir, 'poppins-500.woff2'))}) format('woff2');
}
@font-face {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 600;
  src: url(data:font/woff2;base64,${b64(path.join(fontsDir, 'poppins-600.woff2'))}) format('woff2');
}
@font-face {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 700;
  src: url(data:font/woff2;base64,${b64(path.join(fontsDir, 'poppins-700.woff2'))}) format('woff2');
}
`;

const qr = await QRCode.toDataURL(HOME_URL, {
  margin: 2,
  width: 1024,
  errorCorrectionLevel: 'M',
  color: { dark: '#06251c', light: '#fffdf8' },
});

const shared = `
${fontFaces}
:root {
  --pine-950: #06251c;
  --pine-900: #0b3d2e;
  --pine-800: #124a37;
  --pine-700: #1a5c40;
  --pine-600: #22754f;
  --holly: #d63b3b;
  --holly-600: #b81f2c;
  --holly-700: #921821;
  --gold: #f5c04c;
  --gold-500: #e0a825;
  --gold-soft: #ffe08a;
  --snow: #fffdf8;
  --snow-100: #fbf6ea;
  --cream: #fff3d9;
  --ink: #172a22;
  --ink-muted: #4d6358;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
@page { size: 3.75in 2.25in; margin: 0; }
html, body {
  width: 3.75in; height: 2.25in; overflow: hidden;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
  background: #fff; font-family: 'Poppins', sans-serif;
}
.card {
  position: relative;
  width: 3.75in; height: 2.25in;
  overflow: hidden;
  color: var(--ink);
}
.qr-frame img {
  display: block; width: 100%; height: 100%; image-rendering: pixelated;
}

/* #4 ribbon — same candy stripe language as the site header */
.ribbon {
  position: absolute; left: 0; right: 0; top: 0; height: 0.36in;
  background: linear-gradient(180deg, rgba(11,61,46,0.96), rgba(11,61,46,0.88));
  border-bottom: 0.012in solid rgba(245,192,76,0.4);
  z-index: 2;
}
.ribbon::after {
  content: '';
  position: absolute; left: 0; right: 0; bottom: -0.05in; height: 0.05in;
  background-image: repeating-linear-gradient(
    90deg,
    var(--holly) 0 0.05in,
    transparent 0.05in 0.28in,
    var(--gold) 0.28in 0.34in,
    transparent 0.34in 0.55in,
    var(--pine-600) 0.55in 0.6in,
    transparent 0.6in 0.82in
  );
}
.ribbon-label {
  position: absolute; left: 0; right: 0; top: 0; height: 0.36in;
  display: flex; align-items: center; justify-content: center;
  z-index: 3;
  font-size: 0.09in; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--gold);
}

/* #3 scan-first grid — QR left hero, copy right */
.safe {
  position: absolute;
  /* below ribbon + roomy edge insets so type never crowds the cut */
  top: 0.52in; right: 0.40in; bottom: 0.34in; left: 0.38in;
  display: grid;
  grid-template-columns: 1.12in 1fr;
  column-gap: 0.18in;
  align-items: center;
  z-index: 1;
}
.qr-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 0.05in;
}
.qr-frame {
  width: 1.08in; height: 1.08in; padding: 0.048in;
  background: var(--snow);
}
.scan-label {
  font-size: 0.082in; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase;
}
.copy {
  display: flex; flex-direction: column; min-width: 0; justify-content: center;
}
.brand {
  font-family: 'Mountains of Christmas', Georgia, serif;
  font-weight: 700; line-height: 0.95; margin-bottom: 0.07in;
}
.hook {
  font-weight: 500; line-height: 1.28; margin-bottom: 0.09in;
}
.chips { display: flex; flex-wrap: wrap; gap: 0.04in; margin-bottom: 0.1in; }
.chip {
  font-size: 0.075in; font-weight: 600;
  padding: 0.025in 0.07in;
}
.url {
  font-weight: 700; letter-spacing: -0.01em; line-height: 1.15;
}
.watermark {
  position: absolute;
  font-family: 'Mountains of Christmas', Georgia, serif;
  font-weight: 700; line-height: 1;
  pointer-events: none; user-select: none; z-index: 0;
}
`;

/** @type {{ id: string, name: string, blurb: string, html: string }[]} */
const designs = [];

// -----------------------------------------------------------------------------
// A) Light Scan First — #3 layout inverted to snow/cream full bleed
// -----------------------------------------------------------------------------
designs.push({
  id: 'A-light-scan-first',
  name: 'Light Scan First',
  blurb: 'Straight #3 layout on a full-bleed cream field; URL in the ribbon header',
  html: `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>Light Scan First</title>
<style>
${shared}
.card {
  background:
    radial-gradient(circle at 88% 78%, rgba(245,192,76,0.14), transparent 42%),
    radial-gradient(circle at 10% 30%, rgba(214,59,59,0.06), transparent 40%),
    linear-gradient(165deg, var(--snow) 0%, var(--snow-100) 55%, var(--cream) 100%);
}
.ribbon-label {
  font-size: 0.11in;
  letter-spacing: 0.02em;
  text-transform: none;
  font-weight: 700;
}
.watermark {
  right: 0.12in; top: 58%; transform: translateY(-50%);
  font-size: 1.75in; color: rgba(245,192,76,0.18);
}
.qr-frame { box-shadow: inset 0 0 0 0.016in var(--gold); }
.scan-label { color: var(--pine-800); }
.brand { font-size: 0.275in; color: var(--pine-900); margin-bottom: 0.05in; }
.free-badge {
  align-self: flex-start;
  font-size: 0.085in; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--pine-950);
  background: linear-gradient(135deg, var(--gold-soft), var(--gold));
  padding: 0.03in 0.09in; margin-bottom: 0.06in;
}
.hook { font-size: 0.105in; color: var(--ink-muted); margin-bottom: 0.08in; }
.chip {
  color: var(--pine-950);
  background: linear-gradient(135deg, var(--gold-soft), var(--gold));
}
</style></head><body>
<article class="card">
  <div class="ribbon" aria-hidden="true"></div>
  <p class="ribbon-label">${DISPLAY_URL}</p>
  <div class="watermark" aria-hidden="true">24</div>
  <div class="safe">
    <div class="qr-wrap">
      <div class="qr-frame"><img src="${qr}" alt="" /></div>
      <p class="scan-label">Scan me</p>
    </div>
    <div class="copy">
      <h1 class="brand">Christmas<br />Advent-ure<br />Calendar</h1>
      <p class="free-badge">For free</p>
      <p class="hook">A personalized Christmas<br />adventure, one day at a time.</p>
      <div class="chips">
        <span class="chip">Daily surprises</span>
        <span class="chip">Secret riddles</span>
        <span class="chip">Printable QR codes for each day</span>
      </div>
    </div>
  </div>
</article>
</body></html>`,
});

// -----------------------------------------------------------------------------
// B) Gold Pulse — same #3 bones, stronger gold (from #5)
// -----------------------------------------------------------------------------
designs.push({
  id: 'B-gold-pulse',
  name: 'Gold Pulse',
  blurb: '#3 bones with stronger gold frame, badge SCAN ME, warmer 24',
  html: `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>Gold Pulse</title>
<style>
${shared}
.card {
  background:
    radial-gradient(circle at 18% 70%, rgba(245,192,76,0.22), transparent 45%),
    radial-gradient(circle at 92% 25%, rgba(224,168,37,0.16), transparent 40%),
    linear-gradient(160deg, #fffef9, var(--cream));
}
.watermark {
  left: 0.05in; bottom: -0.15in;
  font-size: 1.9in; color: rgba(245,192,76,0.26);
}
.qr-frame {
  box-shadow:
    inset 0 0 0 0.018in var(--gold),
    0 0 0 0.028in rgba(245,192,76,0.28);
}
.scan-label {
  color: var(--pine-950);
  background: linear-gradient(135deg, var(--gold-soft), var(--gold-500));
  padding: 0.028in 0.09in;
  letter-spacing: 0.12em;
}
.brand { font-size: 0.285in; color: var(--pine-900); }
.hook { font-size: 0.11in; color: var(--ink-muted); }
.chip {
  color: var(--pine-950);
  background: var(--gold);
}
.url {
  font-size: 0.115in; color: var(--pine-900);
  border-top: 0.012in solid rgba(245,192,76,0.5);
  padding-top: 0.06in; margin-top: 0.02in;
}
</style></head><body>
<article class="card">
  <div class="ribbon" aria-hidden="true"></div>
  <p class="ribbon-label">24 days of magic</p>
  <div class="watermark" aria-hidden="true">24</div>
  <div class="safe">
    <div class="qr-wrap">
      <div class="qr-frame"><img src="${qr}" alt="" /></div>
      <p class="scan-label">Scan me</p>
    </div>
    <div class="copy">
      <h1 class="brand">Christmas<br />Advent-ure<br />Calendar</h1>
      <p class="hook">A personalized Christmas<br />adventure, one day at a time.</p>
      <div class="chips">
        <span class="chip">Daily surprises</span>
        <span class="chip">Secret riddles</span>
        <span class="chip">QR days</span>
      </div>
      <p class="url">${DISPLAY_URL}</p>
    </div>
  </div>
</article>
</body></html>`,
});

// -----------------------------------------------------------------------------
// C) Holly Scan — #3 + site hero holly title treatment
// -----------------------------------------------------------------------------
designs.push({
  id: 'C-holly-scan',
  name: 'Holly Scan',
  blurb: '#3 layout with site holly-red title; quiet gold 24 behind QR',
  html: `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>Holly Scan</title>
<style>
${shared}
.card {
  background:
    radial-gradient(circle at 80% 20%, rgba(184,31,44,0.06), transparent 38%),
    linear-gradient(165deg, var(--snow), #f8f3e8);
}
.watermark {
  left: 0.2in; top: 58%; transform: translateY(-50%);
  font-size: 1.65in; color: rgba(245,192,76,0.15);
}
.qr-frame { box-shadow: inset 0 0 0 0.015in var(--pine-900); }
.scan-label { color: var(--holly-600); }
.brand {
  font-size: 0.29in;
  background: linear-gradient(135deg, var(--holly-600), var(--holly-700));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.hook { font-size: 0.11in; color: var(--ink-muted); }
.chip {
  color: var(--pine-800);
  background: var(--snow-100);
  border: 0.01in solid #e9dfc4;
}
.url { font-size: 0.112in; color: var(--pine-800); }
</style></head><body>
<article class="card">
  <div class="ribbon" aria-hidden="true"></div>
  <p class="ribbon-label">24 days of magic</p>
  <div class="watermark" aria-hidden="true">24</div>
  <div class="safe">
    <div class="qr-wrap">
      <div class="qr-frame"><img src="${qr}" alt="" /></div>
      <p class="scan-label">Scan me</p>
    </div>
    <div class="copy">
      <h1 class="brand">Christmas<br />Advent-ure<br />Calendar</h1>
      <p class="hook">A personalized Christmas<br />adventure, one day at a time.</p>
      <div class="chips">
        <span class="chip">Daily surprises</span>
        <span class="chip">Secret riddles</span>
        <span class="chip">QR days</span>
      </div>
      <p class="url">${DISPLAY_URL}</p>
    </div>
  </div>
</article>
</body></html>`,
});

// -----------------------------------------------------------------------------
// D) Wide Scan — #3 with even more air; slightly larger URL
// -----------------------------------------------------------------------------
designs.push({
  id: 'D-wide-scan',
  name: 'Wide Scan',
  blurb: '#3 with the most edge breathing room and largest URL',
  html: `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>Wide Scan</title>
<style>
${shared}
.card {
  background:
    radial-gradient(circle at 70% 85%, rgba(245,192,76,0.12), transparent 45%),
    linear-gradient(170deg, #fffdf8 0%, #fbf6ea 100%);
}
.safe {
  top: 0.54in; right: 0.46in; bottom: 0.38in; left: 0.42in;
  grid-template-columns: 1.05in 1fr;
  column-gap: 0.2in;
}
.watermark {
  right: 0.2in; top: 55%; transform: translateY(-50%);
  font-size: 1.55in; color: rgba(245,192,76,0.17);
}
.qr-frame {
  width: 1.02in; height: 1.02in;
  box-shadow: inset 0 0 0 0.016in var(--gold);
}
.scan-label { color: var(--pine-700); }
.brand { font-size: 0.275in; color: var(--pine-900); }
.hook { font-size: 0.108in; color: var(--ink-muted); margin-bottom: 0.1in; }
.chip {
  color: var(--pine-950);
  background: linear-gradient(135deg, var(--gold-soft), var(--gold));
}
.url { font-size: 0.12in; color: var(--pine-900); }
</style></head><body>
<article class="card">
  <div class="ribbon" aria-hidden="true"></div>
  <p class="ribbon-label">24 days of magic</p>
  <div class="watermark" aria-hidden="true">24</div>
  <div class="safe">
    <div class="qr-wrap">
      <div class="qr-frame"><img src="${qr}" alt="" /></div>
      <p class="scan-label">Scan me</p>
    </div>
    <div class="copy">
      <h1 class="brand">Christmas<br />Advent-ure<br />Calendar</h1>
      <p class="hook">A personalized Christmas<br />adventure, one day at a time.</p>
      <div class="chips">
        <span class="chip">Daily surprises</span>
        <span class="chip">Secret riddles</span>
        <span class="chip">QR days</span>
      </div>
      <p class="url">${DISPLAY_URL}</p>
    </div>
  </div>
</article>
</body></html>`,
});

// -----------------------------------------------------------------------------
fs.mkdirSync(outDir, { recursive: true });

const chromeCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);
const chrome = chromeCandidates.find((p) => fs.existsSync(p));
if (!chrome) {
  console.error('No Chrome/Edge found');
  process.exit(1);
}

function runChrome(args) {
  const r = spawnSync(chrome, args, { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout || 'chrome failed');
    process.exit(r.status || 1);
  }
}

const rows = [];
for (const d of designs) {
  const htmlPath = path.join(outDir, `${d.id}.html`);
  const pdfPath = path.join(outDir, `${d.id}.pdf`);
  const pngPath = path.join(outDir, `${d.id}.png`);
  fs.writeFileSync(htmlPath, d.html, 'utf8');
  const fileUrl = pathToFileURL(htmlPath).href;
  runChrome([
    '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
    `--print-to-pdf=${pdfPath}`, '--print-to-pdf-no-header', fileUrl,
  ]);
  runChrome([
    '--headless=new', '--disable-gpu', `--screenshot=${pngPath}`,
    '--window-size=360,216', '--force-device-scale-factor=6',
    '--default-background-color=00000000', '--hide-scrollbars', fileUrl,
  ]);
  console.log(`✓ ${d.id} — ${d.name}`);
  rows.push(d);
}

const sheet = `<!doctype html><html lang="en"><head><meta charset="UTF-8" />
<title>Promo cards — round 3 (from #3)</title>
<style>
  body { font-family: Georgia, serif; background: #e8efe9; margin: 0; padding: 1.5rem; color: #172a22; }
  h1 { margin: 0 0 0.35rem; }
  .lead { margin: 0 0 0.75rem; color: #4d6358; max-width: 42rem; }
  .note { background: #fff8e6; border-left: 4px solid #f5c04c; padding: 0.75rem 1rem; margin-bottom: 1.25rem; max-width: 42rem; }
  .grid { display: grid; gap: 1.25rem; }
  figure { margin: 0; background: #fff; padding: 0.85rem; box-shadow: 0 8px 24px rgba(6,37,28,0.12); }
  img { display: block; width: 100%; max-width: 580px; height: auto; border: 1px solid #d5e0d8; }
  figcaption { margin-top: 0.55rem; }
  code { font-size: 0.85rem; background: #f3f7f4; padding: 0.1rem 0.35rem; }
</style></head><body>
<h1>Round 3 — rebuilt from #3 Scan First</h1>
<p class="lead">Same bones as the dark Scan First card you liked: big QR left, brand + chips right, “Scan me.”
  Light full-bleed field (not a floating #2-style panel), ribbon top, soft gold 24, roomy edges,
  URL <strong>${DISPLAY_URL}</strong>.</p>
<div class="note">Skipped the #1 / #2 approaches on purpose. These should read as “light #3 + ribbon.”</div>
<div class="grid">
${rows
  .map(
    (d, i) => `<figure>
  <img src="${d.id}.png" alt="${d.name}" />
  <figcaption><strong>${String.fromCharCode(65 + i)}. ${d.name}</strong> — ${d.blurb}<br />
  Print file: <code>${d.id}.pdf</code></figcaption>
</figure>`,
  )
  .join('\n')}
</div>
</body></html>`;

fs.writeFileSync(path.join(outDir, 'index.html'), sheet, 'utf8');
console.log('\nContact sheet:', path.join(outDir, 'index.html'));
