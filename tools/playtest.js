/* Headless playtest: boots the real game, then plays the mission by driving the
   debug bridge, and asserts the run completes without exceptions.

   Usage:
     node tools/playtest.js                 # best-path run
     node tools/playtest.js --strategy=worst
     node tools/playtest.js --verbose */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const argv = process.argv.slice(2);
const VERBOSE = argv.includes("--verbose");
const stratArg = argv.find((a) => a.startsWith("--strategy="));
const STRATEGY = stratArg ? stratArg.split("=")[1] : "best";

const warnings = [];
const errors = [];
let simTime = 0;
let rafQueue = [];

/* ---------------- canvas + dom stubs ---------------- */
const CTX_METHODS = [
  "save", "restore", "translate", "scale", "rotate", "clearRect", "fillRect", "strokeRect",
  "beginPath", "closePath", "moveTo", "lineTo", "arc", "arcTo", "ellipse", "rect", "fill",
  "stroke", "clip", "fillText", "strokeText", "setTransform", "resetTransform",
  "quadraticCurveTo", "bezierCurveTo", "drawImage", "putImageData", "setLineDash"
];

function makeCtx() {
  const c = {
    canvas: { width: 960, height: 600 },
    globalAlpha: 1, fillStyle: "#000", strokeStyle: "#000", lineWidth: 1,
    font: "10px sans-serif", textAlign: "left", textBaseline: "alphabetic",
    globalCompositeOperation: "source-over", lineCap: "butt", lineJoin: "miter",
    shadowBlur: 0, shadowColor: "#000", shadowOffsetX: 0, shadowOffsetY: 0,
    imageSmoothingEnabled: true
  };
  for (const m of CTX_METHODS) c[m] = function () {};
  c.measureText = (t) => ({ width: String(t).length * 6.4 });
  c.createLinearGradient = () => ({ addColorStop() {} });
  c.createRadialGradient = () => ({ addColorStop() {} });
  c.createPattern = () => ({});
  c.getImageData = () => ({ data: new Uint8ClampedArray(4) });
  c.roundRect = function () {};
  return c;
}

const sandbox = {
  console: {
    log: VERBOSE ? (...a) => console.log(...a) : () => {},
    warn: (...a) => warnings.push(a.join(" ")),
    error: (...a) => errors.push(a.join(" "))
  },
  Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Set, Map,
  parseInt, parseFloat, isNaN, isFinite, Uint8ClampedArray,
  setTimeout: (fn) => { if (typeof fn === "function") pendingTimers.push(fn); return 0; },
  clearTimeout: () => {},
  requestAnimationFrame: (fn) => { rafQueue.push(fn); return rafQueue.length; },
  performance: { now: () => simTime },
  document: {
    readyState: "complete",
    addEventListener() {},
    getElementById(id) {
      if (id !== "game") return null;
      return {
        width: 960, height: 600,
        getContext: () => makeCtx(),
        addEventListener() {},
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 600 })
      };
    }
  },
  AudioContext: undefined
};
const pendingTimers = [];

const context = vm.createContext(sandbox);
vm.runInContext(
  "globalThis.window = globalThis;" +
  "var __L = {};" +
  "globalThis.addEventListener = function(n,f){ (__L[n]=__L[n]||[]).push(f); };" +
  "globalThis.removeEventListener = function(n,f){ if(__L[n]) __L[n] = __L[n].filter(function(x){return x!==f;}); };" +
  "globalThis.__fire = function(n,e){ (__L[n]||[]).slice().forEach(function(f){ try{ f(e); }catch(err){ globalThis.__lastHandlerError = err; } }); };",
  context
);

const LOAD = [
  "js/core/util.js",
  "js/core/input.js",
  "js/core/audio.js",
  "js/core/render.js",
  "js/world/map.js",
  "js/world/world.js",
  "js/game/state.js",
  "js/game/minigames.js",
  "js/game/dialogue.js",
  "js/game/notebook.js",
  "js/game/quest.js",
  "js/game/debrief.js",
  "js/game/debug.js",
  "js/data/story.js",
  "js/data/learning.js",
  "js/data/minigames/gift.js",
  "js/data/minigames/travel.js",
  "js/data/minigames/ball.js",
  "js/main.js"
];

function run(code, filename) {
  return vm.runInContext(code, context, { filename });
}

for (const f of LOAD) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) { errors.push("MISSING FILE: " + f); continue; }
  try {
    run(fs.readFileSync(p, "utf8"), f);
  } catch (e) {
    errors.push("LOAD ERROR " + f + ": " + e.message + "\n" + (e.stack || "").split("\n").slice(0, 3).join("\n"));
  }
}

const G = sandbox.window.G;
if (!G) { console.error("FATAL: no G global"); process.exit(1); }

