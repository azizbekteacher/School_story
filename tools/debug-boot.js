/* Focused debug: boot, then step through the world manually to see what the
   playtest harness is failing to do. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.join(__dirname, "..");

let simTime = 0, rafQueue = [];
const errors = [], warnings = [];

function makeCtx() {
  const c = { canvas: {}, globalAlpha: 1, fillStyle: "", strokeStyle: "", lineWidth: 1, font: "", textAlign: "", textBaseline: "" };
  const m = ["save","restore","translate","scale","rotate","clearRect","fillRect","strokeRect","beginPath","closePath","moveTo","lineTo","arc","arcTo","ellipse","rect","fill","stroke","clip","fillText","strokeText","setTransform","resetTransform","quadraticCurveTo","bezierCurveTo","drawImage","putImageData","setLineDash","roundRect"];
  m.forEach(k => c[k] = () => {});
  c.measureText = t => ({ width: String(t).length * 6 });
  c.createLinearGradient = () => ({ addColorStop() {} });
  c.createRadialGradient = () => ({ addColorStop() {} });
  c.getImageData = () => ({ data: new Uint8ClampedArray(4) });
  return c;
}

const sandbox = {
  console: { log: console.log, warn: (...a) => warnings.push(a.join(" ")), error: (...a) => errors.push(a.join(" ")) },
  Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Set, Map, Uint8ClampedArray,
  parseInt, parseFloat, isNaN, isFinite,
  setTimeout: () => 0, clearTimeout: () => {},
  requestAnimationFrame: fn => { rafQueue.push(fn); },
  performance: { now: () => simTime },
  document: {
    readyState: "complete", addEventListener() {},
    getElementById: id => id === "game" ? { width: 960, height: 600, getContext: makeCtx, addEventListener() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 600 }) } : null
  },
  AudioContext: undefined
};
const ctx = vm.createContext(sandbox);
vm.runInContext("globalThis.window=globalThis; var __L={}; globalThis.addEventListener=function(n,f){(__L[n]=__L[n]||[]).push(f);}; globalThis.removeEventListener=function(){}; globalThis.__fire=function(n,e){(__L[n]||[]).slice().forEach(function(f){try{f(e);}catch(err){globalThis.__err=err;}});};", ctx);

const LOAD = ["js/core/util.js","js/core/input.js","js/core/audio.js","js/core/render.js","js/world/map.js","js/world/world.js","js/game/state.js","js/game/minigames.js","js/game/dialogue.js","js/game/notebook.js","js/game/quest.js","js/game/debrief.js","js/game/debug.js","js/data/story.js","js/data/learning.js","js/data/minigames/gift.js","js/data/minigames/travel.js","js/data/minigames/ball.js","js/main.js"];
for (const f of LOAD) {
  try { vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f }); }
  catch (e) { console.log("LOAD FAIL " + f + ": " + e.message); }
}
const G = sandbox.window.G;

function frame(n = 1) {
  for (let i = 0; i < n; i++) {
    simTime += 16;
    const q = rafQueue; rafQueue = [];
    for (const fn of q) { try { fn(simTime); } catch (e) { console.log("FRAME ERR: " + e.message + "\n" + (e.stack||"").split("\n").slice(0,3).join("\n")); } }
  }
}
function tap(k) {
  vm.runInContext(`__fire("keydown",{key:${JSON.stringify(k)},preventDefault:function(){}});`, ctx);
  vm.runInContext(`__fire("keyup",{key:${JSON.stringify(k)},preventDefault:function(){}});`, ctx);
}

frame(3);
console.log("state after boot: " + sandbox.window.GAME.getState());
tap("Enter");
frame(10);
console.log("state after enter: " + sandbox.window.GAME.getState());
console.log("dialogue active: " + G.dialogue.isActive() + " scene: " + G.dialogue.getSceneKey());
console.log("beat: " + G.state.beat + "  objective: " + G.state.currentObjective());

// drain the opening scene
let drain = 0;
while (G.dialogue.isActive() && drain++ < 60) {
  const info = G.debug.inspectNode();
  if (!info) break;
  if (info.type === "say") {
    if (info.typing) { G.debug.pick(0); }
    else { G.debug.pick(0); }
  } else if (info.type === "choice" || info.type === "multi") {
    G.debug.pick(0);
  } else break;
  frame(1);
}
console.log("\nafter draining opening -> beat: " + G.state.beat + " dialogue: " + G.dialogue.isActive());
console.log("  state: " + JSON.stringify(G.debug.state()));
console.log("  player zone: " + G.world.playerZone());
console.log("  player pos: " + JSON.stringify({x: Math.round(G.world.player.x), y: Math.round(G.world.player.y)}));

// teleport to staffroom, watch triggers
console.log("\n-- teleport staffroom --");
G.debug.gotoZone("staffroom", 0);
console.log("  zone now: " + G.world.playerZone() + "  pos: " + JSON.stringify(G.debug.gotoZone("staffroom",0)));
frame(5);
console.log("  after 5 frames: dialogue=" + G.dialogue.isActive() + " scene=" + G.dialogue.getSceneKey() + " beat=" + G.state.beat);

// try force interact
console.log("\n-- direct interact abubakr --");
const key = G.debug.interact("abubakr");
console.log("  returned scene key: " + key);
frame(3);
console.log("  dialogue active: " + G.dialogue.isActive() + " scene: " + G.dialogue.getSceneKey());

console.log("\nerrors: " + errors.length);
errors.slice(0,5).forEach(e => console.log("  " + e));
console.log("warnings: " + warnings.length);
[...new Set(warnings)].slice(0,8).forEach(w => console.log("  " + w));
