/* validate-chapter2.js — contract validator for Chapter 2 ("Birinchi dars: 5-B").

   Loads, in the same fake DOM that tools/show-contract.js uses:
     js/world/map.js                    (real zone + anchor tables)
     js/game/minigames.js               (the real registry)
     js/data/minigames/chapter2.js      (the chapter's two activities)
     js/data/chapter2.js                (the chapter script)
     js/data/chapter2-learning.js       (the teaching payload)

   and asserts the 11 things the chapter contract requires. Usage:
     node tools/validate-chapter2.js

   Exit code 0 = PASS, 1 = FAIL. Prints counts on success. */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const errors = [];
const warnings = [];
const info = [];

function rel(p) { return path.join(root, p); }
function read(p) { return fs.readFileSync(rel(p), "utf8"); }
function exists(p) { return fs.existsSync(rel(p)); }
function err(m) { errors.push(m); }
function warn(m) { warnings.push(m); }

// --- minimal browser sandbox -------------------------------------------------
const sandbox = {
  document: { readyState: "loading", addEventListener() {}, getElementById() { return null; } },
  console,
  Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Set, Map,
  setTimeout() {},
  requestAnimationFrame() {},
  performance: { now: () => 0 },
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
  "js/world/map.js",
  "js/game/minigames.js",
  "js/data/minigames/chapter2.js",
  "js/data/chapter2.js",
  "js/data/chapter2-learning.js"
];

for (const f of FILES) {
  if (!exists(f)) { err(`MISSING FILE: ${f}`); continue; }
  try {
    vm.runInContext(read(f), ctx, { filename: f });
  } catch (e) {
    err(`RUNTIME ERROR loading ${f}: ${e.message}`);
  }
}

const G = (sandbox.window && sandbox.window.G) || {};
const CH = G.data && G.data.chapter2;
const L = G.data && G.data.chapter2Learning;
const MAP = G.map || { ANCHORS: {}, ZONES: [] };
const REGISTERED = (G.minigames && G.minigames.list) ? Object.keys(G.minigames.list) : [];

if (!CH) err("G.data.chapter2 missing — js/data/chapter2.js did not define it");
if (!L) err("G.data.chapter2Learning missing — js/data/chapter2-learning.js did not define it");

// ---------------------------------------------------------------------------
// 1. top-level shape
// ---------------------------------------------------------------------------
const REQUIRED = ["id", "title", "subtitle", "startZone", "startAnchor", "opening",
                  "brief", "npcs", "triggers", "objectives", "scenes"];

let sceneKeys = [];
let allNodeIds = [];
let nodeCount = 0;
let optCount = 0;
let optionIds = [];
let optionById = {};
let effectBeats = [];

