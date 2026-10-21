/* Trace the abq_start scene node-by-node to find the loop. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.join(__dirname, "..");

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
  console: { log: console.log, warn: (...a) => warnings.push(a.join(" ")), error: (...a) => errors.push(a.join(" ")) },
  Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Set, Map, Uint8ClampedArray,
  parseInt, parseFloat, isNaN, isFinite, setTimeout: () => 0, clearTimeout: () => {},
  requestAnimationFrame: fn => rafQueue.push(fn), performance: { now: () => simTime },
  document: { readyState: "complete", addEventListener() {}, getElementById: id => id === "game" ? { width: 960, height: 600, getContext: makeCtx, addEventListener() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 600 }) } : null },
  AudioContext: undefined
};
const ctx = vm.createContext(sandbox);
vm.runInContext("globalThis.window=globalThis; var __L={}; globalThis.addEventListener=function(n,f){(__L[n]=__L[n]||[]).push(f);}; globalThis.removeEventListener=function(){}; globalThis.__fire=function(n,e){(__L[n]||[]).slice().forEach(function(f){try{f(e);}catch(err){globalThis.__err=err;}});};", ctx);

["js/core/util.js","js/core/input.js","js/core/audio.js","js/core/render.js","js/world/map.js","js/world/world.js","js/game/state.js","js/game/minigames.js","js/game/dialogue.js","js/game/notebook.js","js/game/quest.js","js/game/debrief.js","js/game/debug.js",
  "js/game/memory.js","js/data/story.js","js/data/learning.js","js/data/minigames/gift.js","js/data/minigames/travel.js","js/data/minigames/ball.js","js/main.js"]
  .forEach(f => { try { vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f }); } catch (e) { console.log("LOAD FAIL " + f + ": " + e.message); } });
const G = sandbox.window.G;

function frame(n = 1) {
  for (let i = 0; i < n; i++) {
    simTime += 16;
    const q = rafQueue; rafQueue = [];
    for (const fn of q) { try { fn(simTime); } catch (e) { console.log("FRAME ERR: " + e.message); } }
  }
}
frame(3);
vm.runInContext(`__fire("keydown",{key:"Enter",preventDefault:function(){}});`, ctx);
vm.runInContext(`__fire("keyup",{key:"Enter",preventDefault:function(){}});`, ctx);
frame(10);

// drain opening
let n = 0;
while (G.dialogue.isActive() && n++ < 30) {
  const info = G.debug.inspectNode();
  if (info.type === "say") G.debug.pick(0); else if (info.type === "choice" || info.type === "multi") G.debug.pick(0);
  frame(1);
}
console.log("after opening, beat=" + G.state.beat);

// start abq scene and trace
console.log("\n-- abq_start trace --");
G.debug.interact("abubakr");
frame(3);
let steps = 0;
const seen = [];
while (G.dialogue.isActive() && steps++ < 40) {
  const id = G.debug.nodeId();
  const info = G.debug.inspectNode();
  if (!info) { console.log("no info, breaking"); break; }
  const optIds = (info.options || []).map(o => o.id || "?").join(",");
  console.log(String(steps).padStart(2) + " " + String(id).padEnd(14) + " " + info.type.padEnd(7) + " typing=" + (info.typing ? "Y" : "n") + (optIds ? "  opts=[" + optIds + "]" : "") + "  beat=" + G.state.beat);

  if (info.type === "say" || info.type === "end") {
    G.debug.pick(0);
  } else if (info.type === "choice") {
    // pick option 2 (ABQ_2) to follow a specific branch
    G.debug.pick(1);
  } else if (info.type === "multi") {
    G.debug.pick(0);
  } else {
    break;
  }
  frame(2);
}
console.log("total steps: " + steps + "  dialogue active: " + G.dialogue.isActive() + "  beat now: " + G.state.beat);
console.log("notes: " + G.state.notes.length + "  trust: " + G.state.trust + "  journal: " + G.state.journal.length);
console.log("\nerrors: " + errors.length);
errors.slice(0, 6).forEach(e => console.log("  " + e));
