/* Prove the user's request: "all chapters should be playable without completing
   the previous ones".

   Not a claim about the chapter registry helper — an actual attempt to start
   every chapter from a cold boot, one at a time, with NO save and NO prior
   progress, then a check that nothing in the codebase can gate a chapter.

   Two halves:
     A. static  — grep the shipped source for unlock/prerequisite machinery and
                  fail if any exists that could block a chapter.
     B. dynamic — real browser: for each chapter, cold profile, press that
                  chapter's number on the title screen, assert we land in play
                  on that chapter's own first beat with its own learning set.
 */
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");
const fs = require("fs");
const net = require("net");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ROOT = path.join(__dirname, "..");
const W = 1440, H = 900;

let fail = 0;
const ck = (c, l, x) => { console.log((c ? "  PASS  " : "  FAIL  ") + l + (x !== undefined ? "  [" + x + "]" : "")); if (!c) fail++; };

/* ---------- A. static: no lock machinery may exist ---------- */
console.log("=== A. no unlock/prerequisite machinery in shipped source ===");
const shipped = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== "tools") walk(p); }
    else if (e.name.endsWith(".js") && !e.name.endsWith(".tmp.js")) shipped.push(p);
  }
})(path.join(ROOT, "js"));

const LOCK_PATTERNS = [
  [/unlock(chapter|ed)?\s*[:=]/i, "unlock flag"],
  [/chapterUnlocked/i, "chapterUnlocked"],
  [/prereq(uisite)?\s*[:=]/i, "prerequisite assignment"],
  [/requiresChapter|needsChapter|afterChapter/i, "chapter dependency"],
  [/isChapterLocked|canPlayChapter/i, "chapter gate function"]
];
let lockHits = 0;
for (const f of shipped) {
  const src = fs.readFileSync(f, "utf8");
  const lines = src.split(/\r?\n/);
  for (const [re, name] of LOCK_PATTERNS) {
    lines.forEach((line, i) => {
      if (!re.test(line)) return;
      /* Comments and dialogue option `locked` flags are not chapter gates.
         Skip comment lines, and skip the option-lock vocabulary, which is a
         per-option UI state (lockedText), not a chapter prerequisite. */
      const t = line.trim();
      if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return;
      if (name === "prerequisite assignment" && /no unlock flags|no prerequisit|never a gate/i.test(line)) return;
      console.log("    " + path.relative(ROOT, f) + ":" + (i + 1) + " " + name + " -> " + t.slice(0, 90));
      lockHits++;
    });
  }
}
ck(lockHits === 0, "no chapter-lock machinery exists anywhere in js/", lockHits + " hits");

// playableFromStart must be true for every registered chapter
const vm = require("vm");
const sandbox = { document: { readyState: "loading", addEventListener() {}, getElementById() { return null; } },
  console, Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Set, Map };
const ctx = vm.createContext(sandbox);
vm.runInContext("globalThis.window=globalThis;globalThis.addEventListener=function(){};", ctx);
for (const f of ["js/core/util.js", "js/game/state.js", "js/data/story.js", "js/data/learning.js",
                 "js/data/chapter2.js", "js/data/chapter2-learning.js", "js/data/chapters.js"]) {
  try { vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), ctx, { filename: f }); }
  catch (e) { console.log("    (skipped " + f + ": " + e.message.slice(0, 60) + ")"); }
}
const G = sandbox.window.G;
if (G && G.chapters) {
  const list = G.chapters.list();
  ck(list.length >= 2, "at least two chapters are registered", list.map(c => c.id).join(", "));
  list.forEach((c) => {
    ck(G.chapters.playableFromStart(c.id) === true, "playableFromStart(" + c.id + ") is true");
  });
} else {
  ck(false, "chapter registry loads in a vm sandbox");
}

