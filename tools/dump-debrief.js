/* Dump the debrief's teaching content for a completed run.
   Reuses the proven world-walk from tools/playtest.js. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.join(__dirname, "..");

const STRATEGY = (process.argv.find(a => a.startsWith("--strategy=")) || "--strategy=best").split("=")[1];

let simTime = 0, rafQueue = [];
const errors = [], warnings = [];

function makeCtx() {
  const c = { canvas: {}, globalAlpha: 1, fillStyle: "", strokeStyle: "", lineWidth: 1, font: "", textAlign: "", textBaseline: "" };
  ["save","restore","translate","scale","rotate","clearRect","fillRect","strokeRect","beginPath","closePath","moveTo","lineTo","arc","arcTo","ellipse","rect","fill","stroke","clip","fillText","strokeText","setTransform","resetTransform","quadraticCurveTo","bezierCurveTo","drawImage","putImageData","setLineDash","roundRect"].forEach(k => c[k] = () => {});
  c.measureText = t => ({ width: String(t).length * 6 });
  c.createLinearGradient = () => ({ addColorStop() {} });
  c.createRadialGradient = () => ({ addColorStop() {} });
  c.getImageData = () => ({ data: new Uint8ClampedArray(4) });
  return c;
}
const sandbox = {
  console: { log: () => {}, warn: (...a) => warnings.push(a.join(" ")), error: (...a) => errors.push(a.join(" ")) },
  Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Set, Map, Uint8ClampedArray,
  parseInt, parseFloat, isNaN, isFinite, setTimeout: () => 0, clearTimeout: () => {},
  requestAnimationFrame: fn => rafQueue.push(fn), performance: { now: () => simTime },
  document: { readyState: "complete", addEventListener() {}, getElementById: id => id === "game" ? { width: 960, height: 600, getContext: makeCtx, addEventListener() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 600 }) } : null },
  AudioContext: undefined
};
const ctx = vm.createContext(sandbox);
vm.runInContext("globalThis.window=globalThis; var __L={}; globalThis.addEventListener=function(n,f){(__L[n]=__L[n]||[]).push(f);}; globalThis.removeEventListener=function(){}; globalThis.__fire=function(n,e){(__L[n]||[]).slice().forEach(function(f){try{f(e);}catch(err){globalThis.__err=err;}});};", ctx);

["js/core/util.js","js/core/input.js","js/core/audio.js","js/core/render.js","js/world/map.js","js/world/world.js","js/game/state.js","js/game/minigames.js","js/game/dialogue.js","js/game/notebook.js","js/game/quest.js","js/game/debrief.js","js/game/debug.js","js/data/story.js","js/data/learning.js","js/data/minigames/gift.js","js/data/minigames/travel.js","js/data/minigames/ball.js","js/main.js"]
  .forEach(f => { try { vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f }); } catch (e) { console.log("LOAD FAIL " + f + ": " + e.message); } });
const G = sandbox.window.G;

function frame(n = 1) {
  for (let i = 0; i < n; i++) {
    simTime += 16;
    const q = rafQueue; rafQueue = [];
    for (const fn of q) { try { fn(simTime); } catch (e) { } }
  }
}
function tap(k) {
  vm.runInContext(`__fire("keydown",{key:${JSON.stringify(k)},preventDefault:function(){}});`, ctx);
  vm.runInContext(`__fire("keyup",{key:${JSON.stringify(k)},preventDefault:function(){}});`, ctx);
}

frame(3);
tap("Enter");
frame(10);

const learn = G.data.learning;
const notes = learn.choiceNotes || {};
const verdictScore = { good: 2, ok: 1, weak: -1, bad: -2 };
const scoreOf = id => (notes[id] ? (verdictScore[notes[id].verdict] || 0) : 0);
const sortPick = arr => {
  arr.sort((a, b) => STRATEGY === "worst" ? scoreOf(a.o.id) - scoreOf(b.o.id) : scoreOf(b.o.id) - scoreOf(a.o.id));
  return arr[0];
};

const PLAN = {
  arrive:    ["gate", 0, null],
  staffroom: ["staffroom", 0, "abubakr"],
  oqil:      ["staffroom", 1, "oqil"],
  mother:    ["gate", 1, "nodira"],
  lesson:    ["classroom", 0, null],
  timur:     ["classroom", 1, "timur"],
  gift:      ["shop", 0, "sardor"],
  report:    ["gate", 2, "nodira"]
};
const ZONES = ["gate", "staffroom", "classroom", "shop", "yard", "corridor"];
const ORDER = ["arrive","staffroom","oqil","mother","lesson","timur","gift","walk","report","done"];

let guard = 0;
while (guard++ < 4000) {
  frame(1);
  if (G.debrief.isVisible()) break;
  if (G.minigameHost.isActive()) { G.debug.forceMinigame(STRATEGY !== "worst"); frame(30); continue; }

  if (!G.dialogue.isActive()) {
    const beat = G.state.beat;
    const plan = PLAN[beat];
    let progressed = false;
    if (plan) {
      G.debug.gotoZone(plan[0], plan[1]);
      frame(5);
      if (!G.dialogue.isActive() && !G.debrief.isVisible() && plan[2]) {
        G.debug.interact(plan[2]);
        frame(5);
      }
      progressed = G.dialogue.isActive() || G.debrief.isVisible();
    }
    if (!progressed) {
      for (const z of ZONES) {
        G.debug.gotoZone(z, 0);
        frame(5);
        if (G.dialogue.isActive() || G.debrief.isVisible()) { progressed = true; break; }
      }
    }
    if (!progressed) break;
    continue;
  }

  const info = G.debug.inspectNode();
  if (!info) continue;
  if (info.type === "say") { G.debug.pick(0); continue; }
  if (info.type === "choice") {
    const usable = info.options.map((o, i) => ({ o, i })).filter(x => !x.o.locked);
    if (!usable.length) { G.debug.pick(0); continue; }
    G.debug.pick(sortPick(usable).i);
    continue;
  }
  if (info.type === "multi") {
    const node = G.dialogue.debugNode();
    const max = node.max || 99;
    let safety = 0;
    while (safety++ < 8) {
      const cur = G.debug.inspectNode();
      if (!cur || cur.type !== "multi") break;
      const pickedCount = (cur.options || []).filter(o => G.state.hasChosen(o.id)).length;
      if (pickedCount >= max) break;
      const remaining = cur.options.map((o, i) => ({ o, i })).filter(x => !x.o.locked && !G.state.hasChosen(x.o.id));
      if (!remaining.length) break;
      G.debug.pick(sortPick(remaining).i);
      frame(1);
    }
    const after = G.debug.inspectNode();
    if (after && after.type === "multi") { G.debug.finishMulti(); frame(1); }
    continue;
  }
  frame(1);
}

console.log("=== DEBRIEF (" + STRATEGY + ") ===");
console.log("visible: " + G.debrief.isVisible() + "   finished: " + G.state.finished);
const sum = G.debrief.getSummary();
if (!sum) { console.log("NO SUMMARY"); process.exit(1); }

console.log("\nkeys: " + Object.keys(sum).join(", "));

if (sum.headline) console.log("\nheadline: " + JSON.stringify(sum.headline));
if (typeof sum.score === "number") console.log("score: " + sum.score);
if (sum.archetype) console.log("archetype: " + JSON.stringify(sum.archetype));
if (sum.trust !== undefined) console.log("trust: " + sum.trust);

console.log("\n--- by principle ---");
(sum.byPrinciple || []).forEach(p => console.log("  " + p.id + " " + (p.name || "") + "  good=" + p.good + " bad=" + p.bad));

console.log("\n--- choice feedback ---");
(sum.choiceFeedback || []).forEach(c => {
  console.log("  [" + c.verdict + "] " + c.id + " — " + (c.title || ""));
  if (c.why) console.log("      why: " + String(c.why).slice(0, 150));
  if (c.alternative) console.log("      alt: " + String(c.alternative).slice(0, 150));
});

console.log("\n--- ideas (" + ((sum.ideas || []).length) + ") ---");
(sum.ideas || []).forEach((i, n) => {
  console.log("  " + (n + 1) + ". " + (i.title || i.what || ""));
  if (i.what && i.title) console.log("     what: " + String(i.what).slice(0, 160));
  if (i.difficulty) console.log("     difficult: " + String(i.difficulty).slice(0, 160));
});

console.log("\n--- difficulties (" + ((sum.difficulties || []).length) + ") ---");
(sum.difficulties || []).forEach((d, n) => {
  console.log("  " + (n + 1) + ". " + (d.title || d.text || ""));
  if (d.why) console.log("     " + String(d.why).slice(0, 160));
});

console.log("\n--- notes applied (" + G.state.notes.length + ") ---");
G.state.notes.forEach(nn => {
  const p = (learn.principles || {})[nn.principle];
  console.log("  [" + nn.principle + (p ? " " + (p.name || p.title) : "") + "] " + nn.verdict);
  console.log("     " + String(nn.text).slice(0, 180));
});

console.log("\n--- journal ---");
G.state.journal.forEach(j => console.log("  ~ " + (typeof j === "string" ? j : JSON.stringify(j))));

console.log("\nfinal state: " + JSON.stringify(G.debug.summary()));
console.log("errors: " + errors.length + "  warnings: " + warnings.length);
[...new Set(errors)].slice(0, 6).forEach(e => console.log("  ERR " + e));
[...new Set(warnings)].slice(0, 6).forEach(w => console.log("  WARN " + w));
