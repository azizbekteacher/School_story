/* Verify the DEPLOYED game boots and plays at the GitHub Pages URL.
   Not just "files return 200" — actually load it in Chrome and drive it. */
const http = require("http");
const crypto = require("crypto");
const { spawn } = require("child_process");
const net = require("net");
const os = require("os");
const path = require("path");

const URL_ = process.argv[2] || "https://azizbekteacher.github.io/School_story/";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9600 + Math.floor(Math.random() * 300);
const PROFILE = path.join(os.tmpdir(), "dsh-pages-" + Date.now());
const sleep = ms => new Promise(r => setTimeout(r, ms));

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
  constructor(h, p, wp) { this.key = crypto.randomBytes(16).toString("base64"); this.buf = Buffer.alloc(0); this.id = 0; this.handlers = new Map(); this.onMsg = () => {}; this.h = h; this.p = p; this.wp = wp; }
  connect() {
    return new Promise((res, rej) => {
      const r = http.request({ host: this.h, port: this.p, path: this.wp, headers: { Connection: "Upgrade", Upgrade: "websocket", "Sec-WebSocket-Key": this.key, "Sec-WebSocket-Version": "13" } });
      r.on("upgrade", (x, s) => { this.sock = s; this.sock.on("error", () => {}); this.sock.on("data", d => { this.buf = Buffer.concat([this.buf, d]); this.parse(); }); res(); });
      r.on("error", rej); r.end();
    });
  }
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

(async () => {
  const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + PORT, "--user-data-dir=" + PROFILE,
    "--no-first-run", "--disable-gpu", "--hide-scrollbars", "--window-size=1200,860", "about:blank"], { stdio: "ignore" });
  const done = c => { try { chrome.kill(); } catch (e) {} setTimeout(() => process.exit(c), 300); };
  try {
    await waitPort(PORT);
    const page = (await getJson("/json/list")).find(t => t.type === "page");
    const u = new URL(page.webSocketDebuggerUrl.replace(/^ws:\/\//, "http://"));
    const ws = new WS(u.hostname, u.port, u.pathname);
    await ws.connect();
    const logs = [], netFails = [];
    ws.onMsg = m => {
      if (m.method === "Runtime.exceptionThrown") logs.push("EXC: " + ((m.params.exceptionDetails.exception || {}).description || m.params.exceptionDetails.text));
      if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") logs.push("ERR: " + (m.params.args || []).map(a => a.value || a.description || "").join(" "));
      if (m.method === "Network.loadingFailed") netFails.push(m.params.errorText + " " + (m.params.type || ""));
      if (m.id && ws.handlers.has(m.id)) { const h = ws.handlers.get(m.id); ws.handlers.delete(m.id); h(m); }
    };
    await ws.cmd("Runtime.enable"); await ws.cmd("Page.enable"); await ws.cmd("Network.enable");
    await ws.cmd("Page.navigate", { url: URL_ });
    await sleep(3500);
    const ev = async e => {
      const r = await ws.cmd("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception || {}).description || r.exceptionDetails.text);
      return r.result.value;
    };
    const boot = await ev(`JSON.stringify({
      state: GAME.getState(),
      chapters: G.chapters.list().map(function(c){return c.id;}),
      storage: G.memory.supported(),
      canvas: (function(){var c=document.getElementById('game'); return c? c.width+'x'+c.height : null;})()
    })`);
    console.log("boot: " + boot);
    await ev(`window.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))`);
    await sleep(1500);
    const play = await ev(`JSON.stringify({ state: GAME.getState(), chapter: G.state.chapter, beat: G.state.beat, hero: { x: Math.round(G.world.player.x), y: Math.round(G.world.player.y) } })`);
    console.log("play: " + play);
    const B = JSON.parse(boot), P = JSON.parse(play);
    let fail = 0;
    const ck = (c, l) => { console.log((c ? "  PASS  " : "  FAIL  ") + l); if (!c) fail++; };
    ck(B.state === "title", "boots to the title screen on the live URL");
    ck(B.chapters.length === 2, "both chapters load over HTTP");
    ck(B.canvas === "960x600", "canvas is 960x600");
    ck(P.state === "play", "Enter starts the game");
    ck(P.chapter === "ch1", "chapter 1 is the default");
    ck(logs.length === 0, "no console errors" + (logs.length ? ": " + logs.slice(0, 5).join(" | ") : ""));
    ck(netFails.length === 0, "no failed network requests" + (netFails.length ? ": " + netFails.slice(0, 5).join(" | ") : ""));
    console.log(fail ? `\nLIVE URL FAILED — ${fail} problem(s)` : `\nLIVE URL PASSED — the deployed game boots and plays at ${URL_}`);
    done(fail ? 1 : 0);
  } catch (e) {
    console.error("failed: " + e.message);
    done(1);
  }
})();
