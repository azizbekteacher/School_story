/* Fix-ups after moving the shop and gate:
   - the gate sits further east, so Nodira is genuinely close
   - yard anchors that the new shop/gate zones swallowed move back into the yard
   A yard anchor that reports zone "shop" or "gate" would break the chapter-1
   "walk" trigger, so this is not cosmetic. */
const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "js/world/map.js");
let t = fs.readFileSync(p, "utf8");
let miss = 0;
function sub(from, to, label) {
  const n = t.split(from).length - 1;
  if (n !== 1) { console.log(`MISS ${label}: ${n}`); miss++; return; }
  t = t.split(from).join(to);
  console.log("ok   " + label);
}

sub(
  `    { id: "gate",      x: 22 * T, y: 24 * T, w: 6 * T, h: 14 * T },`,
  `    { id: "gate",      x: 24 * T, y: 24 * T, w: 6 * T, h: 14 * T },`,
  "gate zone: two tiles further east"
);

sub(
`    gate: [
      { x: 27, y: 35 }, { x: 26, y: 32 }, { x: 25, y: 36 },
      { x: 27, y: 30 }, { x: 26, y: 28 }, { x: 25, y: 33 }
    ],`,
`    gate: [
      { x: 29, y: 35 }, { x: 28, y: 32 }, { x: 27, y: 36 },
      { x: 29, y: 30 }, { x: 28, y: 28 }, { x: 27, y: 33 }
    ],`,
  "gate anchors: follow the zone east"
);

sub(
`      { x: 30, y: 26 }, { x: 24, y: 20 }, { x: 38, y: 22 },
      { x: 28, y: 14 }, { x: 34, y: 30 }, { x: 22, y: 30 }`,
`      { x: 30, y: 26 }, { x: 24, y: 20 }, { x: 33, y: 18 },
      { x: 28, y: 14 }, { x: 31, y: 28 }, { x: 22, y: 30 }`,
  "yard anchors: out of the shop and gate zones"
);

sub(
  `    decor.push({ type: "gatearch", x: 26 * T, y: 34 * T - 4 });`,
  `    decor.push({ type: "gatearch", x: 28 * T, y: 34 * T - 4 });`,
  "gate arch: follow the gate"
);

fs.writeFileSync(p, t);
console.log(miss ? `\n${miss} anchor(s) missed` : "\nfix-ups applied");
if (miss) process.exitCode = 1;