if (CH) {
  for (const k of REQUIRED) {
    if (CH[k] === undefined || CH[k] === null) err(`chapter2.${k} missing`);
  }
  if (CH.id !== "ch2") err(`chapter2.id should be "ch2", got ${JSON.stringify(CH.id)}`);
  ["title", "subtitle"].forEach(k => {
    if (typeof CH[k] !== "string" || !CH[k].trim()) err(`chapter2.${k} must be a non-empty string`);
  });
  if (!Array.isArray(CH.brief)) err("chapter2.brief must be an array");
  else {
    if (CH.brief.length !== 3) err(`chapter2.brief should have 3 lines (mission card), has ${CH.brief.length}`);
    CH.brief.forEach((b, i) => {
      if (typeof b !== "string" || !b.trim()) err(`chapter2.brief[${i}] is empty`);
    });
  }

  // zones / anchors from the real map
  const zoneIds = (MAP.ZONES || []).map(z => z.id).concat(["corridor"]);
  const anchorZones = Object.keys(MAP.ANCHORS || {});
  if (!anchorZones.length) err("could not read G.map.ANCHORS — js/world/map.js did not load");
  if (CH.startZone && anchorZones.indexOf(CH.startZone) < 0) {
    err(`startZone "${CH.startZone}" has no anchor list (have: ${anchorZones.join(", ")})`);
  }
  if (CH.startZone && zoneIds.indexOf(CH.startZone) < 0) {
    err(`startZone "${CH.startZone}" is not a map zone`);
  }
  const startAnchors = MAP.ANCHORS[CH.startZone] || [];
  if (typeof CH.startAnchor !== "number" || CH.startAnchor < 0 ||
      CH.startAnchor >= Math.max(1, startAnchors.length)) {
    err(`startAnchor ${CH.startAnchor} outside ${CH.startZone} anchors (0..${startAnchors.length - 1})`);
  }

  // -------------------------------------------------------------------------
  // scenes + nodes
  // -------------------------------------------------------------------------
  const scenes = CH.scenes || {};
  sceneKeys = Object.keys(scenes);
  if (!sceneKeys.length) err("chapter2.scenes is empty");

  const NODE_TYPES = { say: 1, choice: 1, multi: 1, minigame: 1, end: 1 };

  for (const sk of sceneKeys) {
    const sc = scenes[sk];
    if (!sc || typeof sc !== "object") { err(`scene ${sk} is not an object`); continue; }
    if (!sc.nodes || !Object.keys(sc.nodes).length) { err(`scene ${sk} has no nodes`); continue; }
    if (!sc.start) err(`scene ${sk} has no start node`);
    else if (!sc.nodes[sc.start]) err(`scene ${sk}: start node "${sc.start}" does not exist`);

    for (const nk of Object.keys(sc.nodes)) {
      const n = sc.nodes[nk];
      nodeCount++;
      allNodeIds.push(sk + "::" + nk);
      if (!n || typeof n !== "object") { err(`${sk}/${nk}: node is not an object`); continue; }
      if (!n.type) err(`${sk}/${nk}: no type`);
      else if (!NODE_TYPES[n.type]) err(`${sk}/${nk}: unknown node type "${n.type}"`);

      // type-specific required fields
      if (n.type === "say") {
        if (typeof n.text !== "string" || !n.text.trim()) err(`${sk}/${nk}: say node has no text`);
      }
      if (n.type === "choice" || n.type === "multi") {
        if (typeof n.prompt !== "string" || !n.prompt.trim()) err(`${sk}/${nk}: ${n.type} node has no prompt`);
        if (!Array.isArray(n.options) || !n.options.length) err(`${sk}/${nk}: ${n.type} node has no options`);
        if (n.type === "multi" && (typeof n.max !== "number" || n.max < 1)) {
          err(`${sk}/${nk}: multi node needs a numeric max`);
        }
      }
      if (n.type === "minigame") {
        if (!n.game) err(`${sk}/${nk}: minigame node has no game id`);
        if (!n.onWin) warn(`${sk}/${nk}: minigame has no onWin (falls back to next)`);
        if (!n.onLose) warn(`${sk}/${nk}: minigame has no onLose (falls back to next)`);
      }

      // every in-scene jump must resolve
      const checkTarget = (target, where) => {
        if (target === undefined || target === null) return;
        if (typeof target !== "string") { err(`${sk}/${nk}: ${where} is not a string`); return; }
        if (!sc.nodes[target]) err(`${sk}/${nk}: ${where} -> missing node "${target}"`);
      };
      checkTarget(n.next, "next");
      checkTarget(n.onWin, "onWin");
      checkTarget(n.onLose, "onLose");

      // effects
      const effects = n.effects || [];
      if (!Array.isArray(effects)) err(`${sk}/${nk}: effects is not an array`);
      for (const e of effects) {
        if (!e || typeof e !== "object") { err(`${sk}/${nk}: empty effect`); continue; }
        if (e.note) {
          if (!e.note.principle) err(`${sk}/${nk}: note without principle`);
          if (!["good", "ok", "weak", "bad"].includes(e.note.verdict)) {
            err(`${sk}/${nk}: note verdict "${e.note.verdict}" not in good|ok|weak|bad`);
          }
          if (!e.note.text) warn(`${sk}/${nk}: note without text`);
        }
        if (e.beat) effectBeats.push(e.beat);
      }
      const hasEndMission = effects.some(e => e && e.endMission);

      // options
      if (Array.isArray(n.options)) {
        n.options.forEach((o, i) => {
          optCount++;
          const where = `${sk}/${nk}.options[${i}]`;
          if (!o || typeof o !== "object") { err(`${where}: not an object`); return; }
          if (!o.id) err(`${where}: no id`);
          else {
            if (optionById[o.id]) err(`${where}: duplicate option id "${o.id}" (also ${optionById[o.id]})`);
            optionById[o.id] = where;
            optionIds.push(o.id);
            if (!/^CH2_/.test(o.id)) err(`${where}: id "${o.id}" is not prefixed CH2_`);
          }
          if (typeof o.text !== "string" || !o.text.trim()) err(`${where}: no text`);
          if (!o.next) err(`${where}: no next`);
          else checkTarget(o.next, `options[${i}].next`);
          if (o.requires && !o.lockedText) {
            warn(`${where}: gated option "${o.id}" has no lockedText (the player sees a locked door with no reason)`);
          }
          (o.effects || []).forEach(e => {
            if (!e || typeof e !== "object") return;
            if (e.note) {
              if (!e.note.principle) err(`${where}: note without principle`);
              if (!["good", "ok", "weak", "bad"].includes(e.note.verdict)) {
                err(`${where}: note verdict "${e.note.verdict}" not in good|ok|weak|bad`);
              }
            }
            if (e.beat) effectBeats.push(e.beat);
          });
        });
      }

      // ---------------------------------------------------------------------
      // 10a. orphaned nodes: reachable from the scene start at all?
      // ---------------------------------------------------------------------
      if (hasEndMission) {
        const lastBeat = effects.filter(e => e && e.beat).map(e => e.beat).pop();
        if (!lastBeat) err(`${sk}/${nk}: endMission without a beat effect in the same list`);
      }
    }
  }
}

