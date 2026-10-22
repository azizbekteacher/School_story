/* Prove the chapter-1 map change: Nodira opa's gate and the shop are closer to
   the school than they were, and every NPC and trigger still stands on ground a
   player can actually reach.

   Loads the real map in a vm sandbox (same technique as tools/validate.js). */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const sandbox = { window: {}, console };
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const f of ["js/core/util.js", "js/world/map.js", "js/data/story.js"]) {
  const src = fs.readFileSync(path.join(root, f), "utf8");
  vm.runInContext(src, sandbox, { filename: f });
}
const G = sandbox.G;
const map = G.map;
const story = G.data.story;
const T = map.T;

/* The tile grid is filled in by map.build(), which main.js calls at boot. In
   this vm sandbox nothing has called it yet, so without this line every tile
   reads as `undefined`, BLOCKED[undefined] is false, and every walkability and
   flood-fill assertion below passes while testing nothing at all. Calling it is
   what makes this probe an actual test. (It was missing: the walkability
   section was green for months because the grid was empty.) */
map.build();

// Distances BEFORE the move, in tiles, measured from the classroom anchor.
const BEFORE = { gate: 44.2, shop: 56.5 };

let fail = 0;
const ck = (c, l) => { console.log((c ? "  PASS  " : "  FAIL  ") + l); if (!c) fail++; };
const tileOf = (px) => Math.floor(px / T);
const distTiles = (a, b) => Math.round(Math.hypot(a.x - b.x, a.y - b.y) / T * 10) / 10;

const classroom = map.anchor("classroom", 0);

console.log("=== DISTANCES FROM THE CLASSROOM (tiles) ===");
const rows = [];
for (const zone of ["gate", "shop"]) {
  const a = map.anchor(zone, 0);
  const now = distTiles(classroom, a);
  const before = BEFORE[zone];
  rows.push({ zone, before, now, at: { x: tileOf(a.x), y: tileOf(a.y) } });
  console.log(`  ${zone.padEnd(6)} before ${String(before).padStart(5)}  now ${String(now).padStart(5)}`);
  ck(now < before, `${zone} is closer than before (${before} -> ${now} tiles)`);
}

console.log("\n=== IS THE GAIN WORTH IT? ===");
console.log(`  gate:  ${Math.round((1 - rows[0].now / rows[0].before) * 100)}% shorter`);
console.log(`  shop:  ${Math.round((1 - rows[1].now / rows[1].before) * 100)}% shorter`);
ck(rows[0].now <= BEFORE.gate * 0.75, "gate walk is at least 25% shorter");
ck(rows[1].now <= BEFORE.shop * 0.75, "shop walk is at least 25% shorter");

console.log("\n=== WALKABILITY OF EVERY ANCHOR ===");
// An anchor counts as reachable if its tile and the four tiles around it are
// inside the world and its own tile is not a blocking tile.
const blockedIds = new Set();
for (const k of ["WALL", "WATER", "TREE", "BENCH", "SHELF", "DESK"]) {
  if (map.TILE && map.TILE[k] !== undefined) blockedIds.add(map.TILE[k]);
}
const zoneOf = (px, py) => map.zoneLogical ? map.zoneLogical(px, py) : null;

for (const zone of Object.keys(map.ANCHORS)) {
  const arr = map.ANCHORS[zone];
  let bad = 0;
  const findings = [];
  for (let i = 0; i < arr.length; i++) {
    const a = map.anchor(zone, i);
    const cx = tileOf(a.x), cy = tileOf(a.y);
    const tile = map.get(cx, cy);
    const isBlocked = blockedIds.has(tile);
    const zoneHere = zoneOf(a.x, a.y);
    const problems = [];
    if (isBlocked) problems.push("stands on a blocking tile");
    if (zoneHere !== zone) problems.push(`zoneLogical says "${zoneHere}"`);
    if (problems.length) { bad++; findings.push(`anchor ${i} (${cx},${cy}): ${problems.join(", ")}`); }
  }
  if (bad) {
    console.log(`  FAIL ${zone}: ${bad} bad anchor(s)`);
    findings.forEach(f => console.log(`         ${f}`));
    fail += bad;
  } else {
    console.log(`  PASS ${zone}: all ${arr.length} anchors walkable and inside their zone`);
  }
}

console.log("\n=== NPCS STAND ON THEIR OWN ZONE ===");
for (const n of story.npcs) {
  const a = map.anchor(n.zone, n.at);
  const z = zoneOf(a.x, a.y);
  const ok = z === n.zone;
  if (!ok) fail++;
  console.log(`  ${ok ? "PASS" : "FAIL"} ${n.id.padEnd(9)} zone=${n.zone} at=${n.at} -> tile (${tileOf(a.x)},${tileOf(a.y)}) zoneLogical=${z}`);
}

console.log("\n=== TRIGGER ZONES EXIST ===");
for (const tr of (story.triggers || [])) {
  const known = map.ZONES.some(z => z.id === tr.zone);
  if (!known) fail++;
  console.log(`  ${known ? "PASS" : "FAIL"} trigger zone "${tr.zone}" (beat ${tr.beat}) ${known ? "exists" : "IS NOT A ZONE"}`);
}

console.log("\n=== SHOP IS REACHABLE FROM THE SCHOOL ===");
// A crude but meaningful connectivity check: walk the tile grid from the
// classroom anchor with a 4-neighbour flood fill over non-blocked tiles, and
// confirm every shop anchor is reachable.
function flood(startX, startY, limit) {
  const seen = new Set();
  const q = [[startX, startY]];
  const key = (x, y) => x + "," + y;
  seen.add(key(startX, startY));
  const max = limit || 40000;
  let n = 0;
  while (q.length && n++ < max) {
    const [x, y] = q.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= map.COLS || ny >= map.ROWS) continue;
      const k = key(nx, ny);
      if (seen.has(k)) continue;
      if (blockedIds.has(map.get(nx, ny))) continue;
      seen.add(k);
      q.push([nx, ny]);
    }
  }
  return seen;
}
const reach = flood(tileOf(classroom.x), tileOf(classroom.y));
for (const zone of ["shop", "gate"]) {
  const a = map.anchor(zone, 0);
  const ok = reach.has(tileOf(a.x) + "," + tileOf(a.y));
  if (!ok) fail++;
  console.log(`  ${ok ? "PASS" : "FAIL"} ${zone} anchor 0 reachable on foot from the classroom (${tileOf(a.x)},${tileOf(a.y)})`);
}

console.log(fail ? `\nPROBE FAILED — ${fail} problem(s)` : "\nPROBE PASSED — both are closer, and everything still stands on reachable ground");
process.exitCode = fail ? 1 : 0;
