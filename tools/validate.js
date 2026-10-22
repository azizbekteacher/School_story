/* Contract validator. Runs the game data in a fake DOM to check every cross-file
   reference the engine depends on. Usage: node tools/validate.js  */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const errors = [];
const warnings = [];
const info = [];

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}

// --- minimal browser sandbox -------------------------------------------------
// In a browser `window === globalThis`, so `window.G = window.G || {}` creates a
// global `G` that later bare `G.foo = ...` lines can see. Reproduce that here.
const sandbox = {
  document: { readyState: "loading", addEventListener() {}, getElementById() { return null; } },
  console,
  Math,
  Date,
  JSON,
  Object,
  Array,
  String,
  Number,
  Boolean,
  RegExp,
  Error,
  setTimeout() {},
  requestAnimationFrame() {},
  AudioContext: undefined
};
const ctx = vm.createContext(sandbox);
vm.runInContext(
  "globalThis.window = globalThis;" +
  "globalThis.addEventListener = function(){};" +
  "globalThis.removeEventListener = function(){};" +
  "globalThis.AudioContext = undefined;",
  ctx
);

const FILES = [
  "js/core/util.js",
  "js/core/input.js",
  "js/core/audio.js",
  "js/core/render.js",
  "js/game/state.js",
  "js/game/minigames.js",
  "js/data/story.js",
  "js/data/learning.js",
  "js/data/minigames/gift.js",
  "js/data/minigames/travel.js",
  "js/data/minigames/ball.js",
  "js/data/chapter2.js",
  "js/data/chapter2-learning.js",
  "js/data/chapters.js",
  "js/data/minigames/chapter2.js"
];

for (const f of FILES) {
  if (!fs.existsSync(path.join(root, f))) {
    errors.push(`MISSING FILE: ${f}`);
    continue;
  }
  try {
    vm.runInContext(read(f), ctx, { filename: f });
  } catch (e) {
    errors.push(`RUNTIME ERROR loading ${f}: ${e.message}`);
  }
}

const G = sandbox.window.G || {};