// reachability within each scene
if (CH && CH.scenes) {
  for (const sk of Object.keys(CH.scenes)) {
    const sc = CH.scenes[sk];
    const nodes = sc.nodes || {};
    if (!sc.start || !nodes[sc.start]) continue;
    const seen = new Set();
    const stack = [sc.start];
    while (stack.length) {
      const id = stack.pop();
      if (seen.has(id) || !nodes[id]) continue;
      seen.add(id);
      const n = nodes[id];
      const push = t => { if (typeof t === "string" && nodes[t] && !seen.has(t)) stack.push(t); };
      push(n.next); push(n.onWin); push(n.onLose);
      (n.options || []).forEach(o => push(o && o.next));
    }
    const orphans = Object.keys(nodes).filter(k => !seen.has(k));
    if (orphans.length) {
      err(`scene ${sk}: ${orphans.length} orphaned node(s) not reachable from start: ${orphans.slice(0, 8).join(", ")}`);
    }
    // a scene the player can enter must have a way out: a terminal node
    const hasExit = Object.keys(nodes).some(k => {
      const n = nodes[k] || {};
      const effects = n.effects || [];
      return n.next === null || n.type === "end" || effects.some(e => e && e.endMission);
    });
    if (!hasExit) err(`scene ${sk}: no terminal node (every path loops inside the scene)`);
  }
}

// exactly one node may end the mission, and it must be a beat the HUD knows
if (CH && CH.scenes) {
  const ends = [];
  for (const sk of Object.keys(CH.scenes)) {
    const nodes = CH.scenes[sk].nodes || {};
    for (const nk of Object.keys(nodes)) {
      const n = nodes[nk] || {};
      if ((n.effects || []).some(e => e && e.endMission)) ends.push(sk + "/" + nk);
    }
  }
  if (ends.length === 0) err("no node sets { endMission: true } — the chapter cannot finish");
  if (ends.length > 1) err(`more than one node ends the mission: ${ends.join(", ")}`);
  else info.push(`mission ends at: ${ends[0]}`);
}

