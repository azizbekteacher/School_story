/* Chapter 1 map change: bring Nodira opa's gate and the shop nearer the school.
   Asserted, atomic, and reversible — chapter 1 is a fixed point in this project.

   Before (tile coords, classroom anchor 60,28):
     gate anchor 0 (16,32) -> 44.2 tiles
     shop anchor 0 ( 8,6) -> 56.5 tiles
   After: the gate moves east along the street, and the shop becomes a kiosk in
   the yard immediately west of the school, its door facing the yard. */
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

// ---- 1. zones: gate moves east, shop becomes a kiosk beside the school.
//         shop must precede yard in the array: zoneLogical takes the first hit,
//         and the kiosk rect now sits inside the yard rect.
sub(
`    { id: "street",    x: 0,   y: 0,   w: 18 * T, h: 40 * T },
    { id: "gate",      x: 14 * T, y: 24 * T, w: 6 * T, h: 14 * T },
    { id: "yard",      x: 18 * T, y: 0,   w: 27 * T, h: 40 * T },
    { id: "shop",      x: 3 * T,  y: 3 * T, w: 11 * T, h: 11 * T },`,
`    { id: "street",    x: 0,   y: 0,   w: 18 * T, h: 40 * T },
    { id: "gate",      x: 22 * T, y: 24 * T, w: 6 * T, h: 14 * T },
    { id: "shop",      x: 34 * T, y: 22 * T, w: 11 * T, h: 11 * T },
    { id: "yard",      x: 18 * T, y: 0,   w: 27 * T, h: 40 * T },`,
  "zones: gate east, shop beside the school"
);

// ---- 2. anchors: both moved nearer the school, all six still inside their zone
sub(
`    gate: [
      { x: 16, y: 32 }, { x: 16, y: 28 }, { x: 15, y: 34 },
      { x: 17, y: 30 }, { x: 16, y: 26 }, { x: 15, y: 31 }
    ],`,
`    gate: [
      { x: 27, y: 35 }, { x: 26, y: 32 }, { x: 25, y: 36 },
      { x: 27, y: 30 }, { x: 26, y: 28 }, { x: 25, y: 33 }
    ],`,
  "anchors: gate"
);
sub(
`    shop: [
      { x: 8, y: 6 }, { x: 6, y: 8 }, { x: 11, y: 9 },
      { x: 9, y: 11 }, { x: 5, y: 6 }, { x: 11, y: 5 }
    ],`,
`    shop: [
      { x: 37, y: 26 }, { x: 39, y: 26 }, { x: 41, y: 26 },
      { x: 37, y: 28 }, { x: 39, y: 28 }, { x: 41, y: 28 }
    ],`,
  "anchors: shop"
);

// ---- 3. remove the old shop building from the north-west corner
sub(
`    // ============ SHOP (x2..14, y2..14) ============
    strokeRect(2, 2, 13, 13, TILE.WALL);
    clearRect(3, 3, 11, 11, TILE.FLOOR);
    // door in the east wall -> street
    set(14, 7, TILE.DOOR);
    set(14, 8, TILE.DOOR);
    set(14, 9, TILE.DOOR);
    // shelves along the north wall (the four items sit here)
    fillRect(4, 3, 1, 1, TILE.SHELF);
    fillRect(6, 3, 1, 1, TILE.SHELF);
    fillRect(8, 3, 1, 1, TILE.SHELF);
    fillRect(10, 3, 1, 1, TILE.SHELF);
    fillRect(12, 3, 1, 1, TILE.SHELF);
    // counter
    fillRect(4, 11, 6, 1, TILE.SHELF);
    decor.push({ type: "rug", x: 8 * T, y: 8 * T, w: 7 * T, h: 4 * T, color: "#5a3a2e" });
    decor.push({ type: "lamp", x: 7 * T, y: 5 * T });
    decor.push({ type: "lamp", x: 12 * T, y: 9 * T });
    decor.push({ type: "sign", x: 8 * T, y: 2 * T - 6, text: "SARDOR SAVDO" });

`,
`    // ============ (the shop moved beside the school — see below) ============

`,
  "build: remove old north-west shop"
);

// ---- 4. the new shop: a kiosk in the yard, west of the school, door facing it
sub(
`    // ============ YARD DECOR ============`,
`    // ============ SHOP (x34..44, y22..32) — beside the school ============
    // A kiosk set into the yard, its door on the south wall onto the main path,
    // so the walk from the classroom is a few steps instead of a trek.
    strokeRect(34, 22, 11, 11, TILE.WALL);
    clearRect(35, 23, 9, 9, TILE.FLOOR);
    // door in the south wall -> yard / main path
    set(38, 32, TILE.DOOR);
    set(39, 32, TILE.DOOR);
    set(40, 32, TILE.DOOR);
    // shelves along the north wall (the four gift items sit here)
    fillRect(36, 23, 1, 1, TILE.SHELF);
    fillRect(38, 23, 1, 1, TILE.SHELF);
    fillRect(40, 23, 1, 1, TILE.SHELF);
    fillRect(42, 23, 1, 1, TILE.SHELF);
    // counter
    fillRect(36, 30, 6, 1, TILE.SHELF);
    // short path from the kiosk door down to the main path
    fillRect(38, 33, 3, 1, TILE.PATH);
    decor.push({ type: "rug", x: 37 * T, y: 25 * T, w: 5 * T, h: 4 * T, color: "#5a3a2e" });
    decor.push({ type: "lamp", x: 37 * T, y: 24 * T });
    decor.push({ type: "lamp", x: 42 * T, y: 28 * T });
    decor.push({ type: "sign", x: 35 * T, y: 22 * T - 6, text: "SARDOR SAVDO" });

    // ============ YARD DECOR ============`,
  "build: new shop beside the school"
);

// ---- 5. two trees now stand inside the kiosk; drop them
sub(
`      [20, 4], [24, 3], [40, 4], [43, 8], [20, 26], [42, 26],
      [24, 32], [40, 32], [36, 3], [22, 12], [41, 14], [19, 18],
      [43, 20], [26, 36], [37, 36]`,
`      [20, 4], [24, 3], [40, 4], [43, 8], [20, 26],
      [24, 32], [36, 3], [22, 12], [41, 14], [19, 18],
      [43, 20], [26, 36], [37, 36]`,
  "build: drop trees that stood where the kiosk is"
);

// ---- 6. the gate arch follows the gate east
sub(
`    decor.push({ type: "gatearch", x: 18 * T, y: 34 * T - 4 });`,
  `    decor.push({ type: "gatearch", x: 26 * T, y: 34 * T - 4 });`,
  "decor: gate arch follows the gate"
);

// ---- 7. gift-item pedestals move onto the new shelves
sub(
  `      buildSpots.push({ x: (5 + s * 2) * T, y: 3 * T + 8, index: s });`,
  `      buildSpots.push({ x: (36 + s * 2) * T, y: 23 * T + 8, index: s });`,
  "buildSpots: gift items on the new shelves"
);

fs.writeFileSync(p, t);
console.log(miss ? `\n${miss} anchor(s) missed` : "\nmap rewritten");
if (miss) process.exitCode = 1;
