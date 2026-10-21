/* Diagnose the 'walk' beat stall: replay the run and dump state at failure. */
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
    for (const fn of q) { try { fn(simTime); } catch (e) { errors.push(e.message); } }
  }
}
frame(3);
vm.runInContext(`__fire("keydown",{key:"Enter",preventDefault:function(){}});`, ctx);
vm.runInContext(`__fire("keyup",{key:"Enter",preventDefault:function(){}});`, ctx);
frame(10);

const learn = G.data.learning, notes = learn.choiceNotes || {};
const vs = { good: 2, ok: 1, weak: -1, bad: -2 };
const sc = id => notes[id] ? (vs[notes[id].verdict] || 0) : 0;
const best = arr => { arr.sort((a, b) => sc(b.o.id) - sc(a.o.id)); return arr[0]; };

const PLAN = {
  arrive: ["gate", 0, null], staffroom: ["staffroom", 0, "abubakr"],
  oqil: ["staffroom", 1, "oqil"], mother: ["gate", 1, "nodira"],
  lesson: ["classroom", 0, null], timur: ["classroom", 1, "timur"],
  gift: ["shop", 0, "sardor"], report: ["gate", 2, "nodira"]
};
const ZONES = ["gate", "staffroom", "classroom", "shop", "yard", "corridor"];

let g = 0;
let lastBeat = "";
while (g++ < 3000) {
  frame(1);
  if (G.debrief.isVisible()) { console.log("REACHED DEBRIEF"); break; }

  const beat = G.state.beat;
  if (beat !== lastBeat) { console.log("  beat -> " + beat); lastBeat = beat; }

  if (G.minigameHost.isActive()) {
    const id = G.minigameHost.getActiveId();
    console.log("  [minigame] " + id + " -> forcing true");
    G.debug.forceMinigame(true);
    frame(30);
    continue;
  }
  if (!G.dialogue.isActive()) {
    const plan = PLAN[beat];
    if (plan) {
      G.debug.gotoZone(plan[0], plan[1]);
      frame(4);
      if (!G.dialogue.isActive() && plan[2]) { G.debug.interact(plan[2]); frame(4); }
    }
    if (!G.dialogue.isActive() && !G.debrief.isVisible()) {
      for (const z of ZONES) {
        G.debug.gotoZone(z, 0);
        frame(4);
        if (G.dialogue.isActive() || G.debrief.isVisible()) break;
      }
    }
    if (!G.dialogue.isActive() && !G.debrief.isVisible()) {
      console.log("\n!! STUCK at beat=" + beat);
      console.log("   zone=" + G.world.playerZone());
      console.log("   flags=" + JSON.stringify(Object.keys(G.state.flags)));
      console.log("   triggers=" + JSON.stringify(G.data.story.triggers));
      console.log("   scene=" + G.dialogue.getSceneKey());
      console.log("   finished=" + G.state.finished + " debriefVisible=" + G.debrief.isVisible());
      console.log("   dialogueActive=" + G.dialogue.isActive());
      console.log("   npcs=" + JSON.stringify(G.debug.npcs()));
      break;
    }
    continue;
  }

  const info = G.debug.inspectNode();
  if (!info) continue;
  if (info.type === "say") { G.debug.pick(0); continue; }
  if (info.type === "choice") {
    const u = info.options.map((o, i) => ({ o, i })).filter(x => !x.o.locked);
    if (!u.length) { G.debug.pick(0); continue; }
    G.debug.pick(best(u).i);
    continue;
  }
  if (info.type === "multi") {
    const node = G.dialogue.debugNode(), max = node.max || 99;
    let s2 = 0;
    while (s2++ < 8) {
      const cur = G.debug.inspectNode();
      if (!cur || cur.type !== "multi") break;
      const picked = (cur.options || []).filter(o => G.state.hasChosen(o.id)).length;
      if (picked >= max) break;
      const rem = cur.options.map((o, i) => ({ o, i })).filter(x => !x.o.locked && !G.state.hasChosen(x.o.id));
      if (!rem.length) break;
      G.debug.pick(best(rem).i);
      frame(1);
    }
    const after = G.debug.inspectNode();
    if (after && after.type === "multi") { G.debug.finishMulti(); frame(1); }
    continue;
  }
  if (info.type === "minigame") {
    console.log("  [node] minigame node visible, host active=" + G.minigameHost.isActive());
    frame(2);
    continue;
  }
  frame(1);
}
console.log("\nfinal: " + JSON.stringify(G.debug.summary()));
console.log("errors: " + errors.length);
[...new Set(errors)].slice(0, 5).forEach(e => console.log("  " + e));