// ---------------------------------------------------------------------------
// 3. scene reachability
// ---------------------------------------------------------------------------
if (CH) {
  const entries = new Map();
  const add = (scene, why) => {
    if (!scene) return;
    if (!entries.has(scene)) entries.set(scene, []);
    entries.get(scene).push(why);
  };
  add(CH.opening, "opening");
  (CH.npcs || []).forEach(n => {
    const e = n.entry || {};
    Object.keys(e).forEach(k => add(e[k], `npc ${n.id}.entry.${k}`));
  });
  (CH.triggers || []).forEach((tr, i) => add(tr.scene, `trigger #${i} (${tr.zone})`));

  if (CH.opening && (!CH.scenes || !CH.scenes[CH.opening])) {
    err(`opening scene "${CH.opening}" does not exist`);
  }
  for (const [scene, whys] of entries) {
    if (!CH.scenes || !CH.scenes[scene]) {
      err(`scene reference "${scene}" (${whys.join(", ")}) does not exist`);
    }
  }
  const unreachable = Object.keys(CH.scenes || {}).filter(s => !entries.has(s));
  if (unreachable.length) {
    err(`unreachable scene(s) — no opening/entry/trigger points at them: ${unreachable.join(", ")}`);
  }
  info.push(`scene entry points: ${entries.size}`);
}

// ---------------------------------------------------------------------------
// 4. NPC / trigger shape
// ---------------------------------------------------------------------------
if (CH) {
  const npcIds = new Set();
  const anchorZones = Object.keys(MAP.ANCHORS || {});
  (CH.npcs || []).forEach((n, i) => {
    const where = `npcs[${i}]${n && n.id ? " (" + n.id + ")" : ""}`;
    if (!n || !n.id) { err(`${where}: no id`); return; }
    if (npcIds.has(n.id)) err(`${where}: duplicate npc id`);
    npcIds.add(n.id);
    if (!n.name) err(`${where}: no name`);
    if (!n.role) err(`${where}: no role`);
    if (!n.zone) err(`${where}: no zone`);
    if (n.zone && anchorZones.indexOf(n.zone) < 0) {
      err(`${where}: zone "${n.zone}" is not a zone with anchors (${anchorZones.join(", ")})`);
    }
    const anchors = MAP.ANCHORS[n.zone] || [];
    if (typeof n.at !== "number" || n.at < 0 || n.at >= Math.max(1, anchors.length)) {
      err(`${where}: at ${n.at} outside ${n.zone} anchors (0..${anchors.length - 1})`);
    }
    if (!n.entry || !Object.keys(n.entry).length) err(`${where}: no entry map`);
    else if (!n.entry.default) warn(`${where}: entry has no default fallback`);
  });

  (CH.triggers || []).forEach((tr, i) => {
    const where = `triggers[${i}]`;
    if (!tr.zone) err(`${where}: no zone`);
    else if (!(MAP.ZONES || []).some(z => z.id === tr.zone) && tr.zone !== "corridor2") {
      err(`${where}: zone "${tr.zone}" is not a map zone`);
    }
    if (!tr.beat) err(`${where}: no beat`);
    if (!tr.scene) err(`${where}: no scene`);
    if (tr.once !== true) warn(`${where}: not once:true — might replay`);
  });
}