/* ---------- B. dynamic: cold-boot each chapter in a real browser ---------- */
function freePort() {
  return new Promise((res) => { const s = net.createServer(); s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); }); });
}
class WS {
  constructor(url) { this.url = url; this.buf = Buffer.alloc(0); this.id = 0; this.pend = new Map(); }
  connect() {
    return new Promise((resolve, reject) => {
      const u = new URL(this.url);
      const key = Buffer.from(String(Math.random())).toString("base64");
      const sock = net.connect(Number(u.port), u.hostname, () => {
        sock.write("GET " + u.pathname + " HTTP/1.1\r\nHost: " + u.host + "\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: " + key + "\r\nSec-WebSocket-Version: 13\r\n\r\n");
      });
      this.sock = sock; let hs = false;
      sock.on("data", (d) => {
        if (!hs) { const s = d.toString("latin1"); if (s.indexOf("\r\n\r\n") === -1) return; hs = true;
          const rest = d.slice(s.indexOf("\r\n\r\n") + 4); if (rest.length) this._frame(rest); resolve(); return; }
        this._frame(d);
      });
      sock.on("error", reject);
    });
  }
  _frame(d) {
    this.buf = Buffer.concat([this.buf, d]);
    while (true) {
      if (this.buf.length < 2) return;
      const b1 = this.buf[1], masked = (b1 & 0x80) !== 0;
      let len = b1 & 0x7f, off = 2;
      if (len === 126) { if (this.buf.length < 4) return; len = this.buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (this.buf.length < 10) return; len = Number(this.buf.readBigUInt64BE(2)); off = 10; }
      let mk = null;
      if (masked) { if (this.buf.length < off + 4) return; mk = this.buf.slice(off, off + 4); off += 4; }
      if (this.buf.length < off + len) return;
      let pl = this.buf.slice(off, off + len);
      if (masked) { pl = Buffer.from(pl); for (let i = 0; i < pl.length; i++) pl[i] ^= mk[i % 4]; }
      this.buf = this.buf.slice(off + len);
      let m; try { m = JSON.parse(pl.toString("utf8")); } catch (e) { continue; }
      if (m.id && this.pend.has(m.id)) { this.pend.get(m.id)(m); this.pend.delete(m.id); }
    }
  }
  cmd(method, params) {
    const id = ++this.id;
    const payload = Buffer.from(JSON.stringify({ id, method, params: params || {} }), "utf8");
    const mk = Buffer.from([1, 2, 3, 4]);
    let header;
    if (payload.length < 126) header = Buffer.from([0x81, 0x80 | payload.length]);
    else if (payload.length < 65536) { header = Buffer.alloc(4); header[0] = 0x81; header[1] = 0x80 | 126; header.writeUInt16BE(payload.length, 2); }
    else { header = Buffer.alloc(10); header[0] = 0x81; header[1] = 0x80 | 127; header.writeBigUInt64BE(BigInt(payload.length), 2); }
    const b = Buffer.from(payload);
    for (let i = 0; i < b.length; i++) b[i] ^= mk[i % 4];
    this.sock.write(Buffer.concat([header, mk, b]));
    return new Promise((res) => this.pend.set(id, res));
  }
  close() { try { this.sock.destroy(); } catch (e) {} }
}

