/* Print the rendered idea content including the 'how' variants, to confirm the
   debrief surfaces multiple implementation options. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.join(__dirname, "..");

let rafQueue = [], simTime = 0;
const errs = [], warns = [];
function makeCtx() {
  const c = {};
  ["save","restore","translate","scale","rotate","clearRect","fillRect","strokeRect","beginPath","closePath","moveTo","lineTo","arc","arcTo","ellipse","rect","fill","stroke","clip","fillText","strokeText","setTransform","resetTransform","quadraticCurveTo","bezierCurveTo","drawImage","putImageData","setLineDash","roundRect"].forEach(k => c[k] = () => {});
  c.measureText = t => ({ width: String(t).length * 6.2 });
  c.createLinearGradient = () => ({ addColorStop() {} });
  c.createRadialGradient = () => ({ addColorStop() {} });
  c.getImageData = () => ({ data: new Uint8ClampedArray(4) });
  return c;
}
const sb = {
  console: { log: () => {}, warn: (...a) => warns.push(a.join(" ")), error: (...a) => errs.push(a.join(" ")) },
  Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Set, Map, Uint8ClampedArray,
  parseInt, parseFloat, isNaN, isFinite, setTimeout: () => 0, clearTimeout: () => {},
  requestAnimationFrame: f => rafQueue.push(f), performance: { now: () => simTime },
  document: { readyState: "complete", addEventListener() {}, getElementById: id => id === "game" ? { width: 960, height: 600, getContext: makeCtx, addEventListener() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 600 }) } : null },
  AudioContext: undefined
};
const ctx = vm.createContext(sb);
vm.runInContext("globalThis.window=globalThis; var __L={}; globalThis.addEventListener=function(n,f){(__L[n]=__L[n]||[]).push(f);}; globalThis.removeEventListener=function(){}; globalThis.__fire=function(n,e){(__L[n]||[]).slice().forEach(function(f){try{f(e);}catch(x){}});};", ctx);
["js/core/util.js","js/core/input.js","js/core/audio.js","js/core/render.js","js/world/map.js","js/world/world.js","js/game/state.js","js/game/minigames.js","js/game/dialogue.js","js/game/notebook.js","js/game/quest.js","js/game/debrief.js","js/game/debug.js",
  "js/game/memory.js","js/data/story.js","js/data/learning.js",
  "js/data/chapter2.js",
  "js/data/chapter2-learning.js",
  "js/data/chapters.js","js/data/minigames/gift.js","js/data/minigames/travel.js","js/data/minigames/ball.js",
  "js/data/minigames/chapter2.js","js/main.js"]
  .forEach(f => { try { vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f }); } catch (e) { console.log("LOAD " + f + " " + e.message); } });
const G = sb.window.G;

const L = G.data.learning;
console.log("=== IDEA RENDERING CHECK ===\n");
console.log("ideas: " + L.ideas.length + "\n");
let withHow = 0, howCount = 0;
L.ideas.forEach((idea, i) => {
  const how = idea.how || [];
  if (how.length) withHow++;
  howCount += how.length;
  console.log((i + 1) + ". " + idea.title + (idea.firstWeek ? "  [firstWeek]" : ""));
  console.log("   what: " + idea.what);
  how.forEach(h => console.log("   › " + h));
  console.log("   qiyin: " + String(idea.difficulty).slice(0, 120) + "...");
  console.log("");
});
console.log(`ideas with 'how' variants: ${withHow}/${L.ideas.length}, total variants: ${howCount}`);

console.log("\n=== DIFFICULTY RENDERING CHECK ===\n");
L.difficulties.forEach((d, i) => {
  console.log((i + 1) + ". " + d.title);
  console.log("   " + String(d.why).slice(0, 150));
  if (d.mitigation) console.log("   yordam: " + String(d.mitigation).slice(0, 150));
  console.log("");
});

// count how many principles map to each choice note
console.log("=== COVERAGE ===");
console.log("choiceNotes: " + Object.keys(L.choiceNotes).length);
console.log("principles: " + Object.keys(L.principles).length);
console.log("archetypes: " + L.archetypes.length);

// which of the doc'd choice ids are actually reachable in the mission?
const reach = new Set();
const scenes = G.data.story.scenes;
for (const sk in scenes) {
  for (const nk in scenes[sk].nodes) {
    const n = scenes[sk].nodes[nk];
    (n.options || []).forEach(o => { if (o.id) reach.add(o.id); });
  }
}
console.log("story choice ids wired: " + reach.size);
const documented = Object.keys(L.choiceNotes).filter(k => !/^(GIFT_|TRAVEL_|BALL_)/.test(k));
const missing = documented.filter(k => !reach.has(k));
console.log("documented story ids: " + documented.length + "  missing from story: " + missing.length + (missing.length ? " -> " + missing.join(",") : ""));
const extra = [...reach].filter(k => !L.choiceNotes[k]);
console.log("story ids with no note: " + extra.length + (extra.length ? " -> " + extra.join(",") : ""));