// ---------------------------------------------------------------------------
// 5. beats
// ---------------------------------------------------------------------------
if (CH) {
  const obj = CH.objectives || {};
  const objBeats = Object.keys(obj);
  if (objBeats.length < 7 || objBeats.length > 10) {
    err(`objectives should define 7-10 beats, found ${objBeats.length}`);
  }
  objBeats.forEach(b => {
    if (typeof obj[b] !== "string" || !obj[b].trim()) err(`objectives.${b} is empty`);
    if (obj[b] && obj[b].length > 34) {
      warn(`objectives.${b} is ${obj[b].length} chars — the HUD draws one line of ~34 (it will clip)`);
    }
  });
  (CH.triggers || []).forEach((tr, i) => {
    if (tr.beat && !obj[tr.beat]) err(`triggers[${i}].beat "${tr.beat}" is not in objectives`);
  });
  const seenBeat = new Set(effectBeats);
  for (const b of effectBeats) {
    if (!obj[b]) err(`effect { beat: "${b}" } is not in objectives`);
  }
  objBeats.forEach(b => {
    if (!seenBeat.has(b)) err(`objective beat "${b}" is never set by any { beat } effect`);
  });
  if (CH.objectives) info.push(`beats: ${objBeats.join(" -> ")}`);
}

// ---------------------------------------------------------------------------
// 6. minigames registered
// ---------------------------------------------------------------------------
if (CH && CH.scenes) {
  const used = new Set();
  for (const sk of Object.keys(CH.scenes)) {
    const nodes = CH.scenes[sk].nodes || {};
    for (const nk of Object.keys(nodes)) {
      const n = nodes[nk];
      if (n && n.type === "minigame") {
        used.add(n.game);
        if (REGISTERED.indexOf(n.game) < 0) {
          err(`${sk}/${nk}: minigame "${n.game}" is not registered (have: ${REGISTERED.join(", ")})`);
        }
      }
    }
  }
  info.push(`minigames used: ${[...used].join(", ")}`);
}

// ---------------------------------------------------------------------------
// 7. learning payload
// ---------------------------------------------------------------------------
let principleIds = [];
let noteIds = [];
let mgChoiceIds = [];

if (L) {
  const principles = L.principles || {};
  principleIds = Object.keys(principles);

  // 6 new principles, ids C2-001..C2-006
  if (principleIds.length !== 6) err(`expected 6 principles, found ${principleIds.length}`);
  principleIds.forEach((pid, i) => {
    const p = principles[pid];
    const want = "C2-00" + (i + 1);
    if (pid !== want) err(`principle ids should be C2-001..C2-006 in order; found "${pid}" at position ${i}`);
    if (p.id !== pid) err(`principles["${pid}"].id is "${p.id}"`);
    ["name", "source", "gist"].forEach(k => {
      if (typeof p[k] !== "string" || !p[k].trim()) err(`principles["${pid}"].${k} missing`);
    });
    if (!Array.isArray(p.atSulton) || p.atSulton.length < 2) err(`principles["${pid}"].atSulton needs >= 2 entries`);
    if (!Array.isArray(p.spotIt) || p.spotIt.length < 2) err(`principles["${pid}"].spotIt needs >= 2 entries`);
  });

  // archetypes
  const arch = L.archetypes || [];
  if (arch.length !== 3) err(`expected 3 archetypes, found ${arch.length}`);
  arch.forEach((a, i) => {
    if (!a.id) err(`archetypes[${i}]: no id`);
    if (!a.title || !a.text || !a.watchOut) err(`archetypes[${i}] (${a.id}): needs title, text, watchOut`);
    if (!a.when || typeof a.when !== "object") err(`archetypes[${i}] (${a.id}): no when`);
    else {
      const w = a.when;
      if (w.minAvg !== undefined && (typeof w.minAvg !== "number" || w.minAvg < -1 || w.minAvg > 2)) {
        err(`archetypes[${i}].when.minAvg out of range (-1..2)`);
      }
      if (w.maxAvg !== undefined && (typeof w.maxAvg !== "number" || w.maxAvg < -1 || w.maxAvg > 2)) {
        err(`archetypes[${i}].when.maxAvg out of range (-1..2)`);
      }
      if (w.minAvg !== undefined && w.maxAvg !== undefined && w.minAvg > w.maxAvg) {
        err(`archetypes[${i}]: minAvg > maxAvg`);
      }
      (w.requiresIntel || []).forEach(k => {
        if (!(L.intel || {})[k]) err(`archetypes[${i}]: requiresIntel "${k}" has no label in intel`);
      });
    }
  });

  // ideas
  const ideas = L.ideas || [];
  if (ideas.length < 6 || ideas.length > 8) err(`expected 6-8 ideas, found ${ideas.length}`);
  ideas.forEach((it, i) => {
    const where = `ideas[${i}]${it.id ? " (" + it.id + ")" : ""}`;
    if (!it.id) err(`${where}: no id`);
    ["title", "what", "difficulty", "principle", "effort", "cost"].forEach(k => {
      if (!it[k]) err(`${where}: missing ${k}`);
    });
    if (!Array.isArray(it.how) || it.how.length !== 3) err(`${where}: how must be exactly 3 steps`);
    if (it.principle && !principles[it.principle]) err(`${where}: principle "${it.principle}" not defined`);
  });

  // difficulties
  const diffs = L.difficulties || [];
  if (diffs.length < 5 || diffs.length > 7) err(`expected 5-7 difficulties, found ${diffs.length}`);
  diffs.forEach((d, i) => {
    const where = `difficulties[${i}]${d.id ? " (" + d.id + ")" : ""}`;
    ["id", "title", "why", "mitigation", "principle"].forEach(k => {
      if (!d[k]) err(`${where}: missing ${k}`);
    });
    if (d.principle && !principles[d.principle]) err(`${where}: principle "${d.principle}" not defined`);
  });

  // intel labels
  Object.keys(L.intel || {}).forEach(k => {
    if (!L.intel[k].label) err(`intel["${k}"]: no label`);
  });
}