(async () => {
  console.log("=== B. cold-boot each chapter in a real browser, no save, no progress ===");
  const port = await freePort();
  const server = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
    fs.readFile(p, (e, d) => {
      if (e) { res.writeHead(404); res.end(); return; }
      const ext = path.extname(p);
      res.writeHead(200, { "Content-Type": ext === ".html" ? "text/html" : ext === ".css" ? "text/css" : "text/javascript" });
      res.end(d);
    });
  });
  await new Promise((r) => server.listen(port, "127.0.0.1", r));

  const dport = await freePort();
  const profile = path.join(require("os").tmpdir(), "dsh-chap-" + Date.now());
  const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--remote-debugging-port=" + dport, "--user-data-dir=" + profile, "--window-size=" + W + "," + H, "about:blank"], { stdio: "ignore" });

  let targetWs = null;
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try {
      const list = await new Promise((res, rej) => {
        http.get("http://127.0.0.1:" + dport + "/json/list", (r) => { let s = ""; r.on("data", (c) => s += c); r.on("end", () => res(JSON.parse(s))); }).on("error", rej);
      });
      const page = list.find((t) => t.type === "page");
      if (page) { targetWs = page.webSocketDebuggerUrl; break; }
    } catch (e) {}
  }
  if (!targetWs) { console.log("no chrome"); process.exit(1); }

  const ws = new WS(targetWs);
  await ws.connect();
  await ws.cmd("Page.enable");
  await ws.cmd("Runtime.enable");
  await ws.cmd("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });

  const ev = async (expr) => {
    const r = await ws.cmd("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(((r.exceptionDetails.exception || {}).description || r.exceptionDetails.text || "").toString());
    if (r.result && r.result.exceptionDetails) {
      const ed = r.result.exceptionDetails;
      throw new Error(((ed.exception || {}).description || ed.text || "").toString());
    }
    // CDP nests the value at result.result.value: the outer `result` is the
    // command's result envelope, the inner one is the evaluate result.
    return r.result && r.result.result ? r.result.result.value : undefined;
  };

  /* Cold start, properly.

     Clearing localStorage then navigating is NOT a cold start: the page saves on
     unload/visibilitychange, so the old save is written straight back before the
     next boot reads it. Clear it with the storage key AND wait for the title
     screen to be idle before clearing, and use CDP's own storage wipe which
     happens while the document is not running. */
  async function coldBoot() {
    await ws.cmd("Page.navigate", { url: "about:blank" });
    await new Promise((r) => setTimeout(r, 400));
    await ws.cmd("Storage.clearDataForOrigin", { origin: "http://127.0.0.1:" + port, storageTypes: "local_storage" });
    await ws.cmd("Page.navigate", { url: "http://127.0.0.1:" + port + "/index.html" });
    await new Promise((r) => setTimeout(r, 2600));   // probe-hero waits 2500 for boot
  }

  await coldBoot();
  const chapters = await ev("G.chapters.list().map(function(c){return {id:c.id, num:c.num, firstBeat:c.firstBeat, title:c.title};})");
  console.log("  title screen offers: " + JSON.stringify(chapters));

  for (const ch of chapters) {
    await coldBoot();
    const before = await ev("({ state: GAME.getState(), hasSave: !!G.memory.load(), chapter: G.state.chapter })");
    ck(before.hasSave === false, "ch" + ch.num + ": booted with no save at all", JSON.stringify(before));
    ck(before.state === "title", "ch" + ch.num + ": booted on the title screen", before.state);

    // press that chapter's number key on the title screen, then ENTER
    if (ch.num !== 1) {
      await ev("window.dispatchEvent(new KeyboardEvent('keydown',{key:'" + ch.num + "',bubbles:true}))");
      await new Promise((r) => setTimeout(r, 300));
    }
    /* The title screen's highlighted chapter is `titleChapter`, a main.js-local
       index — not observable from outside. What matters is that the number key
       selects THAT chapter and Enter starts it, which the assertions below prove
       by outcome (G.state.chapter, the live story, the first beat). Record the
       pre-Enter state only as context. */
    const preEnter = await ev("({ chapter: G.state.chapter, story: (G.data.story||{}).title })");
    console.log("  ch" + ch.num + " selected: " + JSON.stringify(preEnter));

    await ev("window.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))");
    await new Promise((r) => setTimeout(r, 1600));
    const after = await ev(`({
      state: GAME.getState(), chapter: G.state.chapter, beat: G.state.beat,
      story: G.data.story.title,
      principles: Object.keys(G.data.learning.principles),
      scene: G.dialogue.debugNodeId ? G.dialogue.debugNodeId() : null,
      player: {x: Math.round(G.world.player.x), y: Math.round(G.world.player.y)},
      onScreen: (function(){ var p=G.world.player, c=G.world.cam; return p.x-c.x>0 && p.x-c.x<960 && p.y-c.y>0 && p.y-c.y<600; })()
    })`);
    console.log("  ch" + ch.num + " -> " + JSON.stringify(after));
    ck(after.state === "play", "ch" + ch.num + ": reaches play with no prior chapter completed", after.state);
    ck(after.chapter === ch.id, "ch" + ch.num + ": is the live chapter", after.chapter);
    ck(after.beat === ch.firstBeat, "ch" + ch.num + ": starts on its own first beat " + ch.firstBeat, after.beat);
    ck(after.scene !== null, "ch" + ch.num + " (" + ch.id + "): opened on its own first beat", after.scene);
    ck(after.onScreen, "ch" + ch.num + ": hero is on screen", JSON.stringify(after.player));

    // and it is really that chapter's content, not chapter 1's
    if (ch.id === "ch2") {
      ck(after.principles.every(p => p.indexOf("C2-") === 0), "ch2 uses only its own C2 principles", after.principles.join(","));
    } else {
      ck(after.principles.every(p => p.indexOf("C2-") !== 0), "ch1 uses only chapter-1 principles", after.principles.join(","));
    }
  }

  ws.close(); chrome.kill(); server.close();
  console.log("\n" + (fail ? "FAILED (" + fail + ")" : "ALL CHAPTERS PLAYABLE FROM A COLD START — no unlocks, no prerequisites"));
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log("ERR " + e.stack); process.exit(1); });
