const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

for (const f of ["gift", "travel", "ball"]) {
  const p = path.join(root, "js/data/minigames/" + f + ".js");
  const src = fs.readFileSync(p, "utf8");
  console.log("=== " + f + ".js (" + src.split("\n").length + " lines) ===");
  const reg = src.match(/G\.minigames\.register\(\s*["']([^"']+)/);
  console.log("  register id: " + (reg ? reg[1] : "NONE"));
  console.log("  create(): " + /create\s*:/.test(src));
  console.log("  api.finish count: " + (src.match(/api\.finish/g) || []).length);
  console.log("  update/draw/onKey: " + /update\s*:/.test(src) + " / " + /draw\s*:/.test(src) + " / " + /onKey\s*:/.test(src));
  console.log("  onPointer: " + /onPointer\s*:/.test(src));

  const lit = src.match(/choiceId\s*:\s*["'][^"']+["']/g) || [];
  console.log("  literal choiceIds (" + lit.length + "): " + lit.map(s => s.replace(/choiceId\s*:\s*/, "")).join(", "));

  const dyn = [...new Set((src.match(/["'](?:GIFT_|TRAVEL_|BALL_)[^"']*["']/g) || []))];
  console.log("  id literals used (" + dyn.length + "): " + dyn.slice(0, 24).join(", "));

  console.log("  reads api.state.intel: " + /state\.intel/.test(src));
  console.log("  reads api.state.trust: " + /state\.trust/.test(src));
  console.log("  reads api.state.flags: " + /state\.flags/.test(src));
  console.log("");
}
