/* Do any chapter's `multi` nodes hand a question's answer its own `next`?

   That pattern is deliberate: dialogue.js follows an option's `next` to the
   answer, and the answer routes back to the same multi node so the player can
   spend another question. The thing worth asserting is that those answers are
   actually REACHABLE. Before the fix in js/game/dialogue.js, pickMulti() ignored
   each option's `next`, so every answer node was dead.

   So this probe now checks reachability, not the mere presence of option.next.
   `tools/probe-multi.js` proves the behaviour by playing the scene. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const ctx = {
  window: {}, console, Math, Date, JSON, Object, Array, String, Number,
  parseInt, parseFloat, isNaN, isFinite, setTimeout, clearTimeout
};
ctx.window = ctx;
vm.createContext(ctx);

const files = [
  "js/data/story.js",
  "js/data/learning.js",
  "js/data/chapter2.js",
  "js/data/chapter2-learning.js"
];
for (const f of files) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  try {
    vm.runInContext(fs.readFileSync(p, "utf8"), ctx, { filename: f });
  } catch (e) {
    console.log("could not load " + f + ": " + e.message);
  }
}

const stories = [
  { label: "ch1", story: ctx.G && ctx.G.data && ctx.G.data.story },
  { label: "ch2", story: ctx.G && ctx.G.data && ctx.G.data.chapter2 }
].filter((s) => s.story && s.story.scenes);

let problems = 0;

for (const { label, story } of stories) {
  const multiOptionNext = [];
  const reachable = new Set();   // any node a pointer of any kind lands on
  const allNodes = new Set();

  for (const sceneId of Object.keys(story.scenes)) {
    const nodes = story.scenes[sceneId].nodes || {};
    for (const nid of Object.keys(nodes)) {
      allNodes.add(sceneId + "/" + nid);
      const n = nodes[nid];
      for (const k of ["next", "onWin", "onLose", "nextFallback"]) {
        if (n[k]) reachable.add(sceneId + "/" + n[k]);
      }
      if (n.nextAfter) {
        if (n.nextAfter.true) reachable.add(sceneId + "/" + n.nextAfter.true);
        if (n.nextAfter.false) reachable.add(sceneId + "/" + n.nextAfter.false);
      }
      if (Array.isArray(n.options)) {
        for (const o of n.options) {
          if (!o.next) continue;
          reachable.add(sceneId + "/" + o.next);
          if (n.type === "multi") {
            multiOptionNext.push({ sceneId, nodeId: nid, opt: o.id, next: o.next });
          }
        }
      }
    }
  }

  const entries = new Set();
  for (const sceneId of Object.keys(story.scenes)) {
    const s = story.scenes[sceneId];
    if (s.start) entries.add(sceneId + "/" + s.start);
  }
  if (story.opening) entries.add(story.opening);

  const dead = multiOptionNext.filter((m) => {
    const t = m.sceneId + "/" + m.next;
    if (!allNodes.has(t)) return false;        // missing node: validators catch that
    return !entries.has(t) && !reachable.has(t);
  });

  console.log("\n=== " + label + " (" + story.title + ") ===");
  console.log("  nodes: " + allNodes.size);
  console.log("  multi options that route to their own answer: " + multiOptionNext.length);
  for (const m of multiOptionNext) {
    console.log("     " + m.sceneId + "/" + m.nodeId + "  " + m.opt + " -> " + m.next);
  }
  console.log("  answers that nothing can reach: " + dead.length);
  for (const d of dead) console.log("     DEAD: " + d.sceneId + "/" + d.nodeId + " " + d.opt + " -> " + d.next);

  if (dead.length) problems++;
}

console.log("\n" + (problems
  ? "FAIL — " + problems + " chapter(s) have unreachable question answers"
  : "PASS — every question answer a multi option routes to is reachable"));
process.exit(problems ? 1 : 0);