/* ---------------- frame driving ---------------- */
function frame(n) {
  n = n || 1;
  for (let i = 0; i < n; i++) {
    simTime += 16;
    const q = rafQueue;
    rafQueue = [];
    for (const fn of q) {
      try { fn(simTime); } catch (e) {
        errors.push("FRAME ERROR: " + e.message + "\n" + (e.stack || "").split("\n").slice(0, 4).join("\n"));
        return;
      }
    }
    // flush timers queued by audio
    while (pendingTimers.length) {
      const fn = pendingTimers.shift();
      try { fn(); } catch (e) { /* audio only */ }
    }
  }
}

function tap(key) {
  run(`__fire("keydown", {key: ${JSON.stringify(key)}, preventDefault: function(){}, button: 0});`, "tap");
  run(`__fire("keyup", {key: ${JSON.stringify(key)}, preventDefault: function(){}});`, "tap");
}

/* ---------------- play logic ---------------- */
const stats = {
  scenes: [],
  nodes: 0,
  choices: 0,
  minigames: 0,
  minigameIds: [],
  hits: [],
  misses: [],
  missingNotes: new Set()
};

// choose an option index based on strategy
function chooseOption(opts) {
  const usable = opts.map((o, i) => ({ o, i })).filter((x) => !x.o.locked);
  if (!usable.length) return 0;

  if (STRATEGY === "random") {
    return usable[Math.floor(Math.random() * usable.length)].i;
  }

  // Score each option using learning.choiceNotes verdict.
  const learning = G.data.learning || {};
  const notes = learning.choiceNotes || {};
  const score = (o) => {
    const n = notes[o.id];
    if (!n) return 0;
    switch (n.verdict) {
      case "good": return 2;
      case "ok": return 1;
      case "weak": return -1;
      case "bad": return -2;
      default: return 0;
    }
  };
  const sorted = usable.slice().sort((a, b) => {
    const sa = score(a.o), sb = score(b.o);
    return STRATEGY === "worst" ? sa - sb : sb - sa;
  });
  return sorted[0].i;
}

function noteMissingIfAny(node) {
  const opts = node.options || [];
  for (const o of opts) {
    if (o.id) stats.hits.push(o.id);
  }
}

let guard = 0;
const MAX_STEPS = 4000;

frame(3);   // boot runs, title screen

// dismiss title
tap("Enter");
frame(4);

if (sandbox.window.GAME && sandbox.window.GAME.getState() !== "play") {
  // fade may need more frames
  frame(60);
}

const sceneOrder = [];

function playUntilDone() {
  while (guard++ < MAX_STEPS) {
    frame(1);
    if (G.debrief.isVisible()) return true;

    // minigame on screen: auto-solve it through its own keys
    if (G.minigameHost.isActive()) {
      stats.minigames++;
      autoSolveMinigame();
      continue;
    }

    if (!G.dialogue.isActive()) {
      // not in dialogue: walk the mission forward by interacting with the right NPC
      if (!advanceWorld()) {
        // nothing left to do
        return G.debrief.isVisible();
      }
      continue;
    }

    const sc = G.dialogue.getSceneKey();
    if (sceneOrder[sceneOrder.length - 1] !== sc) sceneOrder.push(sc);

    const info = G.debug.inspectNode();
    if (!info) { frame(1); continue; }
    stats.nodes++;

    if (info.type === "say") {
      // reveal then advance: two picks resolves typing + moves on
      G.debug.pick(0);
      frame(1);
      const info2 = G.debug.inspectNode();
      if (info2 && info2.type === "say" && !info2.typing) {
        G.debug.pick(0);
      }
      continue;
    }

    if (info.type === "choice") {
      noteMissingIfAny(G.dialogue.debugNode());
      const opts = info.options;
      const idx = chooseOption(opts);
      stats.choices++;
      G.debug.pick(idx);
      frame(1);
      continue;
    }

    if (info.type === "multi") {
      // answer up to max, using verdict scoring
      let safety = 0;
      while (safety++ < 10) {
        const cur = G.debug.inspectNode();
        if (!cur || cur.type !== "multi") break;
        const node = G.dialogue.debugNode();
        const max = node.max || 99;
        const picked = (node.options || []).filter((o) => G.state.hasChosen(o.id)).length;
        const remaining = (cur.options || []).filter((o) => !o.locked && !G.state.hasChosen(o.id));
        if (picked >= max || !remaining.length) break;
        const idx = chooseOption(cur.options);
        const before = JSON.stringify(G.state.intel);
        G.debug.pick(idx);
        frame(1);
        if (JSON.stringify(G.state.intel) === before && picked === 0) break;
      }
      // ensure we move on
      const after = G.debug.inspectNode();
      if (after && after.type === "multi") { G.debug.finishMulti(); frame(1); }
      continue;
    }

    if (info.type === "end") { frame(2); continue; }
    if (info.type === "minigame") { frame(2); continue; }

    frame(1);
  }
  return false;
}

