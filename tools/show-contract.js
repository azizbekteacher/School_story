/* Print the exact shape of story.js / learning.js so a content author has the
   real contract rather than an approximation: node types, their fields, the
   effect keys, and how NPCs and triggers are declared. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.join(__dirname, "..");

// minimal DOM so the data files evaluate
const sb = { console, Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Set, Map,
  document: { readyState: "complete", addEventListener() {}, getElementById: () => null },
  requestAnimationFrame: () => 0, setTimeout: () => 0, performance: { now: () => 0 } };
const ctx = vm.createContext(sb);
vm.runInContext("globalThis.window=globalThis;globalThis.addEventListener=function(){};", ctx);
vm.runInContext(fs.readFileSync(path.join(root, "js/data/story.js"), "utf8"), ctx, { filename: "story.js" });
vm.runInContext(fs.readFileSync(path.join(root, "js/data/learning.js"), "utf8"), ctx, { filename: "learning.js" });
const G = sb.window.G;

const S = G.data.story;
console.log("=== story top-level keys ===");
console.log(Object.keys(S).join(", "));
console.log("start =", S.start);
console.log("scenes =", Object.keys(S.scenes).join(", "));
console.log("");

const nodeTypes = {}, nodeFields = {}, effectKeys = {}, optFields = {};
let nodeCount = 0, optCount = 0;
for (const sk of Object.keys(S.scenes)) {
  const nodes = S.scenes[sk].nodes;
  for (const nk of Object.keys(nodes)) {
    const n = nodes[nk]; nodeCount++;
    nodeTypes[n.type] = (nodeTypes[n.type] || 0) + 1;
    for (const k of Object.keys(n)) nodeFields[k] = (nodeFields[k] || 0) + 1;
    (n.effects || []).forEach(e => Object.keys(e).forEach(k => effectKeys[k] = (effectKeys[k] || 0) + 1));
    (n.options || []).forEach(o => {
      optCount++;
      for (const k of Object.keys(o)) optFields[k] = (optFields[k] || 0) + 1;
      (o.effects || []).forEach(e => Object.keys(e).forEach(k => effectKeys[k] = (effectKeys[k] || 0) + 1));
    });
  }
}
console.log(`nodes=${nodeCount} options=${optCount}`);
console.log("\n=== node.type values ===");
console.log(JSON.stringify(nodeTypes, null, 1));
console.log("\n=== node fields (count of nodes using) ===");
console.log(JSON.stringify(nodeFields, null, 1));
console.log("\n=== option fields ===");
console.log(JSON.stringify(optFields, null, 1));
console.log("\n=== effect keys (count of uses) ===");
console.log(JSON.stringify(effectKeys, null, 1));

console.log("\n=== example of EACH node type ===");
const seen = {};
for (const sk of Object.keys(S.scenes)) {
  for (const nk of Object.keys(S.scenes[sk].nodes)) {
    const n = S.scenes[sk].nodes[nk];
    if (seen[n.type]) continue;
    seen[n.type] = 1;
    console.log(`\n--- ${n.type}  (scene ${sk} / node ${nk}) ---`);
    console.log(JSON.stringify(n, null, 1).slice(0, 900));
  }
}

console.log("\n=== npcs ===");
console.log(JSON.stringify(S.npcs, null, 1).slice(0, 1800));

console.log("\n=== triggers ===");
console.log(JSON.stringify(S.triggers, null, 1).slice(0, 1200));

console.log("\n=== scene entry shape (one scene) ===");
const oneScene = S.scenes[Object.keys(S.scenes)[1]];
console.log(JSON.stringify({ keys: Object.keys(oneScene), title: oneScene.title, start: oneScene.start, nodeIds: Object.keys(oneScene.nodes).slice(0, 8) }, null, 1));

const L = G.data.learning;
console.log("\n=== learning top-level keys ===");
console.log(Object.keys(L).join(", "));
console.log("principles (object):", Object.keys(L.principles).join(", "));
console.log("\nprinciple example:", JSON.stringify(L.principles[Object.keys(L.principles)[0]], null, 1));
const ck = Object.keys(L.choiceNotes);
console.log("\nchoiceNotes count:", ck.length, "sample ids:", ck.slice(0, 8).join(", "));
console.log("choiceNote example:", JSON.stringify(L.choiceNotes[ck[0]], null, 1));
console.log("\nintel labels:", JSON.stringify(L.intel || L.intelLabels || null).slice(0, 500));
console.log("\narchetype example:", JSON.stringify(L.archetypes[0], null, 1));
console.log("\ndifficulty example:", JSON.stringify(L.difficulties[0], null, 1));
console.log("\nidea example:", JSON.stringify(L.ideas[0], null, 1));
