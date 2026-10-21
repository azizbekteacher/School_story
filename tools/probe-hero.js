/* Is the hero actually on screen, and did the camera follow him?
   Boots index.html in real Chrome from file://, starts the selected chapter and
   reports where the player is in SCREEN space. Anything outside the viewport
   means the camera lost him — the bug being fixed.
   Usage: node tools/probe-hero.js [chapterNumber] */
const fs = require("fs");
const path = require("path");
const http = require("http");
const net = require("net");
const os = require("os");
const crypto = require("crypto");
const { spawn } = require("child_process");
const root = path.join(__dirname, "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9300 + Math.floor(Math.random() * 400);
const PROFILE = path.join(os.tmpdir(), "dsh-hero-" + Date.now());
const WANT = process.argv[2] || "1";
const sleep = ms => new Promise(r => setTimeout(r, ms));

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": p.endsWith(".js") ? "text/javascript" : p.endsWith(".css") ? "text/css" : "text/html" });
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
      let d = ""; r.on("data", c => d += c); r.on("end", () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    }).on("error", rej);
  });
}
class WS {
  constructor(h, p, wp) { this.h = h; this.p = p; this.wp = wp; this.key = crypto.randomBytes(16).toString("base64"); this.buf = Buffer.alloc(0); this.id = 0; this.handlers = new Map(); this.onMsg = () => {}; }
  connect() { return new Promise((res, rej) => { const r = http.request({ host: this.h, port: this.p, path: this.wp, headers: { Connection: "Upgrade", Upgrade: "websocket", "Sec-WebSocket-Key": this.key, "Sec-WebSocket-Version": "13" } }); r.on("upgrade", (x, s) => { this.sock = s; this.sock.on("data", d => { this.buf = Buffer.concat([this.buf, d]); this.parse(); }); this.sock.on("error", () => {}); res(); }); r.on("error", rej); r.end(); }); }
  parse() {
    while (this.buf.length >= 2) {
      const b1 = this.buf[1], op = this.buf[0] & 0x0f, mk = (b1 & 0x80) !== 0;
      let len = b1 & 0x7f, off = 2;
      if (len === 126) { if (this.buf.length < 4) return; len = this.buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (this.buf.length < 10) return; len = Number(this.buf.readBigUInt64BE(2)); off = 10; }
      let m = null;
      if (mk) { if (this.buf.length < off + 4) return; m = this.buf.slice(off, off + 4); off += 4; }
      if (this.buf.length < off + len) return;
      let pl = this.buf.slice(off, off + len);
      if (m) { const c = Buffer.alloc(len); for (let i = 0; i < len; i++) c[i] = pl[i] ^ m[i % 4]; pl = c; }
      this.buf = this.buf.slice(off + len);
      if (op === 0x1) { try { this.onMsg(JSON.parse(pl.toString("utf8"))); } catch (e) {} }
    }
  }
  send(o) {
    const d = Buffer.from(JSON.stringify(o), "utf8"), m = crypto.randomBytes(4), x = Buffer.alloc(d.length);
    for (let i = 0; i < d.length; i++) x[i] = d[i] ^ m[i % 4];
    let h;
    if (d.length < 126) h = Buffer.from([0x81, 0x80 | d.length]);
    else { h = Buffer.alloc(4); h[0] = 0x81; h[1] = 0x80 | 126; h.writeUInt16BE(d.length, 2); }
    this.sock.write(Buffer.concat([h, m, x]));
  }
  cmd(me, pa) { const id = ++this.id; return new Promise((res, rej) => { this.handlers.set(id, m => m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result)); this.send({ id, method: me, params: pa || {} }); }); }
}

let wsRef = null;
(async () => {
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  const url = `http://127.0.0.1:${server.address().port}/index.html`;
  const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + PORT, "--user-data-dir=" + PROFILE,
    "--no-first-run", "--disable-gpu", "--hide-scrollbars", "--window-size=1200,860", "about:blank"], { stdio: "ignore" });
  const done = code => { try { if (wsRef) wsRef.sock.destroy(); } catch (e) {} try { chrome.kill(); } catch (e) {} server.close(); setTimeout(() => process.exit(code), 200); };
  try {
    await waitPort(PORT);
    const page = (await getJson("/json/list")).find(t => t.type === "page");
    const u = new URL(page.webSocketDebuggerUrl.replace(/^ws:\/\//, "http://"));
    const ws = new WS(u.hostname, u.port, u.pathname);
    await ws.connect();
    wsRef = ws;
    ws.onMsg = m => { if (m.id && ws.handlers.has(m.id)) { const h = ws.handlers.get(m.id); ws.handlers.delete(m.id); h(m); } };
    await ws.cmd("Runtime.enable"); await ws.cmd("Page.enable");
    const ev = async e => {
      const r = await ws.cmd("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception || {}).description || r.exceptionDetails.text);
      return r.result.value;
    };
    await ws.cmd("Page.navigate", { url });
    await sleep(2500);
    if (WANT !== "1") { await ev(`window.dispatchEvent(new KeyboardEvent('keydown',{key:'${WANT}',bubbles:true}))`); await sleep(300); }
    await ev(`window.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))`);
    await sleep(1400);

    const r = await ev(`(function(){
      var p = G.world.player, c = G.world.cam;
      var sx = p.x - c.x, sy = p.y - c.y;
      return JSON.stringify({
        chapter: G.state.chapter, story: (G.data.story||{}).title, state: GAME.getState(),
        player: { x: Math.round(p.x), y: Math.round(p.y) },
        cam: { x: Math.round(c.x), y: Math.round(c.y) },
        screen: { x: Math.round(sx), y: Math.round(sy) },
        viewport: { w: 960, h: 600 },
        onScreen: sx > 8 && sx < 952 && sy > 8 && sy < 592
      });
    })()`);
    console.log(r);
    const o = JSON.parse(r);
    console.log("");
    console.log(o.onScreen ? "  PASS  the hero is on screen (screen " + o.screen.x + "," + o.screen.y + " of " + o.viewport.w + "x" + o.viewport.h + ")"
      : "  FAIL  the hero is OFF screen at " + o.screen.x + "," + o.screen.y + " — camera lost him");
    done(o.onScreen ? 0 : 1);
  } catch (e) {
    console.error("probe failed: " + e.message);
    done(1);
  }
})();
