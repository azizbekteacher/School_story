/* Visual smoke test via headless Chrome screenshot.
   Drives the real page with the debug bridge through CDP, captures PNGs.

   Usage: node tools/shots.js
   Requires: Chrome at the standard Program Files path.
*/
const fs = require("fs");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const net = require("net");

const root = path.join(__dirname, "..");
const outDir = path.join(root, "tools", "shots");
fs.mkdirSync(outDir, { recursive: true });

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222 + Math.floor(Math.random() * 300);
const PROFILE = path.join(require("os").tmpdir(), "dsh-shots-" + Date.now());

/* ---------- tiny static server ---------- */
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".json": "application/json" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end("nope"); return; }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});

function waitPort(port, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function attempt() {
      const s = net.connect(port, "127.0.0.1");
      s.on("connect", () => { s.destroy(); resolve(); });
      s.on("error", () => {
        s.destroy();
        if (Date.now() - start > timeoutMs) reject(new Error("port timeout " + port));
        else setTimeout(attempt, 150);
      });
    })();
  });
}

function cdpGet(pathname) {
  return new Promise((resolve, reject) => {
    http.get({ host: "127.0.0.1", port: PORT, path: pathname }, res => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => { try { resolve(JSON.parse(d)); } catch (e) { reject(new Error("bad json: " + d.slice(0, 200))); } });
    }).on("error", reject);
  });
}

