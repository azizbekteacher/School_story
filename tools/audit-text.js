/* Text-fit audit: runs in the real page and checks that every string the game
   draws fits inside the canvas / its panel, using real font metrics.
   Catches clipped or overflowing text that screenshots can't quantify. */
const fs = require("fs");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const net = require("net");
const crypto = require("crypto");
const os = require("os");

const root = path.join(__dirname, "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9400 + Math.floor(Math.random() * 300);
const PROFILE = path.join(os.tmpdir(), "dsh-audit-" + Date.now());

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});

const sleep = ms => new Promise(r => setTimeout(r, ms));
function waitPort(port, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function attempt() {
      const s = net.connect(port, "127.0.0.1");
      s.on("connect", () => { s.destroy(); resolve(); });
      s.on("error", () => { s.destroy(); if (Date.now() - start > timeoutMs) reject(new Error("timeout")); else setTimeout(attempt, 150); });
    })();
  });
}
function getJson(pathname) {
  return new Promise((resolve, reject) => {
    http.get({ host: "127.0.0.1", port: PORT, path: pathname }, res => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => { try { resolve(JSON.parse(d)); } catch (e) { reject(e); } });
    }).on("error", reject);
  });
}

class WS {
  constructor(host, port, wsPath) {
    this.host = host; this.port = port; this.path = wsPath;
    this.key = crypto.randomBytes(16).toString("base64");
    this.buf = Buffer.alloc(0); this.onMsg = () => {}; this.id = 0; this.handlers = new Map();
  }
  connect() {
    return new Promise((resolve, reject) => {
      const req = http.request({
        host: this.host, port: this.port, path: this.path,
        headers: { Connection: "Upgrade", Upgrade: "websocket", "Sec-WebSocket-Key": this.key, "Sec-WebSocket-Version": "13" }
      });
      req.on("upgrade", (res, socket) => { this.sock = socket; this.attach(); resolve(); });
      req.on("error", reject); req.end();
    });
  }
  attach() {
    this.sock.on("data", d => { this.buf = Buffer.concat([this.buf, d]); this.parse(); });
    this.sock.on("error", () => {});
  }
  parse() {
    while (this.buf.length >= 2) {
      const b0 = this.buf[0], b1 = this.buf[1], op = b0 & 0x0f, masked = (b1 & 0x80) !== 0;
      let len = b1 & 0x7f, off = 2;
      if (len === 126) { if (this.buf.length < 4) return; len = this.buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (this.buf.length < 10) return; len = Number(this.buf.readBigUInt64BE(2)); off = 10; }
      let mask = null;
      if (masked) { if (this.buf.length < off + 4) return; mask = this.buf.slice(off, off + 4); off += 4; }
      if (this.buf.length < off + len) return;
      let pl = this.buf.slice(off, off + len);
      if (mask) { const c = Buffer.alloc(len); for (let i = 0; i < len; i++) c[i] = pl[i] ^ mask[i % 4]; pl = c; }
      this.buf = this.buf.slice(off + len);
      if (op === 0x1) { try { this.onMsg(JSON.parse(pl.toString("utf8"))); } catch (e) {} }
      else if (op === 0x8) this.sock.end();
    }
  }
  send(o) {
    const data = Buffer.from(JSON.stringify(o), "utf8");
    const mask = crypto.randomBytes(4);
    const m = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i++) m[i] = data[i] ^ mask[i % 4];
    let h;
    if (data.length < 126) h = Buffer.from([0x81, 0x80 | data.length]);
    else if (data.length < 65536) { h = Buffer.alloc(4); h[0] = 0x81; h[1] = 0x80 | 126; h.writeUInt16BE(data.length, 2); }
    else { h = Buffer.alloc(10); h[0] = 0x81; h[1] = 0x80 | 127; h.writeBigUInt64BE(BigInt(data.length), 2); }
    this.sock.write(Buffer.concat([h, mask, m]));
  }
  cmd(method, params) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.handlers.set(id, m => m.error ? reject(new Error(method + " " + JSON.stringify(m.error))) : resolve(m.result));
      this.send({ id, method, params: params || {} });
    });
  }
}