// --- story shape -------------------------------------------------------------
const story = G.data && G.data.story;
if (!story) {
  errors.push("G.data.story missing — story.js did not define it");
} else {
  info.push(`story title: ${story.title || "(none)"}`);

  if (!story.scenes) errors.push("story.scenes missing");

  const scenes = story.scenes || {};
  const sceneKeys = Object.keys(scenes);
  info.push(`scenes: ${sceneKeys.length}`);

  // collect all nodes and validate references
  let nodeCount = 0;
  const allNodeIds = new Set();
  for (const sk of sceneKeys) {
    const sc = scenes[sk];
    if (!sc.nodes) { errors.push(`scene ${sk} has no nodes`); continue; }
    for (const nk of Object.keys(sc.nodes)) {
      nodeCount++;
      allNodeIds.add(sk + "::" + nk);
    }
  }
  info.push(`nodes: ${nodeCount}`);

  // next / onWin / onLose must resolve within the same scene
  for (const sk of sceneKeys) {
    const sc = scenes[sk];
    if (!sc.nodes) continue;
    for (const nk of Object.keys(sc.nodes)) {
      const n = sc.nodes[nk];
      const check = (target, where) => {
        if (target === undefined || target === null) return;
        if (typeof target !== "string") {
          errors.push(`${sk}/${nk}: ${where} is not a string`);
          return;
        }
        if (!sc.nodes[target]) {
          errors.push(`${sk}/${nk}: ${where} -> missing node "${target}"`);
        }
      };
      check(n.next, "next");
      check(n.onWin, "onWin");
      check(n.onLose, "onLose");
      check(n.nextAfter && n.nextAfter.true, "nextAfter.true");
      check(n.nextFallback, "nextFallback");
      if (n.options) {
        n.options.forEach((o, i) => {
          check(o.next, `options[${i}].next`);
          if (!o.id) errors.push(`${sk}/${nk}: options[${i}] has no id`);
          if (!o.text && !o.lockedText) errors.push(`${sk}/${nk}: options[${i}] has no text`);
        });
      }
      if (n.type === "minigame" && !n.game) {
        errors.push(`${sk}/${nk}: minigame node has no game id`);
      }
    }
  }

  // choices must be reachable: every option in a choice node
  const choiceIds = new Set();
  const collectChoices = () => {
    for (const sk of sceneKeys) {
      const sc = scenes[sk];
      if (!sc.nodes) continue;
      for (const nk of Object.keys(sc.nodes)) {
        const n = sc.nodes[nk];
        if (n.options) n.options.forEach(o => { if (o.id) choiceIds.add(o.id); });
        if (n.type === "multi" && n.options) n.options.forEach(o => { if (o.id) choiceIds.add(o.id); });
      }
    }
  };
  collectChoices();

  // required choice ids from SPEC
  const REQUIRED = [
    "ABQ_1", "ABQ_2", "ABQ_3",
    "OQ_1", "OQ_2", "OQ_3",
    "MOM_Q1", "MOM_Q2", "MOM_Q3", "MOM_Q4",
    "LES_1", "LES_2", "LES_3",
    "NOT_1", "NOT_2", "NOT_3", "NOT_4",
    "REP_1", "REP_2", "REP_3", "REP_4"
  ];
  const missingRequired = REQUIRED.filter(id => !choiceIds.has(id));
  if (missingRequired.length) {
    errors.push(`story missing required choice ids: ${missingRequired.join(", ")}`);
  }
  info.push(`story choice ids: ${choiceIds.size}`);

  // NPCs
  const npcs = story.npcs || [];
  info.push(`npcs: ${npcs.map(n => n.id).join(", ")}`);
  const npcIds = new Set();
  npcs.forEach(n => {
    if (!n.id) errors.push("npc without id");
    npcIds.add(n.id);
    if (!n.zone) errors.push(`npc ${n.id} has no zone`);
    if (!n.palette) warnings.push(`npc ${n.id} has no palette`);
    const entry = n.entry || {};
    Object.keys(entry).forEach(k => {
      const v = entry[k];
      if (typeof v === "string" && !scenes[v]) {
        errors.push(`npc ${n.id} entry.${k} -> missing scene "${v}"`);
      }
    });
  });

  // triggers
  (story.triggers || []).forEach((tr, i) => {
    if (!tr.zone) errors.push(`trigger[${i}] has no zone`);
    if (!tr.scene) errors.push(`trigger[${i}] has no scene`);
    else if (!scenes[tr.scene]) errors.push(`trigger[${i}] -> missing scene "${tr.scene}"`);
  });

  // minigame nodes must reference registered games
  const regGames = new Set(Object.keys((G.minigames && G.minigames.list) || {}));
  info.push(`registered minigames: ${Array.from(regGames).join(", ")}`);
  for (const sk of sceneKeys) {
    const sc = scenes[sk];
    if (!sc.nodes) continue;
    for (const nk of Object.keys(sc.nodes)) {
      const n = sc.nodes[nk];
      if (n.type === "minigame" && n.game && !regGames.has(n.game)) {
        errors.push(`${sk}/${nk}: minigame "${n.game}" not registered (have: ${Array.from(regGames).join(", ")})`);
      }
    }
  }

  // beats: objectives should cover beats, and beat effects should be known
  const objectives = story.objectives || {};
  info.push(`objectives: ${Object.keys(objectives).length}`);
  const beatSet = new Set(Object.keys(objectives));
  const REQUIRED_BEATS = ["arrive", "staffroom", "oqil", "mother", "lesson", "timur", "gift", "walk", "report", "done"];
  const missingBeats = REQUIRED_BEATS.filter(b => !beatSet.has(b));
  if (missingBeats.length) warnings.push(`objectives missing beats: ${missingBeats.join(", ")}`);

  // collect beat effects + intel effects actually used
  const usedBeats = new Set();
  const usedIntel = new Set();
  const usedFlags = new Set();
  for (const sk of sceneKeys) {
    const sc = scenes[sk];
    if (!sc.nodes) continue;
    for (const nk of Object.keys(sc.nodes)) {
      const n = sc.nodes[nk];
      const scanEffects = (arr) => {
        (arr || []).forEach(e => {
          if (!e) return;
          if (e.beat) usedBeats.add(e.beat);
          if (e.intel) usedIntel.add(e.intel);
          if (e.flag) usedFlags.add(e.flag);
        });
      };
      scanEffects(n.effects);
      (n.options || []).forEach(o => scanEffects(o.effects));
      if (n.type === "multi") (n.options || []).forEach(o => { if (o.intel) usedIntel.add(o.intel); });
    }
  }
  info.push(`beats set by story: ${Array.from(usedBeats).join(", ")}`);
  const unknownBeats = Array.from(usedBeats).filter(b => !beatSet.has(b));
  if (unknownBeats.length) errors.push(`story sets beats with no objective: ${unknownBeats.join(", ")}`);
  const neverSet = REQUIRED_BEATS.filter(b => !usedBeats.has(b) && b !== "arrive");
  if (neverSet.length) warnings.push(`beats never set by story: ${neverSet.join(", ")}`);

  // intel required by choices must be obtainable
  const learning = (G.data && G.data.learning) || {};
  const learningIntel = new Set(Object.keys(learning.intel || {}));
  const unknownIntel = Array.from(usedIntel).filter(i => !learningIntel.has(i));
  if (unknownIntel.length) warnings.push(`intel used but not described in learning.intel: ${unknownIntel.join(", ")}`);
  const unusedIntel = Array.from(learningIntel).filter(i => !usedIntel.has(i));
  if (unusedIntel.length) warnings.push(`learning.intel defined but never granted: ${unusedIntel.join(", ")}`);

  // gates: requires.intel must be obtainable
  for (const sk of sceneKeys) {
    const sc = scenes[sk];
    if (!sc.nodes) continue;
    for (const nk of Object.keys(sc.nodes)) {
      const n = sc.nodes[nk];
      (n.options || []).forEach(o => {
        if (o.requires && o.requires.intel && !usedIntel.has(o.requires.intel)) {
          errors.push(`${sk}/${nk}: option ${o.id} requires intel "${o.requires.intel}" that is never granted`);
        }
      });
    }
  }

  // unreached scenes
  const referenced = new Set();
  npcs.forEach(n => Object.keys(n.entry || {}).forEach(k => referenced.add(n.entry[k])));
  (story.triggers || []).forEach(t => referenced.add(t.scene));
  if (story.opening) referenced.add(story.opening);
  const unreachedScenes = sceneKeys.filter(s => !referenced.has(s));
  if (unreachedScenes.length) warnings.push(`scenes never referenced: ${unreachedScenes.join(", ")}`);

  // scan for choice ids emitted by minigames
  const minigameChoiceIds = new Set();
  for (const gid of regGames) {
    const src = read("js/data/minigames/" + gidFile(gid));
    // find choiceId: "..." in source
    const m = src.match(/choiceId\s*:\s*["']([A-Z0-9_]+)["']/g) || [];
    m.forEach(s => {
      const v = s.match(/["']([A-Z0-9_]+)["']/);
      if (v) minigameChoiceIds.add(v[1]);
    });
    // also dynamic ones like "TRAVEL_" + n + "_" + x
    const dyn = src.match(/["'](TRAVEL_|GIFT_|BALL_|M1_)[^"']*["']/g) || [];
    dyn.forEach(s => minigameChoiceIds.add(s.replace(/["']/g, "")));
  }
  info.push(`minigame choice ids found: ${minigameChoiceIds.size}`);

  // learning.choiceNotes coverage
  const choiceNotes = learning.choiceNotes || {};
  const documented = new Set(Object.keys(choiceNotes));
  const allGameChoices = new Set([...choiceIds]);
  minigameChoiceIds.forEach(c => { if (/^[A-Z]+_\d+$/.test(c) || /^[A-Z]+_[a-z]+$/.test(c)) allGameChoices.add(c); });

  const undocumented = Array.from(allGameChoices).filter(c => !documented.has(c) && c.length > 3);
  if (undocumented.length) {
    warnings.push(`${undocumented.length} choice ids have no learning.choiceNotes entry: ${undocumented.slice(0, 18).join(", ")}${undocumented.length > 18 ? "…" : ""}`);
  }
  info.push(`choiceNotes documented: ${documented.size}`);

  // verify each choiceNote has required fields
  Object.keys(choiceNotes).forEach(k => {
    const c = choiceNotes[k];
    if (!c.title) warnings.push(`choiceNotes.${k} has no title`);
    if (!c.why) warnings.push(`choiceNotes.${k} has no why`);
    if (c.verdict && ["good", "ok", "weak", "bad"].indexOf(c.verdict) === -1) {
      errors.push(`choiceNotes.${k} invalid verdict "${c.verdict}"`);
    }
  });
}

// --- learning shape ----------------------------------------------------------
const learning = (G.data && G.data.learning) || {};
if (!G.data || !G.data.learning) errors.push("G.data.learning missing");

const REQUIRED_PRINCIPLES = ["I-001", "I-002", "I-028", "I-043", "I-044", "F-013"];
const principles = learning.principles || {};
REQUIRED_PRINCIPLES.forEach(p => {
  if (!principles[p]) errors.push(`learning.principles missing ${p}`);
  else {
    const pr = principles[p];
    if (!pr.name) errors.push(`principles.${p} has no name`);
    if (!pr.gist) errors.push(`principles.${p} has no gist`);
  }
});
info.push(`principles: ${Object.keys(principles).length}`);
info.push(`ideas: ${(learning.ideas || []).length}`);
info.push(`difficulties: ${(learning.difficulties || []).length}`);
info.push(`archetypes: ${(learning.archetypes || []).length}`);

if ((learning.ideas || []).length < 8) errors.push("learning.ideas should have at least 8 entries");
if ((learning.difficulties || []).length < 6) errors.push("learning.difficulties should have at least 6 entries");
if ((learning.archetypes || []).length < 4) errors.push("learning.archetypes should have at least 4 entries");

(learning.ideas || []).forEach((i, n) => {
  if (!i.id) errors.push(`ideas[${n}] has no id`);
  if (!i.title) errors.push(`ideas[${n}] has no title`);
  if (!i.what) warnings.push(`ideas[${n}] (${i.id}) has no what`);
  if (i.principle && !principles[i.principle]) {
    warnings.push(`ideas[${n}] references unknown principle ${i.principle}`);
  }
});
(learning.difficulties || []).forEach((d, n) => {
  if (!d.id) errors.push(`difficulties[${n}] has no id`);
  if (!d.title) errors.push(`difficulties[${n}] has no title`);
  if (!d.mitigation) warnings.push(`difficulties[${n}] (${d.id}) has no mitigation`);
});

// --- minigame shape ----------------------------------------------------------
const games = (G.minigames && G.minigames.list) || {};
const REQUIRED_GAMES = ["giftShop", "travelTalk", "ballPlay"];
REQUIRED_GAMES.forEach(g => {
  if (!games[g]) { errors.push(`minigame ${g} not registered`); return; }
  const def = games[g];
  if (!def.title) warnings.push(`minigame ${g} has no title`);
  if (typeof def.create !== "function") errors.push(`minigame ${g} has no create()`);
});

// Chapter 2 ships several minigames in ONE file, so this map has to grow every
// time a new one is registered there. Forgetting it makes validate.js crash
// with ENOENT rather than fail a check — see AGENTS.md §11. Keeping the list in
// one place and defaulting to `<id>.js` is fine, but anything added to
// js/data/minigames/chapter2.js must be added here in the same commit.
function gidFile(id) {
  if (id === "giftShop") return "gift.js";
  if (id === "travelTalk") return "travel.js";
  if (id === "ballPlay") return "ball.js";
  if (id === "firstNinety" || id === "cardRun" || id === "giftRun") return "chapter2.js";
  return id + ".js";
}

// --- report ------------------------------------------------------------------
console.log("=== VALIDATION ===");
info.forEach(i => console.log("  · " + i));
console.log("");

if (warnings.length) {
  console.log(`--- ${warnings.length} WARNING(S) ---`);
  warnings.slice(0, 60).forEach(w => console.log("  ! " + w));
  if (warnings.length > 60) console.log(`  … ${warnings.length - 60} more`);
  console.log("");
}

if (errors.length) {
  console.log(`--- ${errors.length} ERROR(S) ---`);
  errors.forEach(e => console.log("  ✗ " + e));
  console.log("\nFAILED");
  process.exit(1);
} else {
  console.log(`PASSED — 0 errors, ${warnings.length} warnings`);
}