// ---------------------------------------------------------------------------
// 8. choiceNotes coverage  (option ids + minigame choiceIds)
// ---------------------------------------------------------------------------
if (CH && L) {
  const mgSrc = exists("js/data/minigames/chapter2.js") ? read("js/data/minigames/chapter2.js") : "";
  const mgRe = /"(CH2_[A-Z0-9_]+)"/g;
  let mm;
  while ((mm = mgRe.exec(mgSrc))) mgChoiceIds.push(mm[1]);
  mgChoiceIds = [...new Set(mgChoiceIds)];

  const notes = L.choiceNotes || {};
  const noteIdsAll = Object.keys(notes);

  // every option id has a note
  optionIds.forEach(id => {
    if (!notes[id]) err(`choiceNotes is missing an entry for option "${id}"`);
  });
  // every minigame choiceId has a note
  mgChoiceIds.forEach(id => {
    if (!notes[id]) err(`choiceNotes is missing an entry for minigame choice id "${id}"`);
    if (!/^CH2_/.test(id)) err(`minigame choiceId "${id}" is not prefixed CH2_`);
  });
  // no orphans
  const known = new Set(optionIds.concat(mgChoiceIds));
  noteIdsAll.forEach(id => {
    if (!known.has(id)) err(`orphan choiceNote "${id}" — no option or minigame emits that id`);
  });
  // verdicts
  noteIdsAll.forEach(id => {
    const n = notes[id];
    if (!["good", "ok", "weak", "bad"].includes(n.verdict)) {
      err(`choiceNotes["${id}"].verdict "${n.verdict}" not in good|ok|weak|bad`);
    }
    if (!n.title) err(`choiceNotes["${id}"]: no title`);
    if (!n.why) err(`choiceNotes["${id}"]: no why`);
    if (!n.principle || !((L.principles || {})[n.principle])) {
      err(`choiceNotes["${id}"].principle "${n.principle}" is not a defined principle`);
    }
  });
  noteIds = noteIdsAll;
  info.push(`minigame choice ids: ${mgChoiceIds.join(", ")}`);

  // intel granted by script vs. labelled in learning
  const granted = new Set();
  for (const sk of Object.keys(CH.scenes || {})) {
    const nodes = CH.scenes[sk].nodes || {};
    for (const nk of Object.keys(nodes)) {
      const n = nodes[nk] || {};
      const lists = [n.effects || []].concat((n.options || []).map(o => (o && o.effects) || []));
      lists.forEach(list => list.forEach(e => { if (e && e.intel) granted.add(e.intel); }));
    }
  }
  granted.forEach(k => {
    if (!(L.intel || {})[k]) err(`script grants intel "${k}" but chapter2Learning.intel has no label for it`);
  });
  const usedIntel = new Set();
  for (const sk of Object.keys(CH.scenes || {})) {
    const nodes = CH.scenes[sk].nodes || {};
    for (const nk of Object.keys(nodes)) {
      (nodes[nk].options || []).forEach(o => {
        const r = o && o.requires;
        if (!r) return;
        const list = Array.isArray(r) ? r : [r];
        list.forEach(x => {
          if (x && x.intel) {
            usedIntel.add(x.intel);
            if (!(L.intel || {})[x.intel]) err(`option "${o.id}" requires intel "${x.intel}" with no label`);
          }
        });
      });
    }
  }
  const never = [...granted].filter(k => !usedIntel.has(k));
  if (never.length) info.push(`intel granted but not gating an option (still used in text/minigame): ${never.join(", ")}`);
}