(async () => {
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  const webPort = server.address().port;
  const url = `http://127.0.0.1:${webPort}/index.html`;

  const chrome = spawn(CHROME, [
    "--headless=new", "--remote-debugging-port=" + PORT, "--user-data-dir=" + PROFILE,
    "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--hide-scrollbars",
    "--window-size=1200,860", "about:blank"
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
        logs.push("EXCEPTION " + (m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || ""));
      }
      if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
        logs.push("console.error " + (m.params.args || []).map(a => a.value || a.description || "").join(" "));
      }
      if (m.id && ws.handlers.has(m.id)) { const h = ws.handlers.get(m.id); ws.handlers.delete(m.id); h(m); }
    };
    await ws.cmd("Runtime.enable"); await ws.cmd("Page.enable");
    await ws.cmd("Page.navigate", { url });
    await sleep(2200);

    const ev = async (expr) => {
      const r = await ws.cmd("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error("eval failed: " + (r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text));
      return r.result.value;
    };

    // Install an audit context that records every fillText call with real metrics.
    await ev(`(function(){
      if (window.__AUDIT) return 'already';
      var A = window.__AUDIT = { calls: [], active: false };
      var proto = CanvasRenderingContext2D.prototype;
      var origFill = proto.fillText, origStroke = proto.strokeText;
      function rec(self, text, x, y) {
        if (!A.active) return;
        var m = self.measureText(String(text));
        var t = self.getTransform ? self.getTransform() : { a:1, d:1, e:0, f:0 };
        A.calls.push({
          text: String(text),
          width: Math.round(m.width * 10) / 10,
          x: Math.round(x * 10) / 10,
          y: Math.round(y * 10) / 10,
          font: self.font,
          align: self.textAlign,
          baseline: self.textBaseline,
          scale: Math.round((t.a || 1) * 1000) / 1000,
          tx: Math.round((t.e || 0) * 10) / 10,
          ty: Math.round((t.f || 0) * 10) / 10
        });
      }
      proto.fillText = function (t, x, y) { rec(this, t, x, y); return origFill.call(this, t, x, y); };
      proto.strokeText = function (t, x, y) { rec(this, t, x, y); return origStroke.call(this, t, x, y); };
      return 'installed';
    })()`);

    // Enter play state. The title screen draws only its own text, so auditing
    // without this silently measures the title 10 times.
    const stateNow = await ev(`(function(){
      if (GAME && GAME.getState && GAME.getState() === 'play') return 'play';
      var ev = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      window.dispatchEvent(ev);
      return 'sent';
    })()`);
    await sleep(700);
    const st = await ev("GAME && GAME.getState ? GAME.getState() : 'unknown'");
    console.log("boot -> " + stateNow + " ; state now: " + st);
    if (st !== "play") throw new Error("could not enter play state (state=" + st + ")");
    if (!(await ev("!!window.G && !!G.debug"))) throw new Error("debug bridge missing");

    const audit = async (label, setup, frames = 30) => {
      const res = await ev(`(async function(){
        function nf(){ return new Promise(function(r){ requestAnimationFrame(function(){ r(); }); }); }
        ${setup}
        await nf(); await nf();
        window.__AUDIT.calls.length = 0;
        window.__AUDIT.active = true;
        for (var i = 0; i < ${frames}; i++) await nf();
        window.__AUDIT.active = false;
        return { calls: window.__AUDIT.calls.slice(), state: (GAME && GAME.getState) ? GAME.getState() : '?', scene: (G.dialogue && G.dialogue.isActive()) ? G.dialogue.getSceneKey() : null, mg: (G.minigameHost && G.minigameHost.getActiveId && G.minigameHost.getActiveId()) || null, page: (G.debrief && G.debrief.getPage) ? G.debrief.getPage() : null };
      })()`);
      return { label, calls: res.calls, state: res.state, scene: res.scene, mg: res.mg, page: res.page };
    };

    // world + dialogue with choices
    const worldAudit = await audit("world+dialogue", `(function(){
      if (window.GAME && GAME.setState) GAME.setState('play');
      G.debug.interact('abubakr');
      for (var i=0;i<8;i++){ if(G.dialogue.isActive() && G.debug.inspectNode() && G.debug.inspectNode().type==='say') G.debug.pick(0); }
    })()`, 20);

    const choiceAudit = await audit("choice-ui", `(function(){
      if (G.dialogue.isActive()) { var n=G.debug.inspectNode(); if(n && n.type!=='choice'){ for(var i=0;i<10;i++){ if(!G.dialogue.isActive()) break; var t=G.debug.inspectNode(); if(t&&t.type==='choice') break; G.debug.pick(0);} } }
    })()`, 20);

    // notebook
    const nbAudit = await audit("notebook", `(function(){ if(G.notebook && !G.notebook.isOpen()) G.notebook.toggle(); })()`, 20);

    // minigames
    const giftAudit = await audit("giftShop", `(function(){
      if (G.notebook && G.notebook.isOpen()) G.notebook.toggle();
      G.dialogue.startScene('gift_start');
      for (var i=0;i<12;i++){ if(!G.dialogue.isActive()) break; var t=G.debug.inspectNode(); if(!t||t.type==='minigame') break; G.debug.pick(0); }
    })()`, 40);

    const travelAudit = await audit("travelTalk", `(function(){
      if (G.minigameHost.isActive()) G.debug.forceMinigame(true);
      G.dialogue.startScene('walk_start');
      for (var i=0;i<12;i++){ if(!G.dialogue.isActive()) break; var t=G.debug.inspectNode(); if(!t||t.type==='minigame') break; G.debug.pick(0); }
    })()`, 40);

    const ballAudit = await audit("ballPlay", `(function(){
      if (G.minigameHost.isActive()) G.debug.forceMinigame(true);
      G.dialogue.startScene('walk_start');
      for (var i=0;i<20;i++){ if(!G.dialogue.isActive()) break; var t=G.debug.inspectNode(); if(!t||t.type==='minigame') break; G.debug.pick(0); }
    })()`, 40);

    // debrief pages
    await ev("(function(){ if(G.minigameHost.isActive()) G.debug.forceMinigame(true); return 1; })()");
    await sleep(600);
    const pages = await ev("G.debrief.pageNames()");
    const debriefAudits = [];
    for (let i = 0; i < pages.length; i++) {
      debriefAudits.push(await audit("debrief:" + pages[i], `(function(){
        if(!G.debrief.isVisible()){
          G.state.addNote({principle:'I-028',verdict:'good',text:'Audit seed note one.'});
          G.state.addNote({principle:'I-043',verdict:'bad',text:'Audit seed note two.'});
          G.state.addTrust(5);
          G.debrief.show();
        }
        G.debrief.setPage(${i});
      })()`, 20));
    }

    const all = [worldAudit, choiceAudit, nbAudit, giftAudit, travelAudit, ballAudit].concat(debriefAudits);

    console.log("=== TEXT FIT AUDIT (real canvas metrics) ===\n");
    let problems = 0;
    const CANVAS_W = 960, CANVAS_H = 600;

    for (const a of all) {
      const calls = a.calls.filter(c => c.text && c.text.trim().length);
      const out = [];
      for (const c of calls) {
        const scale = c.scale || 1;
        const w = c.width * scale;
        const x = c.x * scale + c.tx;
        const y = c.y * scale + c.ty;
        // textAlign decides which side of x the glyphs occupy
        let left, right;
        if (c.align === "right" || c.align === "end") { left = x - w; right = x; }
        else if (c.align === "center") { left = x - w / 2; right = x + w / 2; }
        else { left = x; right = x + w; }
        // ignore text the game draws deliberately off-canvas (marquees / decor)
        if (right < -200 || left > CANVAS_W + 200) continue;
        if (left < -8) out.push({ why: "left overflow", c, at: Math.round(left) });
        else if (right > CANVAS_W + 8) out.push({ why: "right overflow", c, at: Math.round(right) });
        else if (y > CANVAS_H + 40) out.push({ why: "below canvas", c, at: Math.round(y) });
      }
      const worst = out.slice(0, 6);
      const uniq = Array.from(new Set(calls.map(c => c.text.trim())));
      const ctxInfo = "state=" + a.state + (a.scene ? " scene=" + a.scene : "") + (a.mg ? " mg=" + a.mg : "") + (a.page !== null && a.page !== undefined ? " page=" + a.page : "");
      console.log(`${a.label.padEnd(22)} strings=${String(calls.length).padStart(4)} unique=${String(uniq.length).padStart(3)}  overflow=${out.length}  [${ctxInfo}]`);
      if (uniq.length <= 14) {
        console.log(`   ^ WARNING: only ${uniq.length} unique strings — surface may not be rendering`);
        problems++;
      }
      console.log(`   sample: ` + uniq.slice(0, 4).map(s => JSON.stringify(s.slice(0, 38))).join(" | "));
      worst.forEach(o => {
        problems++;
        console.log(`   ! ${o.why}: "${o.c.text.slice(0, 64)}" align=${o.c.align} x=${o.c.x} w=${o.c.width} edge=${o.at} font=${o.c.font}`);
      });
    }

    console.log("\nconsole errors/exceptions: " + logs.length);
    logs.slice(0, 6).forEach(l => console.log("  " + l));

    if (problems === 0 && logs.length === 0) console.log("\nTEXT AUDIT PASSED — no overflow, no runtime errors");
    else { console.log("\nissues found: " + problems + " overflow, " + logs.length + " runtime"); process.exitCode = 1; }

    server.close(); chrome.kill();
  } catch (e) {
    console.error("FAILED: " + e.message);
    if (cerr) console.error(cerr.slice(-1200));
    process.exitCode = 1;
  } finally {
    try { chrome.kill(); } catch (e) {}
    server.close();
    setTimeout(() => process.exit(process.exitCode || 0), 250);
  }
})();
