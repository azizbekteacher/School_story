/* One-shot palette lift: replace the known dark panel/overlay/backdrop fills with
   lighter warm equivalents. Every replacement is asserted, so a silent no-op
   (stale string, typo) fails loudly instead of half-applying the change.
   Kept as a record of exactly what the lightening pass changed. */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

// [file, from, to, expectedCount]
const EDITS = [
  // ---- full-screen backdrops (appear behind the title, notebook, debrief) ----
  ["js/main.js", 'ctx.fillStyle = "#0a0908";', 'ctx.fillStyle = "#332c25";', 1],
  ["js/main.js", 'ctx.fillStyle = "#0e0b09";', 'ctx.fillStyle = "#3a322a";', 1],
  ["js/main.js", 'ctx.fillStyle = "#0a0807";', 'ctx.fillStyle = "#332c25";', 1],
  ["js/game/notebook.js", 'ctx.fillStyle = "#0a0908";', 'ctx.fillStyle = "#3d342b";', 1],
  ["js/game/debrief.js", 'ctx.fillStyle = "rgba(8,7,6," + (0.93 * e) + ")";', 'ctx.fillStyle = "rgba(52,44,36," + (0.93 * e) + ")";', 1],

  // ---- dialogue / minigame scrims ----
  ["js/game/dialogue.js", 'g.addColorStop(0, "rgba(10,9,8,0)");', 'g.addColorStop(0, "rgba(34,28,23,0)");', 1],
  ["js/game/dialogue.js", 'g.addColorStop(0.35, "rgba(10,9,8,.55)");', 'g.addColorStop(0.35, "rgba(34,28,23,.40)");', 1],
  ["js/game/dialogue.js", 'g.addColorStop(1, "rgba(10,9,8,.88)");', 'g.addColorStop(1, "rgba(34,28,23,.70)");', 1],
  ["js/game/minigames.js", 'ctx.fillStyle = "rgba(10,9,8,.72)";', 'ctx.fillStyle = "rgba(42,36,30,.58)";', 1],

  // ---- the main dialogue / minigame / notebook panels ----
  ["js/game/dialogue.js", 'fill: "rgba(22,18,15,.96)", stroke: "rgba(217,164,76,.5)", radius: 10', 'fill: "rgba(74,63,51,.96)", stroke: "rgba(232,196,128,.55)", radius: 10', 1],
  ["js/game/dialogue.js", 'fill: "rgba(22,18,15,.96)", stroke: "rgba(120,170,190,.55)", radius: 10', 'fill: "rgba(74,63,51,.96)", stroke: "rgba(150,196,214,.6)", radius: 10', 1],
  ["js/game/minigames.js", 'fill: "rgba(24,20,17,.97)",', 'fill: "rgba(74,63,51,.97)",', 1],
  ["js/game/notebook.js", 'fill: "rgba(26,22,18,.985)",', 'fill: "rgba(78,66,53,.985)",', 1],
  ["js/game/debrief.js", 'fill: "rgba(24,20,17,.99)",', 'fill: "rgba(72,61,49,.99)",', 1],
  ["js/game/quest.js", 'fill: "rgba(20,17,14,.82)", stroke: "rgba(217,164,76,.35)", radius: 9', 'fill: "rgba(68,58,47,.85)", stroke: "rgba(232,196,128,.45)", radius: 9', 1],
  ["js/game/quest.js", 'fill: "rgba(20,17,14,.86)", stroke: "rgba(217,164,76,.35)", radius: 9', 'fill: "rgba(68,58,47,.88)", stroke: "rgba(232,196,128,.45)", radius: 9', 1],
  ["js/main.js", 'fill: "rgba(20,17,14,.72)", stroke: "rgba(217,164,76,.22)", radius: 8', 'fill: "rgba(66,56,45,.78)", stroke: "rgba(232,196,128,.3)", radius: 8', 1],

  // ---- inner cards inside the debrief / notebook ----
  ["js/game/debrief.js", 'fill: "rgba(46,40,30,.6)", stroke: "rgba(217,164,76,.4)", radius: 9', 'fill: "rgba(104,90,74,.62)", stroke: "rgba(232,196,128,.45)", radius: 9', 1],
  ["js/game/debrief.js", 'fill: "rgba(32,27,22,.75)",', 'fill: "rgba(94,80,66,.78)",', 1],
  ["js/game/debrief.js", 'fill: "rgba(30,34,28,.7)",', 'fill: "rgba(86,92,78,.72)",', 1],
  ["js/game/debrief.js", 'fill: "rgba(36,26,24,.72)", stroke: "rgba(196,85,63,.3)", radius: 7', 'fill: "rgba(100,82,76,.75)", stroke: "rgba(214,110,88,.38)", radius: 7', 1],
  ["js/game/notebook.js", 'fill: "rgba(46,60,44,.42)", stroke: "rgba(127,184,107,.3)", radius: 7', 'fill: "rgba(96,116,92,.45)", stroke: "rgba(127,184,107,.4)", radius: 7', 1],
  ["js/game/notebook.js", 'fill: "rgba(40,34,28,.7)", stroke: "rgba(217,164,76,.3)", radius: 7', 'fill: "rgba(96,82,68,.72)", stroke: "rgba(232,196,128,.4)", radius: 7', 1],
];

let ok = 0, fail = 0;
for (const [file, from, to, expect] of EDITS) {
  const p = path.join(root, file);
  let src = fs.readFileSync(p, "utf8");
  const found = src.split(from).length - 1;
  if (found !== expect) {
    console.log(`MISS  ${file}\n      expected ${expect} occurrence(s), found ${found}\n      ${from.slice(0, 70)}`);
    fail++;
    continue;
  }
  src = src.split(from).join(to);
  fs.writeFileSync(p, src);
  console.log(`ok    ${file}  (${found})  ${from.slice(0, 46)}… → ${to.slice(0, 46)}…`);
  ok++;
}
console.log(`\n${ok} applied, ${fail} missed`);
if (fail) process.exitCode = 1;
