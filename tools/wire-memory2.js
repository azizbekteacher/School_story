/* Wire save/resume into main.js using small, individually-asserted anchors.
   Large multi-line anchors proved brittle; single unique lines do not. */
const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "js/main.js");
let t = fs.readFileSync(p, "utf8");
let fail = 0;

function sub(from, to, label) {
  const n = t.split(from).length - 1;
  if (n !== 1) { console.log(`MISS ${label}: found ${n} occurrence(s)`); fail++; return; }
  t = t.split(from).join(to);
  console.log(`ok   ${label}`);
}

// 1. load the save once when the title screen updates
sub(
  "      titleT += dt;\n      if (G.input.wasPressed(\"enter\")",
  "      titleT += dt;\n      var saved = G.memory.load();\n      if (G.input.wasPressed(\"enter\")",
  "load save on title"
);

// 2. Enter resumes when a save exists, starts fresh otherwise
sub(
  "        pendingState = startGame;",
  "        pendingState = function () { startGame(saved); };",
  "Enter -> startGame(saved)"
);

// 3. N restarts, and the play state gains memory keys
sub(
  "    if (state === \"play\") {\n      // pause? (no pause screen; notebook/esc handled elsewhere)",
  [
    "      if (saved && G.input.wasPressed(\"n\")) {",
    "        G.input.consume(\"n\");",
    "        G.memory.clear();",
    "        G.audio.bad();",
    "        pendingState = function () { startGame(null); };",
    "        fadeDir = 1;",
    "      }",
    "      return;",
    "    }",
    "",
    "    if (state === \"play\") {",
    "      // memory: accrue playtime, flush periodically, honour M / F",
    "      G.memory.tickPlaytime();",
    "      if (G.input.wasPressed(\"m\")) {",
    "        G.input.consume(\"m\");",
    "        G.memory.autosave(\"manual\");",
    "        var mst = G.memory.status();",
    "        if (mst.fileWrites) G.quest.showToast(\"Saqlandi \\u2192 memory.md va memory.js\", \"good\");",
    "        else if (mst.supportsFileAccess) G.quest.showToast(\"Saqlandi. Faylga yozish uchun F\", \"info\");",
    "        else G.quest.showToast(\"Saqlandi (brauzer xotirasida)\", \"info\");",
    "      }",
    "      if (G.input.wasPressed(\"f\")) {",
    "        G.input.consume(\"f\");",
    "        G.memory.attachFolder().then(function (r) {",
    "          if (r.ok) G.quest.showToast(\"memory.md endi avtomatik yoziladi \\u2192 \" + r.name, \"good\");",
    "          else G.quest.showToast(r.reason || \"Fayl tanlanmadi\", \"info\");",
    "        });",
    "      }",
    "      // pause? (no pause screen; esc handled elsewhere)"
  ].join("\n"),
  "N key + play-state memory keys"
);

// 4. autosave whenever a beat advances or the mission ends
sub(
  "    G.state.started = true;",
  "    G.state.started = true;\n    if (G.state.onChange) G.state.onChange(function () { G.memory.autosave(\"state\"); });",
  "autosave hook registration"
);

fs.writeFileSync(p, t);
console.log(fail ? `\n${fail} anchor(s) missed — file still written` : "\nmain.js wired");
if (fail) process.exitCode = 1;