// ---------------------------------------------------------------------------
// 9. principles referenced anywhere must exist
// ---------------------------------------------------------------------------
if (L) {
  const principles = L.principles || {};
  const refs = [];
  if (CH && CH.scenes) {
    for (const sk of Object.keys(CH.scenes)) {
      const nodes = CH.scenes[sk].nodes || {};
      for (const nk of Object.keys(nodes)) {
        const n = nodes[nk] || {};
        (n.effects || []).forEach(e => { if (e && e.note && e.note.principle) refs.push([sk + "/" + nk, e.note.principle]); });
        (n.options || []).forEach(o => {
          ((o && o.effects) || []).forEach(e => {
            if (e && e.note && e.note.principle) refs.push([sk + "/" + nk + "." + (o && o.id), e.note.principle]);
          });
        });
      }
    }
  }
  Object.keys(L.choiceNotes || {}).forEach(id => refs.push(["choiceNotes." + id, L.choiceNotes[id].principle]));
  (L.ideas || []).forEach((it, i) => refs.push(["ideas[" + i + "]", it.principle]));
  (L.difficulties || []).forEach((d, i) => refs.push(["difficulties[" + i + "]", d.principle]));

  refs.forEach(([where, pid]) => {
    if (!pid) err(`${where}: note/idea/difficulty with no principle`);
    else if (!principles[pid]) err(`${where}: principle "${pid}" does not exist in chapter2Learning.principles`);
  });

  // every principle should actually be used by somebody
  const used = new Set(refs.map(r => r[1]));
  Object.keys(principles).forEach(pid => {
    if (!used.has(pid)) warn(`principle "${pid}" is defined but never referenced`);
  });
  info.push(`principle references: ${refs.length}`);
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------
console.log("=== CHAPTER 2 VALIDATION ===");
info.forEach(i => console.log("  · " + i));
console.log("");
console.log(`  scenes       ${sceneKeys.length}`);
console.log(`  nodes        ${nodeCount}`);
console.log(`  options      ${optCount}`);
console.log(`  principles   ${principleIds.length}`);
console.log(`  choiceNotes  ${noteIds.length}`);
console.log(`  ideas        ${(L && L.ideas ? L.ideas.length : 0)}`);
console.log(`  difficulties ${(L && L.difficulties ? L.difficulties.length : 0)}`);
console.log(`  archetypes   ${(L && L.archetypes ? L.archetypes.length : 0)}`);
console.log(`  npcs         ${(CH && CH.npcs ? CH.npcs.length : 0)}`);
console.log(`  triggers     ${(CH && CH.triggers ? CH.triggers.length : 0)}`);
console.log("");

if (warnings.length) {
  console.log(`--- ${warnings.length} WARNING(S) ---`);
  warnings.forEach(w => console.log("  ! " + w));
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
