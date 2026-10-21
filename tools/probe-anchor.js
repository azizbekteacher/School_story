const fs = require("fs");
const path = require("path");
const t = fs.readFileSync(path.join(__dirname, "..", "js/main.js"), "utf8");
const probes = [
  'if (state === "play") {',
  '// pause?',
  'esc handled elsewhere',
  '(no pause screen; esc handled elsewhere)',
  '      // pause? (no pause screen; esc handled elsewhere)',
  '    if (state === "play") {\n      // pause? (no pause screen; esc handled elsewhere)',
];
for (const s of probes) console.log(String(t.split(s).length - 1).padStart(3), JSON.stringify(s));
const i = t.indexOf("// pause?");
console.log("\ncontext around first '// pause?':");
console.log(JSON.stringify(t.slice(i - 60, i + 90)));
