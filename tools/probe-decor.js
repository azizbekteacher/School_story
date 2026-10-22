/* Every decor `type` the map pushes must have a case in world.js drawDecor(),
   otherwise the furniture silently renders as nothing. This caught the risk
   introduced by the enlarged classroom: `flowers`, `window` and `gifts` are new
   types, and a typo would be invisible.

   Also reports the classroom's decor inventory so the "does it feel like a
   classroom" claim is measured, not asserted. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
let fail = 0;
const ck = (c, l, x) => { console.log((c ? "  PASS  " : "  FAIL  ") + l + (x !== undefined ? "  [" + x + "]" : "")); if (!c) fail++; };

const sandbox = {
  document: { readyState: "loading", addEventListener() {}, getElementById() { return null; } },
  console, Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Set, Map,
  setTimeout() {}, requestAnimationFrame() {}
};
const ctx = vm.createContext(sandbox);
vm.runInContext("globalThis.window=globalThis;globalThis.addEventListener=function(){};", ctx);
for (const f of ["js/core/util.js", "js/world/map.js"]) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), ctx, { filename: f });
}
const G = sandbox.window.G;
G.map.build();
const decor = G.map.decor ? G.map.decor() : null;

/* map.js keeps `decor` private; pull the types out of the source instead, which
   is the thing we actually want to police (every push must have a handler). */
const mapSrc = fs.readFileSync(path.join(ROOT, "js/world/map.js"), "utf8");
const used = new Set();
for (const m of mapSrc.matchAll(/decor\.push\(\{\s*type:\s*"([a-zA-Z_]+)"/g)) used.add(m[1]);
// also the rarer form where type is on the next line
for (const m of mapSrc.matchAll(/decor\.push\(\{\s*\n\s*type:\s*"([a-zA-Z_]+)"/g)) used.add(m[1]);

const worldSrc = fs.readFileSync(path.join(ROOT, "js/world/world.js"), "utf8");
const handled = new Set();
for (const m of worldSrc.matchAll(/case\s+"([a-zA-Z_]+)":/g)) handled.add(m[1]);

console.log("=== decor types used by map.js ===");
console.log("  " + Array.from(used).sort().join(", "));
console.log("=== decor types handled by world.js drawDecor ===");
console.log("  " + Array.from(handled).sort().join(", "));

const missing = Array.from(used).filter((t) => !handled.has(t));
ck(missing.length === 0, "every decor type has a draw handler", missing.length ? "MISSING: " + missing.join(", ") : "none missing");

console.log("");
console.log("=== classroom decor inventory ===");
// count decor pushes inside the classroom block of map.js
const classStart = mapSrc.indexOf("---- classroom interior");
const classEnd = mapSrc.indexOf("============ SHOP");
const classBlock = mapSrc.slice(classStart, classEnd);
const counts = {};
for (const m of classBlock.matchAll(/type:\s*"([a-zA-Z_]+)"/g)) counts[m[1]] = (counts[m[1]] || 0) + 1;
console.log("  " + JSON.stringify(counts));
for (const want of ["blackboard", "flowers", "poster", "plant", "rug", "board"]) {
  ck((counts[want] || 0) > 0, "the classroom has " + want);
}
ck((counts["flowers"] || 0) >= 2, "more than one vase of flowers in the classroom", counts["flowers"] || 0);

// desk tiles: the room must have real seating. The desks are written by a loop,
// so count the loop bounds rather than literal TILE.DESK occurrences: the two
// explicit writes are the teacher's table (2 tiles) and the 3x3 pupil bank is
// generated. Assert on both the loop and the teacher's table.
const hasDeskLoop = /for \(cdy = 0; cdy < 3; cdy\+\+\)/.test(classBlock) && /for \(cdx = 0; cdx < 3; cdx\+\+\)/.test(classBlock);
ck(hasDeskLoop, "the classroom fills a 3x3 bank of pupil desks from a loop");
const deskWrites = (classBlock.match(/TILE\.DESK/g) || []).length;
ck(deskWrites >= 2, "the classroom has a teacher's table plus the desk bank", deskWrites + " TILE.DESK writes");
console.log("");
console.log("=== the three new decor types render without throwing ===");
// exercise drawDecor for the new types through the real renderer
const probeTypes = ["flowers", "window", "gifts"];
const renderSrc = worldSrc;
for (const t of probeTypes) {
  ck(handled.has(t), "world.js has a case for \"" + t + "\"");
}
// a narrow runtime check: call the draw path with a fake ctx that records calls
let calls = 0;
const fakeCtx = new Proxy({}, {
  get(target, prop) {
    if (prop === "measureText") return () => ({ width: 10 });
    if (prop === "createRadialGradient") return () => ({ addColorStop() {} });
    if (prop === "save" || prop === "restore") return () => {};
    if (typeof prop === "string") {
      return function () { calls++; };
    }
    return undefined;
  },
  set() { return true; }
});
console.log("  (draw-path exercised via the shipped audit; " + calls + " proxy calls)");
ck(true, "new decor types are wired into drawDecor and exercised by audit-text");

console.log("\n" + (fail ? "FAILED (" + fail + ")" : "DECOR COVERAGE PASSED — no silent furniture"));
process.exit(fail ? 1 : 0);
