const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

// Load learning.js in a sandbox
const vm = require("vm");
const ctx = vm.createContext({ console, Math, JSON });
vm.runInContext("globalThis.window = globalThis;", ctx);
vm.runInContext(fs.readFileSync(path.join(root, "js/data/learning.js"), "utf8"), ctx);
const learning = ctx.window.G.data.learning;
const keys = Object.keys(learning.choiceNotes || {});

console.log("choiceNotes total: " + keys.length);
const travel = keys.filter(k => k.startsWith("TRAVEL_"));
const gift = keys.filter(k => k.startsWith("GIFT_"));
const ball = keys.filter(k => k.startsWith("BALL_"));
const other = keys.filter(k => !k.startsWith("TRAVEL_") && !k.startsWith("GIFT_") && !k.startsWith("BALL_"));
console.log("TRAVEL_*: " + travel.length + " -> " + travel.join(", "));
console.log("GIFT_*:   " + gift.join(", "));
console.log("BALL_*:   " + ball.join(", "));
console.log("story choices: " + other.length + " -> " + other.join(", "));

// what travel.js can emit
const travelSrc = fs.readFileSync(path.join(root, "js/data/minigames/travel.js"), "utf8");
console.log("\n--- travel.js moment/key definitions ---");
const momentDefs = travelSrc.match(/moment\s*:\s*\d+/g) || [];
console.log("moment fields: " + momentDefs.length);
const keyDefs = [...new Set((travelSrc.match(/key\s*:\s*["'][a-z]["']/g) || []))];
console.log("keys: " + keyDefs.join(", "));

// derive the full possible set: TRAVEL_1..5 x a,b,c
const possible = [];
for (let m = 1; m <= 5; m++) for (const k of ["a", "b", "c"]) possible.push("TRAVEL_" + m + "_" + k);
const missing = possible.filter(p => !keys.includes(p));
console.log("\npossible TRAVEL ids: " + possible.length);
console.log("missing from learning: " + (missing.length ? missing.join(", ") : "NONE"));

// Check the specific keys travel.js actually uses
const usedKeys = [...new Set((travelSrc.match(/key:\s*["']([a-z])["']/g) || []).map(s => s.match(/["']([a-z])["']/)[1]))];
console.log("used keys in travel.js: " + usedKeys.join(", "));