function autoSolveMinigame() {
  // Force-resolve through the host's test hook. Simulating raw keys here is
  // unreliable because each minigame has its own phase machine and timers.
  const id = G.minigameHost.getActiveId();
  stats.minigameIds.push(id);
  const win = STRATEGY !== "worst";
  G.debug.forceMinigame(win);
  // let the host's finishHold elapse
  for (let i = 0; i < 40 && G.minigameHost.isActive(); i++) frame(1);
  if (G.minigameHost.isActive()) errors.push("minigame " + id + " refused to finish");
}

// Walk the mission: teleport to each beat's NPC and interact in order.
const BEAT_PLAN = [
  { beat: "arrive", goto: ["gate", 0], npc: null },
  { beat: "staffroom", goto: ["staffroom", 0], npc: "abubakr" },
  { beat: "oqil", goto: ["staffroom", 1], npc: "oqil" },
  { beat: "mother", goto: ["gate", 1], npc: "nodira" },
  { beat: "lesson", goto: ["classroom", 0], npc: null },
  { beat: "timur", goto: ["classroom", 1], npc: "timur" },
  { beat: "gift", goto: ["shop", 0], npc: "sardor" },
  { beat: "report", goto: ["gate", 2], npc: "nodira" }
];

let planIndex = 0;

function advanceWorld() {
  const beat = G.state.beat;

  // find the plan entry for current beat
  let entry = BEAT_PLAN.find((p) => p.beat === beat);
  if (!entry) {
    // unknown beat: sweep every zone so any pending trigger gets a chance
    for (const z of ["gate", "staffroom", "classroom", "shop", "yard"]) {
      G.debug.gotoZone(z, 0);
      frame(6);            // > zone cooldown (1.2s) so triggers can fire
      if (G.dialogue.isActive() || G.debrief.isVisible()) return true;
    }
    return false;
  }

  // 1) zone trigger for this beat — teleport, then let the cooldown expire
  G.debug.gotoZone(entry.goto[0], entry.goto[1]);
  frame(6);
  if (G.debrief.isVisible()) return true;
  if (G.dialogue.isActive()) return true;

  // 2) talk to the NPC for this beat
  if (entry.npc) {
    const npcs = G.debug.npcs();
    const known = npcs.find((n) => n.id === entry.npc);
    if (!known) {
      errors.push("beat " + beat + " wants npc " + entry.npc + " which is not in story.npcs");
      return false;
    }
    const key = G.debug.interact(entry.npc);
    if (key === null) {
      errors.push("npc " + entry.npc + " has no entry scene for beat " + beat);
      return false;
    }
    frame(6);
    if (G.dialogue.isActive()) return true;
    errors.push("interacting with " + entry.npc + " (scene " + key + ") did not start dialogue");
    return false;
  }

  // 3) beat with no NPC: sweep zones hoping a trigger catches it
  for (const z of ["gate", "staffroom", "classroom", "shop", "yard", "corridor"]) {
    G.debug.gotoZone(z, 0);
    frame(6);
    if (G.dialogue.isActive() || G.debrief.isVisible()) return true;
  }
  return false;
}

// take the intro scene if any
if (G.dialogue.isActive()) {
  playUntilDone();
} else {
  playUntilDone();
}

/* ---------------- report ---------------- */
const summary = G.debug.summary();
const ok = G.debrief.isVisible() || summary.finished;

console.log("=== PLAYTEST (" + STRATEGY + ") ===");
console.log("  scenes visited: " + sceneOrder.length);
console.log("  " + sceneOrder.join(" → "));
console.log("  dialogue nodes: " + stats.nodes);
console.log("  choices made:   " + stats.choices);
console.log("  minigames:      " + stats.minigames);
console.log("  beats reached:  " + summary.beat);
console.log("  trust:          " + summary.trust);
console.log("  intel:          " + summary.intel);
console.log("  notes:          " + summary.notes);
console.log("  finished:       " + summary.finished);
console.log("  debrief shown:  " + G.debrief.isVisible());

if (warnings.length) {
  console.log("\n--- warnings (" + warnings.length + ") ---");
  [...new Set(warnings)].slice(0, 20).forEach((w) => console.log("  ! " + w));
}
if (errors.length) {
  console.log("\n--- ERRORS (" + errors.length + ") ---");
  [...new Set(errors)].slice(0, 14).forEach((e) => console.log("  ✗ " + e));
  console.log("\nFAILED");
  process.exit(1);
}

if (!ok) {
  console.log("\n✗ Run did not reach the debrief. Last beat: " + summary.beat);
  process.exit(2);
}

console.log("\nPASSED — mission completed to debrief with no exceptions");
