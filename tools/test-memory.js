/* Verify save -> quit -> resume actually works, and that memory.md round-trips.
   Drives a real Chrome, plays part of the mission, saves, reloads the page, and
   asserts the resumed state matches. */
const fs = require("fs");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const net = require("net");
const crypto = require("crypto");
const os = require("os");

const root = path.join(__dirname, "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9500 + Math.floor(Math.random() * 400);
const PROFILE = path.join(os.tmpdir(), "dsh-mem-" + Date.now());
const sleep = ms => new Promise(r => setTimeout(r, ms));

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".md": "text/plain", ".png": "image/png" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});

function waitPort(port, t = 15000) {
  return new Promise((res, rej) => {
    const s0 = Date.now();
    (function a() {
      const s = net.connect(port, "127.0.0.1");
      s.on("connect", () => { s.destroy(); res(); });
      s.on("error", () => { s.destroy(); if (Date.now() - s0 > t) rej(new Error("timeout")); else setTimeout(a, 150); });
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
      r.on("upgrade", (x, s) => { this.sock = s; this.attach(); res(); }); r.on("error", rej); r.end();
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
  cmd(me, pa) {
    const id = ++this.id;
    return new Promise((res, rej) => { this.handlers.set(id, m => m.error ? rej(new Error(me + " " + JSON.stringify(m.error))) : res(m.result)); this.send({ id, method: me, params: pa || {} }); });
  }
}

(async () => {
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  const url = `http://127.0.0.1:${server.address().port}/index.html`;
  const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + PORT, "--user-data-dir=" + PROFILE,
    "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--hide-scrollbars", "--window-size=1200,860", "about:blank"],
    { stdio: ["ignore", "pipe", "pipe"] });
  let cerr = ""; chrome.stderr.on("data", d => cerr += d.toString());
  let wsActive = null;

  async function connect() {
    const list = await getJson("/json/list");
    const page = list.find(t => t.type === "page");
    const u = new URL(page.webSocketDebuggerUrl.replace(/^ws:\/\//, "http://"));
    const ws = new WS(u.hostname, u.port, u.pathname);
    await ws.connect();
    ws.logs = [];
    ws.onMsg = m => {
      if (m.method === "Runtime.exceptionThrown") ws.logs.push("EXC: " + (m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text));
      if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") ws.logs.push("ERR: " + (m.params.args || []).map(a => a.value || a.description || "").join(" "));
      if (m.id && ws.handlers.has(m.id)) { const h = ws.handlers.get(m.id); ws.handlers.delete(m.id); h(m); }
    };
    await ws.cmd("Runtime.enable"); await ws.cmd("Page.enable");
    return ws;
  }
  const evOf = ws => async e => {
    const r = await ws.cmd("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text);
    return r.result.value;
  };

  try {
    await waitPort(PORT);
    let ws = await connect(); wsActive = ws;
    let ev = evOf(ws);
    await ws.cmd("Page.navigate", { url });
    await sleep(2500);

    console.log("=== 1. fresh boot ===");
    console.log(await ev(`JSON.stringify({
      state: GAME.getState(),
      memoryLoaded: !!G.memory,
      hasSave: G.memory.hasSave(),
      fileAccess: G.memory.supported()
    })`));

    // start and play a little
    await ev(`(function(){ G.memory.clear(); window.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); return 1; })()`);
    await sleep(900);
    console.log("after Enter, state =", await ev("GAME.getState()"));

    // advance through some dialogue by picking the first option / advancing
    const played = await ev(`(async function(){
      function nf(){ return new Promise(function(r){ requestAnimationFrame(function(){ r(); }); }); }
      async function frames(n){ for (var i=0;i<n;i++) await nf(); }
      var steps = 0, choices = 0;
      while (steps++ < 60) {
        if (!G.dialogue.isActive()) break;
        var info = G.debug.inspectNode();
        if (!info) { await frames(1); continue; }
        if (info.type === 'say') { G.debug.pick(0); choices++; }
        else if (info.type === 'choice' || info.type === 'multi') {
          var av = (info.options||[]).map(function(o,i){return {o:o,i:i};}).filter(function(x){return !x.o.locked;});
          if (av.length) { G.debug.pick(av[0].i); choices++; } else { G.debug.pick(0); }
        } else break;
        await frames(1);
      }
      return { steps: steps, choices: choices, beat: G.state.beat, trust: G.state.trust };
    })()`);
    console.log("\n=== 2. played a bit ===");
    console.log(JSON.stringify(played));

    const saved = await ev(`(function(){
      G.state.addIntel('intel_test_marker');
      G.state.addTrust(3);
      var s = G.memory.saveNow('test');
      return JSON.stringify({ beat: s.beat, trust: s.trust, intel: s.intel, pos: s.position, at: s.savedAt });
    })()`);
    console.log("\n=== 3. saved ===");
    console.log(saved);

    // memory.md round-trip through the real module
    const rt = await ev(`(function(){
      var s = G.memory.snapshot();
      var md = G.memory.toMarkdown(s);
      var back = G.memory.parseMarkdown(md);
      return JSON.stringify({
        mdBytes: md.length,
        hasJsonBlock: !!back,
        beatMatch: back && back.beat === s.beat,
        trustMatch: back && back.trust === s.trust,
        intelMatch: back && JSON.stringify(back.intel) === JSON.stringify(s.intel),
        posMatch: back && JSON.stringify(back.position) === JSON.stringify(s.position),
        mdHasResumeSection: /## Resume/.test(md),
        mdHasRawSave: /## Raw save/.test(md)
      });
    })()`);
    console.log("\n=== 4. memory.md round-trip ===");
    console.log(rt);

    // reload the page -> should offer Continue and restore
    console.log("\n=== 5. reload and resume ===");
    await ws.cmd("Page.navigate", { url });
    await sleep(2500);
    const beforeResume = await ev(`JSON.stringify({ state: GAME.getState(), hasSave: G.memory.hasSave(), saved: G.memory.load() ? G.memory.load().beat : null })`);
    console.log("after reload, at title:", beforeResume);

    await ev(`(function(){ window.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); return 1; })()`);
    await sleep(1200);
    const afterResume = await ev(`JSON.stringify({
      state: GAME.getState(),
      beat: G.state.beat,
      trust: G.state.trust,
      intel: G.state.intel,
      pos: G.world.player ? { x: Math.round(G.world.player.x), y: Math.round(G.world.player.y) } : null,
      dialogueActive: G.dialogue.isActive()
    })`);
    console.log("after resume:", afterResume);

    const r = JSON.parse(afterResume);
    const s = JSON.parse(saved);
    let fail = 0;
    function check(cond, label) { console.log((cond ? "  PASS  " : "  FAIL  ") + label); if (!cond) fail++; }
    console.log("");
    check(r.state === "play", "entered play state on resume");
    check(r.beat === s.beat, `beat restored (${r.beat} == ${s.beat})`);
    check(r.trust === s.trust, `trust restored (${r.trust} == ${s.trust})`);
    check(r.intel.indexOf("intel_test_marker") >= 0, "marker intel survived the reload");
    check(r.pos && Math.abs(r.pos.x - Math.round(s.pos.x)) <= 2 && Math.abs(r.pos.y - Math.round(s.pos.y)) <= 2,
      `position restored (${JSON.stringify(r.pos)} ~ ${Math.round(s.pos.x)},${Math.round(s.pos.y)})`);
    check(r.dialogueActive === false, "resumed into the world, not mid-scene");

    const rtObj = JSON.parse(rt);
    check(rtObj.hasJsonBlock && rtObj.beatMatch && rtObj.trustMatch && rtObj.intelMatch && rtObj.posMatch, "memory.md round-trips losslessly");
    check(rtObj.mdHasResumeSection && rtObj.mdHasRawSave, "memory.md has the documented sections");

    if (ws.logs.length) { console.log("\nconsole errors:"); ws.logs.forEach(l => console.log("  " + l)); fail++; }
    else console.log("\nno console errors");

    console.log(fail ? `\nMEMORY TEST FAILED — ${fail} problem(s)` : "\nMEMORY TEST PASSED — save/resume works across a reload");
    process.exitCode = fail ? 1 : 0;
  } catch (e) {
    console.error("FAILED: " + e.message);
    if (cerr) console.error(cerr.slice(-800));
    process.exitCode = 1;
  } finally {
    try { chrome.kill(); } catch (e) {}
    server.close();
    setTimeout(() => process.exit(process.exitCode || 0), 250);
  }
})();
