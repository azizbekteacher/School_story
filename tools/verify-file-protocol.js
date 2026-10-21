/* Verify the game boots and plays from file:// (double-click), not just http://.
   This is the deliverable's hard requirement. */
const fs = require("fs");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const net = require("net");
const crypto = require("crypto");
const os = require("os");

const root = path.join(__dirname, "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9700 + Math.floor(Math.random() * 200);
const PROFILE = path.join(os.tmpdir(), "dsh-file-" + Date.now());
const sleep = ms => new Promise(r => setTimeout(r, ms));

function waitPort(port, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function a() {
      const s = net.connect(port, "127.0.0.1");
      s.on("connect", () => { s.destroy(); resolve(); });
      s.on("error", () => { s.destroy(); if (Date.now() - start > timeoutMs) reject(new Error("timeout")); else setTimeout(a, 150); });
    })();
  });
}
function getJson(p) {
  return new Promise((res, rej) => {
    http.get({ host: "127.0.0.1", port: PORT, path: p }, r => {
      let d = ""; r.on("data", c => d += c);
      r.on("end", () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    }).on("error", rej);
  });
}
class WS {
  constructor(h, p, wp) { this.h = h; this.p = p; this.wp = wp; this.key = crypto.randomBytes(16).toString("base64"); this.buf = Buffer.alloc(0); this.id = 0; this.handlers = new Map(); this.onMsg = () => {}; }
  connect() {
    return new Promise((res, rej) => {
      const r = http.request({ host: this.h, port: this.p, path: this.wp, headers: { Connection: "Upgrade", Upgrade: "websocket", "Sec-WebSocket-Key": this.key, "Sec-WebSocket-Version": "13" } });
      r.on("upgrade", (x, s) => { this.sock = s; this.attach(); res(); });
      r.on("error", rej); r.end();
    });
  }
  attach() { this.sock.on("data", d => { this.buf = Buffer.concat([this.buf, d]); this.parse(); }); this.sock.on("error", () => {}); }
  parse() {
    while (this.buf.length >= 2) {
      const b0 = this.buf[0], b1 = this.buf[1], op = b0 & 0x0f, mk = (b1 & 0x80) !== 0;
      let len = b1 & 0x7f, off = 2;
      if (len === 126) { if (this.buf.length < 4) return; len = this.buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (this.buf.length < 10) return; len = Number(this.buf.readBigUInt64BE(2)); off = 10; }
      let m = null;
      if (mk) { if (this.buf.length < off + 4) return; m = this.buf.slice(off, off + 4); off += 4; }
      if (this.buf.length < off + len) return;
      let pl = this.buf.slice(off, off + len);
      if (m) { const c = Buffer.alloc(len); for (let i = 0; i < len; i++) c[i] = pl[i] ^ m[i % 4]; pl = c; }
      this.buf = this.buf.slice(off + len);
      if (op === 0x1) { try { this.onMsg(JSON.parse(pl.toString("utf8"))); } catch (e) {} } else if (op === 0x8) this.sock.end();
    }
  }
  send(o) {
    const d = Buffer.from(JSON.stringify(o), "utf8"), m = crypto.randomBytes(4), x = Buffer.alloc(d.length);
    for (let i = 0; i < d.length; i++) x[i] = d[i] ^ m[i % 4];
    let h;
    if (d.length < 126) h = Buffer.from([0x81, 0x80 | d.length]);
    else if (d.length < 65536) { h = Buffer.alloc(4); h[0] = 0x81; h[1] = 0x80 | 126; h.writeUInt16BE(d.length, 2); }
    else { h = Buffer.alloc(10); h[0] = 0x81; h[1] = 0x80 | 127; h.writeBigUInt64BE(BigInt(d.length), 2); }
    this.sock.write(Buffer.concat([h, m, x]));
  }
  cmd(meth, params) {
    const id = ++this.id;
    return new Promise((res, rej) => { this.handlers.set(id, m => m.error ? rej(new Error(meth + " " + JSON.stringify(m.error))) : res(m.result)); this.send({ id, method: meth, params: params || {} }); });
  }
}

(async () => {
  const fileUrl = "file:///" + path.join(root, "index.html").replace(/\\/g, "/").replace(/ /g, "%20");
  console.log("opening " + fileUrl);

  const chrome = spawn(CHROME, [
    "--headless=new", "--remote-debugging-port=" + PORT, "--user-data-dir=" + PROFILE,
    "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--hide-scrollbars",
    "--window-size=1200,860", "--allow-file-access-from-files", "about:blank"
  ], { stdio: ["ignore", "pipe", "pipe"] });
  let cerr = ""; chrome.stderr.on("data", d => cerr += d.toString());

  try {
    await waitPort(PORT);
    const list = await getJson("/json/list");
    const page = list.find(t => t.type === "page");
    const u = new URL(page.webSocketDebuggerUrl.replace(/^ws:\/\//, "http://"));
    const ws = new WS(u.hostname, u.port, u.pathname);
    await ws.connect();

    const logs = [];
    ws.onMsg = m => {
      if (m.method === "Runtime.exceptionThrown") {
        const d = m.params.exceptionDetails;
        logs.push("EXCEPTION: " + (d.exception && d.exception.description || d.text));
      }
      if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
        logs.push("console.error: " + (m.params.args || []).map(a => a.value || a.description || "").join(" "));
      }
      if (m.id && ws.handlers.has(m.id)) { const h = ws.handlers.get(m.id); ws.handlers.delete(m.id); h(m); }
    };
    await ws.cmd("Runtime.enable"); await ws.cmd("Page.enable");
    await ws.cmd("Page.navigate", { url: fileUrl });
    await sleep(2600);

    const ev = async expr => {
      const r = await ws.cmd("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error("eval: " + (r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text));
      return r.result.value;
    };

    console.log("\n--- file:// boot ---");
    const boot = await ev(`JSON.stringify({
      url: location.protocol,
      hasG: !!window.G,
      state: (window.GAME && GAME.getState) ? GAME.getState() : 'no-GAME',
      storyLoaded: !!(window.G && G.data && G.data.story),
      scenes: (window.G && G.data && G.data.story) ? Object.keys(G.data.story.scenes).length : 0,
      minigames: (window.G && G.minigames && G.minigames.get) ? 'api' : (window.G && G.minigameHost ? 'host' : 'none'),
      canvas: !!document.getElementById('game'),
      ctxOk: !!(document.getElementById('game') && document.getElementById('game').getContext('2d'))
    })`);
    console.log(boot);
    const b = JSON.parse(boot);
    if (b.url !== "file:" || !b.hasG || !b.storyLoaded || b.scenes !== 10 || !b.canvas) {
      throw new Error("file:// boot incomplete: " + boot);
    }

    // play through from file://
    await ev(`(function(){ var e=new KeyboardEvent('keydown',{key:'Enter',bubbles:true}); window.dispatchEvent(e); return 1; })()`);
    await sleep(800);
    if (await ev("GAME.getState()") !== "play") throw new Error("did not enter play from file://");
    console.log("entered play from file://");

    const run = await ev(`(async function(){
      function nf(){ return new Promise(function(r){ requestAnimationFrame(function(){ r(); }); }); }
      async function frames(n){ for (var i=0;i<n;i++) await nf(); }
      var notes = (G.data.learning && G.data.learning.choiceNotes) || {};
      var vs = { good:2, ok:1, weak:-1, bad:-2 };
      function sc(id){ return notes[id] ? (vs[notes[id].verdict]||0) : 0; }
      function best(a){ a.sort(function(x,y){ return sc(y.o.id)-sc(x.o.id); }); return a[0]; }
      var PLAN = {
        arrive:['gate',0,null], staffroom:['staffroom',0,'abubakr'],
        oqil:['staffroom',1,'oqil'], mother:['gate',1,'nodira'],
        lesson:['classroom',0,null], timur:['classroom',1,'timur'],
        gift:['shop',0,'sardor'], report:['gate',2,'nodira']
      };
      var ZONES = ['gate','staffroom','classroom','shop','yard','corridor'];
      var g=0, mg=0;
      while (g++ < 4000) {
        if (G.debrief.isVisible()) return { ok:true, mg:mg, trust:G.state.trust, notes:G.state.notes.length, beat:G.state.beat };
        if (G.minigameHost.isActive()) { G.debug.forceMinigame(true); mg++; await frames(24); continue; }
        if (!G.dialogue.isActive()) {
          var pl = PLAN[G.state.beat];
          if (pl) {
            G.debug.gotoZone(pl[0], pl[1]); await frames(6);
            if (!G.dialogue.isActive() && !G.debrief.isVisible() && pl[2]) { G.debug.interact(pl[2]); await frames(6); }
          }
          if (!G.dialogue.isActive() && !G.debrief.isVisible()) {
            for (var z=0; z<ZONES.length; z++) { G.debug.gotoZone(ZONES[z],0); await frames(6); if (G.dialogue.isActive()||G.debrief.isVisible()) break; }
            if (!G.dialogue.isActive() && !G.debrief.isVisible()) return { ok:false, why:'stuck', beat:G.state.beat };
          }
          continue;
        }
        var info = G.debug.inspectNode();
        if (!info) { await frames(1); continue; }
        if (info.type === 'say') { G.debug.pick(0); await frames(1); continue; }
        if (info.type === 'choice') {
          var u = info.options.map(function(o,i){return {o:o,i:i};}).filter(function(x){return !x.o.locked;});
          if (!u.length) { G.debug.pick(0); await frames(1); continue; }
          G.debug.pick(best(u).i); await frames(1); continue;
        }
        if (info.type === 'multi') {
          var nd = G.dialogue.debugNode(), mx = nd.max||99, s=0;
          while (s++<8) {
            var cur = G.debug.inspectNode();
            if (!cur || cur.type!=='multi') break;
            var pk = (cur.options||[]).filter(function(o){return G.state.hasChosen(o.id);}).length;
            if (pk >= mx) break;
            var rm = cur.options.map(function(o,i){return {o:o,i:i};}).filter(function(x){return !x.o.locked && !G.state.hasChosen(x.o.id);});
            if (!rm.length) break;
            G.debug.pick(best(rm).i); await frames(1);
          }
          var af = G.debug.inspectNode();
          if (af && af.type==='multi') { G.debug.finishMulti(); await frames(1); }
          continue;
        }
        await frames(1);
      }
      return { ok:false, why:'guard', beat:G.state.beat };
    })()`);
    console.log("full run from file:// → " + JSON.stringify(run));

    if (!run || !run.ok) throw new Error("file:// playthrough failed: " + JSON.stringify(run));
    if (logs.length) throw new Error("console errors: " + logs.join(" | "));

    console.log("\nFILE:// VERIFICATION PASSED — boots and completes the mission by double-click");
    console.log("  trust=" + run.trust + " notes=" + run.notes + " minigames=" + run.mg + " beat=" + run.beat);

    server0();
  } catch (e) {
    console.error("FAILED: " + e.message);
    if (cerr) console.error(cerr.slice(-1000));
    process.exitCode = 1;
    server0();
  } finally {
    try { chrome.kill(); } catch (e) {}
    setTimeout(() => process.exit(process.exitCode || 0), 300);
  }
})();

function server0() { /* no http server needed for file:// */ }
