/* Play chapter 1's mother scene for real and prove the four question answers are
   now reachable.

   The scene is the game's only `multi` node. Its data says: ask a question, hear
   Nodira opa's answer, come back and ask another (max 2). Before the fix in
   js/game/dialogue.js, pickMulti() ignored each option's `next`, so all four
   answers were dead nodes and the scene jumped straight past them — the player
   spent their two questions and heard nothing.

   This drives the real engine in a vm with real data, so it fails if the engine
   regresses, not if a string changes. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
let fail = 0;
const ck = (c, l, extra) => {
  console.log((c ? "  PASS  " : "  FAIL  ") + l + (extra ? "  [" + extra + "]" : ""));
  if (!c) fail++;
};

/* ---- a browser-shaped sandbox, just enough to boot the modules ---- */
const noop = function () {};
const audio = { blip: noop, tick: noop, select: noop, good: noop, bad: noop, win: noop, door: noop, resume: noop };
const ctx = {
  window: null, console, Math, Date, JSON, Object, Array, String, Number, Boolean,
  parseInt, parseFloat, isNaN, isFinite, RegExp, Error, setTimeout, clearTimeout,
  document: undefined, navigator: undefined, location: undefined
};
ctx.window = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);

const LOAD = [
  "js/core/util.js",
  "js/game/state.js",
  "js/core/audio.js",
  "js/game/minigames.js",
  "js/game/dialogue.js",
  "js/data/story.js",
  "js/data/learning.js",
  "js/data/chapter2.js",
  "js/data/chapter2-learning.js"
];
for (const f of LOAD) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) { console.log("missing " + f); process.exit(2); }
  try {
    vm.runInContext(fs.readFileSync(p, "utf8"), ctx, { filename: f });
  } catch (e) {
    console.log("LOAD ERROR in " + f + ": " + e.message);
    process.exit(2);
  }
}

const G = ctx.G;
if (!G || !G.dialogue || !G.state) { console.log("G modules did not load"); process.exit(2); }

/* The dialogue module reads G.audio.* and G.util.*; make sure they exist even if
   audio.js was a different shape. */
G.audio = G.audio && typeof G.audio === "object" ? G.audio : audio;
for (const k of Object.keys(audio)) if (typeof G.audio[k] !== "function") G.audio[k] = audio[k];
if (!G.render) G.render = {};
if (!G.render.hint) G.render.hint = noop;
if (!G.render.panel) G.render.panel = noop;
if (!G.render.progressBar) G.render.progressBar = noop;
if (!G.render.wrapText) {
  G.render.wrapText = function (c, t, w) { return [String(t)]; };
}

G.state.reset();
G.state.chapter = "ch1";

const started = G.dialogue.startScene("mom_start");
ck(started, "the mother scene starts");

/* Walk to the multi node by advancing through the intro say nodes. The engine
   only leaves a say node when advance() is called, so call the same path the
   keyboard does: update() to finish typing, then handleInput() with enter. We
   drive update() directly to skip the typewriter. */
function key(name) {
  G.input = G.input || {};
}
/* dialogue.js's advance is internal; the public surface is update()+handleInput()
   reading G.input. Stub a minimal input that reports a single "enter" press. */
let pressQueue = [];
function installInput() {
  G.input = {
    mouse: { x: -1000, y: -1000, down: false, clicked: false },
    wasPressed: function (k) { return pressQueue.indexOf(k) !== -1; },
    numberPressed: function () {
      for (let i = 1; i <= 9; i++) if (pressQueue.indexOf(String(i)) !== -1) return i;
      return 0;
    },
    consume: function (k) { pressQueue = pressQueue.filter(function (x) { return x !== k; }); },
    endFrame: function () { pressQueue = []; }
  };
}
installInput();

function step(n, dt) {
  for (let i = 0; i < (n || 1); i++) {
    G.dialogue.update(dt === undefined ? 0.05 : dt);
    G.dialogue.handleInput();
    pressQueue = [];
  }
}

/* Jump straight to the multi node by walking the say chain. */
const scene = G.data.story.scenes.mom_start;
const multiId = "mom_q";
let guard = 0;
while (G.dialogue.debugNodeId() !== multiId && guard++ < 200) {
  pressQueue = ["enter"];
  step(1, 1.0);   // 1s of dt finishes the typewriter in one step
  G.dialogue.update(1.0);
  G.dialogue.handleInput();
  pressQueue = ["enter"];
  step(1, 1.0);
}
const atMulti = G.dialogue.debugNodeId();
ck(atMulti === multiId, "reached the question menu", atMulti);

/* Ask question 1 (MOM_Q1 -> mom_a1). */
pressQueue = ["1"];
G.dialogue.update(0.05);
G.dialogue.handleInput();
step(1, 0.05);
const afterQ1 = G.dialogue.debugNodeId();
ck(afterQ1 === "mom_a1",
  "asking question 1 plays its answer instead of skipping it", afterQ1);

/* Advance through the answer; it should route back to the question menu. */
let back = false;
for (let i = 0; i < 12 && !back; i++) {
  pressQueue = ["enter"];
  G.dialogue.update(1.0);
  G.dialogue.handleInput();
  pressQueue = ["enter"];
  G.dialogue.update(1.0);
  G.dialogue.handleInput();
  if (G.dialogue.debugNodeId() === multiId) back = true;
}
ck(back, "the answer returns to the question menu", G.dialogue.debugNodeId());

/* Ask question 2. The menu now lists only the questions that are still
   available (asked ones are removed, not just greyed out), so "1" is the first
   remaining question — which, after MOM_Q1 was spent, is MOM_Q2. Picking by
   position in the visible list is the behaviour the player sees. */
pressQueue = ["1"];
G.dialogue.update(0.05);
G.dialogue.handleInput();
step(1, 0.05);
const afterQ2 = G.dialogue.debugNodeId();
ck(afterQ2 === "mom_a2", "asking the next question plays its answer", afterQ2);

/* Advance again; with two questions spent the scene must leave the menu. */
let left = false;
for (let i = 0; i < 14 && !left; i++) {
  pressQueue = ["enter"];
  G.dialogue.update(1.0);
  G.dialogue.handleInput();
  pressQueue = ["enter"];
  G.dialogue.update(1.0);
  G.dialogue.handleInput();
  const id = G.dialogue.debugNodeId();
  if (id !== multiId && id !== "mom_a2" && id !== "mom_a2b") left = true;
}
ck(left || !G.dialogue.isActive() || G.dialogue.debugNodeId() !== multiId,
  "after two questions the scene moves on", G.dialogue.debugNodeId());

/* The intel the answers were supposed to grant must be in the notebook. */
const intel = G.state.intel;
ck(intel.indexOf("intel_sick") !== -1, "question 1 granted its intel", intel.join(","));
ck(intel.indexOf("intel_football") !== -1, "question 2 granted its intel", intel.join(","));

console.log(fail
  ? `\nMULTI PROBE FAILED — ${fail} problem(s)`
  : "\nMULTI PROBE PASSED — the question answers are reachable, return to the menu, and grant intel");
process.exit(fail ? 1 : 0);