/* ---------- minimal websocket client (no deps) ---------- */
const crypto = require("crypto");
class WS {
  constructor(url) {
    const u = new URL(url);
    this.host = u.hostname; this.port = u.port; this.key = crypto.randomBytes(16).toString("base64");
    this.buf = Buffer.alloc(0); this.frags = []; this.handlers = new Map(); this.id = 0; this.ready = false;
  }
  connect() {
    return new Promise((resolve, reject) => {
      const req = http.request({
        host: this.host, port: this.port, path: new URL(`ws://${this.host}:${this.port}`).pathname || "/",
        headers: {
          Connection: "Upgrade", Upgrade: "websocket",
          "Sec-WebSocket-Key": this.key, "Sec-WebSocket-Version": "13"
        }
      });
      // path must be the ws path from the URL
      req.setHeader("Connection", "Upgrade");
      req.on("upgrade", (res, socket) => { this.sock = socket; this.attach(); this.ready = true; resolve(); });
      req.on("error", reject);
      req.end();
    });
  }
  attach() {
    this.sock.on("data", (d) => {
      this.buf = Buffer.concat([this.buf, d]);
      this.parse();
    });
    this.sock.on("error", () => {});
  }
  parse() {
    while (this.buf.length >= 2) {
      const b0 = this.buf[0], b1 = this.buf[1];
      const opcode = b0 & 0x0f;
      const masked = (b1 & 0x80) !== 0;
      let len = b1 & 0x7f;
      let off = 2;
      if (len === 126) { if (this.buf.length < 4) return; len = this.buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (this.buf.length < 10) return; len = Number(this.buf.readBigUInt64BE(2)); off = 10; }
      let mask = null;
      if (masked) { if (this.buf.length < off + 4) return; mask = this.buf.slice(off, off + 4); off += 4; }
      if (this.buf.length < off + len) return;
      let payload = this.buf.slice(off, off + len);
      if (mask) { const c = Buffer.alloc(len); for (let i = 0; i < len; i++) c[i] = payload[i] ^ mask[i % 4]; payload = c; }
      this.buf = this.buf.slice(off + len);
      if (opcode === 0x1) {
        const txt = payload.toString("utf8");
        try { const msg = JSON.parse(txt); this.onMessage(msg); } catch (e) {}
      } else if (opcode === 0x8) { this.sock.end(); }
    }
  }
  onMessage(msg) {
    if (msg.id && this.handlers.has(msg.id)) { const h = this.handlers.get(msg.id); this.handlers.delete(msg.id); h(msg); }
  }
  send(obj) {
    const data = Buffer.from(JSON.stringify(obj), "utf8");
    const mask = crypto.randomBytes(4);
    const masked = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i++) masked[i] = data[i] ^ mask[i % 4];
    let header;
    if (data.length < 126) header = Buffer.from([0x81, 0x80 | data.length]);
    else if (data.length < 65536) { header = Buffer.alloc(4); header[0] = 0x81; header[1] = 0x80 | 126; header.writeUInt16BE(data.length, 2); }
    else { header = Buffer.alloc(10); header[0] = 0x81; header[1] = 0x80 | 127; header.writeBigUInt64BE(BigInt(data.length), 2); }
    this.sock.write(Buffer.concat([header, mask, masked]));
  }
  cmd(method, params) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.handlers.set(id, (m) => m.error ? reject(new Error(method + ": " + JSON.stringify(m.error))) : resolve(m.result));
      this.send({ id, method, params: params || {} });
    });
  }
  close() { try { this.sock.end(); } catch (e) {} }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  const webPort = server.address().port;
  const url = `http://127.0.0.1:${webPort}/index.html`;
  console.log("serving " + url);

  const chrome = spawn(CHROME, [
    "--headless=new",
    "--remote-debugging-port=" + PORT,
    "--user-data-dir=" + PROFILE,
    "--no-first-run", "--no-default-browser-check",
    "--disable-gpu", "--hide-scrollbars",
    "--window-size=1200,860",
    "--force-device-scale-factor=1",
    "about:blank"
  ], { stdio: ["ignore", "pipe", "pipe"] });
  let chromeErr = "";
  chrome.stderr.on("data", d => chromeErr += d.toString());

  try {
    await waitPort(PORT);
    // Use the existing blank page target and navigate it (GET /json/new needs PUT).
    const list = await cdpGet("/json/list");
    const page = list.find(t => t.type === "page");
    if (!page) throw new Error("no page target");
    const pageWs = page.webSocketDebuggerUrl;

    // The ws path is /devtools/page/<id>
    const wsUrl = pageWs.replace(/^ws:\/\//, "http://");
    const u = new URL(wsUrl);
    const ws = new WS(`ws://${u.host}${u.pathname}`);
    ws.path = u.pathname;
    // patch: our WS connect uses URL path
    const origConnect = ws.connect.bind(ws);
    ws.connect = function () {
      return new Promise((resolve, reject) => {
        const req = http.request({
          host: this.host, port: this.port, path: u.pathname,
          headers: { Connection: "Upgrade", Upgrade: "websocket", "Sec-WebSocket-Key": this.key, "Sec-WebSocket-Version": "13" }
        });
        req.on("upgrade", (res, socket) => { this.sock = socket; this.attach(); this.ready = true; resolve(); });
        req.on("error", reject);
        req.end();
      });
    };
    await ws.connect();

    const logs = [];
    ws.onMessage = (msg) => {
      if (msg.method === "Runtime.consoleAPICalled") {
        const args = (msg.params.args || []).map(a => a.value !== undefined ? a.value : a.description).join(" ");
        logs.push("[" + msg.params.type + "] " + args);
      }
      if (msg.method === "Runtime.exceptionThrown") {
        const ex = msg.params.exceptionDetails;
        logs.push("[EXCEPTION] " + (ex.exception && ex.exception.description || ex.text));
      }
      if (msg.id && ws.handlers.has(msg.id)) { const h = ws.handlers.get(msg.id); ws.handlers.delete(msg.id); h(msg); }
    };

    await ws.cmd("Runtime.enable");
    await ws.cmd("Page.enable");
    await ws.cmd("Emulation.setDeviceMetricsOverride", { width: 1200, height: 860, deviceScaleFactor: 1, mobile: false });
    await ws.cmd("Page.navigate", { url });
    await sleep(2200);

    const evaluate = async (expr) => {
      const r = await ws.cmd("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error("eval: " + (r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text));
      return r.result.value;
    };
    const shot = async (name) => {
      const r = await ws.cmd("Page.captureScreenshot", { format: "png" });
      const p = path.join(outDir, name + ".png");
      fs.writeFileSync(p, Buffer.from(r.data, "base64"));
      console.log("  shot: " + name + ".png");
      return p;
    };

    const state = await evaluate("(window.GAME ? GAME.getState() : 'no-game') + '|' + (window.G ? 'G-ok' : 'G-missing')");
    console.log("  boot state: " + state);
    await shot("01-title");

    // start the game
    await evaluate(`(function(){
      if (window.GAME && GAME.setState) { GAME.setState('play'); return 'set'; }
      return 'no-setter';
    })()`);
    await sleep(400);
    let st = await evaluate("window.GAME ? GAME.getState() : '?'");
    if (st !== "play") {
      // press Enter through the real input layer
      await evaluate(`(function(){
        var ev = new KeyboardEvent('keydown', {key:'Enter', bubbles:true});
        window.dispatchEvent(ev);
        return 'sent';
      })()`);
      await sleep(500);
      st = await evaluate("window.GAME ? GAME.getState() : '?'");
    }
    console.log("  after start: " + st);
    await shot("02-opening");

    // drain a couple of opening lines so the world is visible behind dialogue
    for (let i = 0; i < 6; i++) {
      await evaluate("window.G.debug && G.debug.advance && G.debug.advance()");
      await sleep(160);
    }
    await shot("03-world");

    // jump into each scene's first node to capture the look of the game
    const scenes = await evaluate("Object.keys(G.data.story.scenes)");
    console.log("  scenes: " + scenes.join(", "));

    // capture a dialogue with choices
    await evaluate("(function(){ G.debug.interact('abubakr'); return 1; })()");
    await sleep(300);
    for (let i = 0; i < 10; i++) {
      const t = await evaluate("(function(){ if(!G.dialogue.isActive()) return 'inactive'; var n=G.debug.inspectNode(); return n?n.type:'none'; })()");
      if (t === "choice") break;
      await evaluate("G.debug.pick(0)");
      await sleep(120);
    }
    await shot("04-choice");

    // notebook
    await evaluate("(function(){ if(G.notebook) G.notebook.toggle(); return 1; })()");
    await sleep(300);
    await shot("05-notebook");
    await evaluate("(function(){ if(G.notebook) G.notebook.toggle(); return 1; })()");

    // shop minigame
    await evaluate("(function(){ G.dialogue.startScene('gift_start'); return 1; })()");
    await sleep(300);
    let guard = 0;
    while (guard++ < 30) {
      const info = await evaluate("(function(){ if(!G.dialogue.isActive()) return null; var n=G.debug.inspectNode(); return n?n.type:null; })()");
      if (info === "minigame" || info === null) break;
      await evaluate("(function(){ if(G.dialogue.isActive()) G.debug.pick(0); return 1; })()");
      await sleep(120);
    }
    await sleep(700);
    const mg = await evaluate("G.minigameHost.getActiveId ? G.minigameHost.getActiveId() : 'none'");
    console.log("  minigame active: " + mg);
    await shot("06-gift");

    // travel minigame
    await evaluate("(function(){ if(G.minigameHost.isActive()) G.debug.forceMinigame(true); return 1; })()");
    await sleep(500);
    await evaluate("(function(){ G.dialogue.startScene('walk_start'); return 1; })()");
    await sleep(200);
    guard = 0;
    while (guard++ < 30) {
      const info = await evaluate("(function(){ if(!G.dialogue.isActive()) return null; var n=G.debug.inspectNode(); return n?n.type:null; })()");
      if (info === "minigame" || info === null) break;
      await evaluate("(function(){ if(G.dialogue.isActive()) G.debug.pick(0); return 1; })()");
      await sleep(120);
    }
    await sleep(700);
    console.log("  minigame now: " + await evaluate("G.minigameHost.getActiveId ? G.minigameHost.getActiveId() : 'none'"));
    await shot("07-travel");

    // ball minigame
    await evaluate("(function(){ if(G.minigameHost.isActive()) G.debug.forceMinigame(true); return 1; })()");
    await sleep(600);
    guard = 0;
    while (guard++ < 30) {
      const info = await evaluate("(function(){ if(!G.dialogue.isActive()) return null; var n=G.debug.inspectNode(); return n?n.type:null; })()");
      if (info === "minigame" || info === null) break;
      await evaluate("(function(){ if(G.dialogue.isActive()) G.debug.pick(0); return 1; })()");
      await sleep(120);
    }
    await sleep(800);
    console.log("  minigame now: " + await evaluate("G.minigameHost.getActiveId ? G.minigameHost.getActiveId() : 'none'"));
    await shot("08-ball");

    // debrief: force a completed run
    await evaluate("(function(){ if(G.minigameHost.isActive()) G.debug.forceMinigame(true); return 1; })()");
    await sleep(500);
    // Play the mission for real in-page so the debrief reflects a true run.
    // Must be ASYNC: the minigame host only resolves inside a real rAF frame, so
    // a synchronous loop would spin forever on a minigame.
    // Reload for a clean game so the debrief reflects a genuine full run.
    await ws.cmd("Page.navigate", { url });
    await sleep(1800);
    await evaluate("(function(){ var ev = new KeyboardEvent('keydown', {key:'Enter', bubbles:true}); window.dispatchEvent(ev); return GAME.getState(); })()");
    await sleep(700);
    console.log("  reloaded for real run: " + await evaluate("GAME.getState()"));

    const played = await evaluate(`(async function(){
      function nextFrame(){ return new Promise(function(r){ requestAnimationFrame(function(){ r(); }); }); }
      async function frames(n){ for (var i=0;i<n;i++) await nextFrame(); }

      var notes = (G.data.learning && G.data.learning.choiceNotes) || {};
      var vs = { good: 2, ok: 1, weak: -1, bad: -2 };
      function sc(id){ return notes[id] ? (vs[notes[id].verdict] || 0) : 0; }
      function best(arr){
        arr.sort(function(a,b){ return sc(b.o.id) - sc(a.o.id); });
        return arr[0];
      }
      var PLAN = {
        arrive:['gate',0,null], staffroom:['staffroom',0,'abubakr'],
        oqil:['staffroom',1,'oqil'], mother:['gate',1,'nodira'],
        lesson:['classroom',0,null], timur:['classroom',1,'timur'],
        gift:['shop',0,'sardor'], report:['gate',2,'nodira']
      };
      var guard = 0, steps = 0, mgSeen = 0, lastBeat = '';
      var ZONES = ['gate','staffroom','classroom','shop','yard','corridor'];
      while (guard++ < 4000) {
        if (G.debrief.isVisible()) {
          return { ok:true, steps:steps, mgSeen:mgSeen, trust:G.state.trust, notes:G.state.notes.length };
        }
        if (G.state.beat !== lastBeat) { lastBeat = G.state.beat; }
        if (G.minigameHost.isActive()) {
          G.debug.forceMinigame(true);
          mgSeen++;
          await frames(24);           // > finishHold (0.35s ≈ 21 frames at 60fps)
          continue;
        }
        if (!G.dialogue.isActive()) {
          var beat = G.state.beat, plan = PLAN[beat];
          if (plan) {
            G.debug.gotoZone(plan[0], plan[1]);
            await frames(6);
            if (!G.dialogue.isActive() && !G.debrief.isVisible() && plan[2]) {
              G.debug.interact(plan[2]);
              await frames(6);
            }
          }
          steps++;
          if (!G.dialogue.isActive() && !G.debrief.isVisible()) {
            // zone-trigger beats (arrive, walk, ...): sweep. Needs enough frames
            // for the 1.2s trigger cooldown to expire after each teleport.
            for (var zi = 0; zi < ZONES.length; zi++) {
              G.debug.gotoZone(ZONES[zi], 0);
              await frames(6);
              if (G.dialogue.isActive() || G.debrief.isVisible()) break;
            }
            if (!G.dialogue.isActive() && !G.debrief.isVisible()) {
              return { ok:false, why:'stuck-world', beat:beat, steps:steps, mgSeen:mgSeen };
            }
          }
          continue;
        }
        var info = G.debug.inspectNode();
        if (!info) { await frames(1); continue; }
        if (info.type === 'say') { G.debug.pick(0); steps++; await frames(1); continue; }
        if (info.type === 'choice') {
          var u = info.options.map(function(o,i){ return {o:o,i:i}; }).filter(function(x){ return !x.o.locked; });
          if (!u.length) { G.debug.pick(0); steps++; await frames(1); continue; }
          G.debug.pick(best(u).i); steps++; await frames(1); continue;
        }
        if (info.type === 'multi') {
          var node = G.dialogue.debugNode(), max = node.max || 99, s2 = 0;
          while (s2++ < 8) {
            var cur = G.debug.inspectNode();
            if (!cur || cur.type !== 'multi') break;
            var picked = (cur.options||[]).filter(function(o){ return G.state.hasChosen(o.id); }).length;
            if (picked >= max) break;
            var rem = cur.options.map(function(o,i){ return {o:o,i:i}; })
              .filter(function(x){ return !x.o.locked && !G.state.hasChosen(x.o.id); });
            if (!rem.length) break;
            G.debug.pick(best(rem).i); steps++; await frames(1);
          }
          var after = G.debug.inspectNode();
          if (after && after.type === 'multi') { G.debug.finishMulti(); steps++; await frames(1); }
          continue;
        }
        steps++;
        await frames(1);
      }
      return { ok:G.debrief.isVisible(), beat:G.state.beat, steps:steps, mgSeen:mgSeen, guard:true };
    })()`);
    console.log("  full run: " + JSON.stringify(played));
    await sleep(900);
    await shot("09-debrief-score");

    // debrief other pages — drive the page setter directly, synthetic keydown
    // edge-detection is unreliable across frames in headless capture
    const pageNames = await evaluate("G.debrief.pageNames()");
    for (let i = 1; i < pageNames.length; i++) {
      await evaluate(`G.debrief.setPage(${i})`);
      await sleep(500);
      await shot("10-debrief-" + i + "-" + String(pageNames[i]).toLowerCase());
    }

    const errs = logs.filter(l => l.startsWith("[EXCEPTION]") || l.startsWith("[error]"));
    const warns = logs.filter(l => l.startsWith("[warning]"));
    console.log("\n  console messages: " + logs.length);
    if (warns.length) { console.log("  warnings:"); warns.slice(0, 10).forEach(w => console.log("   " + w)); }
    if (errs.length) { console.log("  ERRORS:"); errs.slice(0, 10).forEach(e => console.log("   " + e)); }
    else console.log("  no console errors");

    ws.close();
    console.log("\nDONE — screenshots in tools/shots/");
    process.exitCode = errs.length ? 1 : 0;
  } catch (e) {
    console.error("FAILED: " + e.message);
    if (chromeErr) console.error("chrome stderr:\n" + chromeErr.slice(-1500));
    process.exitCode = 1;
  } finally {
    try { chrome.kill(); } catch (e) {}
    server.close();
    setTimeout(() => process.exit(process.exitCode || 0), 300);
  }
})();
