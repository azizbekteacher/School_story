/* Inventory every colour literal used by the game's JS, with frequency and the
   file it appears in. Used to plan the "too dark" palette pass rationally
   instead of guessing which values matter. */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!/tools|shots|\.git/.test(p)) walk(p); }
    else if (/\.(js|css)$/.test(e.name)) files.push(p);
  }
})(root);

const counts = new Map();
const where = new Map();

// #rgb / #rrggbb
const HEX = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
// rgba(r,g,b,a) and rgb(r,g,b)
const RGBA = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/g;

function hexToRgb(h) {
  h = h.slice(1);
  if (h.length === 3) h = h.split("").map(c => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function lum(rgb) {
  // relative luminance, 0..1
  return (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
}
function record(key, rgb, file, alpha) {
  counts.set(key, (counts.get(key) || 0) + 1);
  if (!where.has(key)) where.set(key, new Set());
  where.get(key).add(path.relative(root, file));
  if (alpha !== undefined) {
    const k2 = key + " a=" + alpha;
    counts.set(k2, (counts.get(k2) || 0) + 1);
  }
}

for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  let m;
  while ((m = HEX.exec(src))) record(m[0], hexToRgb(m[0]), f);
  while ((m = RGBA.exec(src))) {
    const rgb = [Number(m[1]), Number(m[2]), Number(m[3])];
    const hex = "#" + rgb.map(v => v.toString(16).padStart(2, "0")).join("");
    const a = m[4] === undefined ? "1" : m[4];
    record(hex, rgb, f, a);
  }
}

const rows = [];
for (const [key, n] of counts) {
  if (/ a=/.test(key)) continue;
  const rgb = key.startsWith("#") ? hexToRgb(key) : null;
  if (!rgb) continue;
  const L = lum(rgb);
  rows.push({ key, n, L: Math.round(L * 100), files: [...(where.get(key) || [])] });
}

rows.sort((a, b) => a.L - b.L);

const dark = rows.filter(r => r.L < 30);
const light = rows.filter(r => r.L >= 30);

console.log("=== COLOUR INVENTORY ===");
console.log(`total distinct colours: ${rows.length}\n`);

console.log("--- DARKEST 30 (luminance < 30% — these are the 'too dark' offenders) ---");
console.log("lum%  count  colour     used in");
for (const r of dark.slice(0, 30)) {
  console.log(`${String(r.L).padStart(3)}%  ${String(r.n).padStart(5)}  ${r.key}  ${r.files.join(", ")}`);
}

const darkTotal = dark.reduce((a, r) => a + r.n, 0);
const allTotal = rows.reduce((a, r) => a + r.n, 0);
console.log(`\ndark usages: ${darkTotal}/${allTotal} (${Math.round(darkTotal / allTotal * 100)}% of all colour literals)`);
console.log(`distinct dark colours: ${dark.length}`);

console.log("\n--- BRIGHTEST 12 ---");
for (const r of light.slice(-12).reverse()) {
  console.log(`${String(r.L).padStart(3)}%  ${String(r.n).padStart(5)}  ${r.key}  ${r.files.join(", ")}`);
}

// Highlight the biggest single offenders by weighted darkness
console.log("\n--- BIGGEST DARKNESS CONTRIBUTORS (count x (1-lum)) ---");
const weighted = dark.map(r => ({ ...r, w: r.n * (1 - r.L / 100) })).sort((a, b) => b.w - a.w);
for (const r of weighted.slice(0, 15)) {
  console.log(`w=${r.w.toFixed(1).padStart(6)}  ${r.key} (lum ${r.L}%, n=${r.n})  ${r.files.join(", ")}`);
}
