/* Wire save/resume into main.js: title Continue/New, autosave, M and F keys. */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const p = path.join(root, "js/main.js");
let t = fs.readFileSync(p, "utf8");

const OLD_TITLE = `    if (state === "title") {
      titleT += dt;
      if (G.input.wasPressed("enter") || G.input.wasPressed("space")) {
        G.input.consume("enter"); G.input.consume("space");
        G.audio.select();
        pendingState = startGame;
        fadeDir = 1;
      }
      return;
    }

    if (state === "play") {
      // pause? (no pause screen; esc handled elsewhere)
      if (G.debrief.isVisible()) { state = "debrief"; }`;

const NEW_TITLE = `    if (state === "title") {
      titleT += dt;
      var saved = G.memory.load();
      if (G.input.wasPressed("enter") || G.input.wasPressed("space")) {
        G.input.consume("enter"); G.input.consume("space");
        G.audio.select();
        pendingState = function () { startGame(saved); };
        fadeDir = 1;
      }
      // N — start over, discarding the save
      if (saved && G.input.wasPressed("n")) {
        G.input.consume("n");
        G.memory.clear();
        G.audio.bad();
        pendingState = function () { startGame(null); };
        fadeDir = 1;
      }
      return;
    }

    if (state === "play") {
      // memory: accrue playtime, flush periodically, and honour M / F
      G.memory.tickPlaytime();
      if (G.input.wasPressed("m")) {
        G.input.consume("m");
        G.memory.autosave("manual");
        var st = G.memory.status();
        if (st.fileWrites) G.quest.showToast("Saqlandi → memory.md va memory.js", "good");
        else if (st.supportsFileAccess) G.quest.showToast("Saqlandi. Faylga yozish uchun F", "info");
        else G.quest.showToast("Saqlandi (brauzer xotirasida)", "info");
      }
      if (G.input.wasPressed("f")) {
        G.input.consume("f");
        G.memory.attachFolder().then(function (r) {
          if (r.ok) G.quest.showToast("memory.md endi avtomatik yoziladi → " + r.name, "good");
          else G.quest.showToast(r.reason || "Fayl tanlanmadi", "info");
        });
      }
      // pause? (no pause screen; esc handled elsewhere)
      if (G.debrief.isVisible()) { state = "debrief"; }`;

function must(from, to, label) {
  const n = t.split(from).length - 1;
  if (n !== 1) { console.log(`MISS ${label}: found ${n}`); process.exitCode = 1; return false; }
  t = t.split(from).join(to);
  console.log(`ok   ${label}`);
  return true;
}

must(OLD_TITLE, NEW_TITLE, "title + play input block");

// install memory at boot
must(`  function boot() {`, `  function boot() {
    G.memory.install();`, "install memory on boot");

// title prompt: reflect whether a save exists
const OLD_PROMPT = `    var pulse = 0.6 + 0.4 * Math.sin(t * 2.4);
    ctx.globalAlpha = pulse;
    ctx.font = "bold 16px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#f2dfae";
    ctx.fillText("ENTER — boshlash", W / 2, H - 108);
    ctx.globalAlpha = 1;`;

const NEW_PROMPT = `    var pulse = 0.6 + 0.4 * Math.sin(t * 2.4);
    ctx.globalAlpha = pulse;
    ctx.font = "bold 16px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#f2dfae";
    var saveInfo = G.memory.load();
    if (saveInfo) {
      ctx.fillText("ENTER — davom etish", W / 2, H - 108);
      ctx.globalAlpha = 1;
      ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(242,223,174,.75)";
      var when = String(saveInfo.savedAt || "").replace("T", " ").slice(0, 16);
      ctx.fillText("Saqlangan: " + when + "  ·  " + (saveInfo.beat || "") +
                   "  ·  ishonch " + saveInfo.trust + "/10", W / 2, H - 88);
      ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(244,236,224,.42)";
      ctx.fillText("N — boshidan boshlash", W / 2, H - 70);
    } else {
      ctx.fillText("ENTER — boshlash", W / 2, H - 108);
      ctx.globalAlpha = 1;
    }`;

must(OLD_PROMPT, NEW_PROMPT, "title prompt with save info");

// controls hint: mention M / F
const OLD_HINT = `    ctx.fillText("WASD / strelkalar — yurish    E — gaplash    TAB — daftar", W / 2, H - 76);`;
const NEW_HINT = `    ctx.fillText("WASD / strelkalar — yurish    E — gaplash    TAB — daftar    M — saqlash", W / 2, H - 76);`;
must(OLD_HINT, NEW_HINT, "controls hint");

// footer hint on the play HUD
const OLD_FOOT = `    ctx.fillText("WASD — yurish · E — gaplash · TAB — daftar", W - 20, H - 16);`;
const NEW_FOOT = `    ctx.fillText("WASD — yurish · E — gaplash · TAB — daftar · M — saqlash", W - 20, H - 16);`;
must(OLD_FOOT, NEW_FOOT, "play footer hint");

fs.writeFileSync(p, t);
console.log(process.exitCode ? "\nINCOMPLETE" : "\nmain.js wired");
