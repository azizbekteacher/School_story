/* Verify the deployed GitHub Pages site for real.

   Three layers, each of which can fail independently:
     1. HTTP  — the live URL and the three asset paths that break when a site
                is served from a subpath (/School_story/) with absolute refs.
     2. HTML  — no root-absolute src/href in the served index.html.
     3. Boot  — real headless Chrome loads the live URL and the game reaches the
                title screen with no console errors and no failed requests.

   Usage:
     node tools/check-pages.js                  full check (HTTP + headless boot)
     node tools/check-pages.js --no-browser     HTTP + HTML only
     node tools/check-pages.js <baseUrl>        check another base URL

   Exit code 0 = everything green, 1 = at least one check failed. */
const https = require("https");
const http = require("http");
const net = require("net");
const os = require("os");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");

const DEFAULT_BASE = "https://azizbekteacher.github.io/School_story/";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ASSETS = ["js/main.js", "css/style.css", "memory.js"];
const NEEDLE = "Sulton School";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const NO_BROWSER = process.argv.includes("--no-browser");
const baseArg = process.argv.slice(2).find(a => !a.startsWith("--"));
const base = (baseArg || DEFAULT_BASE).replace(/\/?$/, "/");

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok });
  console.log((ok ? "  PASS  " : "  FAIL  ") + name + (detail ? "  " + detail : ""));
}

function get(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https:") ? https : http;
    const req = lib.get(url, { headers: { "user-agent": "school-story-pages-check" } }, res => {
      const { statusCode = 0, headers } = res;
      if (statusCode >= 300 && statusCode < 400 && headers.location && redirects < 5) {
        res.resume();
        const next = new URL(headers.location, url).toString();
        return resolve(get(next, redirects + 1));
      }
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve({
        status: statusCode,
        type: headers["content-type"] || "",
        body: Buffer.concat(chunks).toString("utf8")
      }));
    });
    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error("timeout after 20s: " + url)));
  });
}

/* ---- minimal DevTools Protocol client over a hand-rolled WebSocket ----
   Same approach as tools/probe-hero.js: no npm, no ws package. */
function waitPort(port, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    (function attempt() {
      const s = net.connect(port, "127.0.0.1");
      s.on("connect", () => { s.destroy(); resolve(); });
      s.on("error", () => {
        s.destroy();
        if (Date.now() - t0 > timeout) reject(new Error("devtools port timeout"));
        else setTimeout(attempt, 150);
      });
    })();
  });
}
function getJson(port, p) {
  return new Promise((resolve, reject) => {
    http.get({ host: "127.0.0.1", port, path: p }, r => {
      let d = "";
      r.on("data", c => d += c);
      r.on("end", () => { try { resolve(JSON.parse(d)); } catch (e) { reject(e); } });
    }).on("error", reject);
  });
}
class WS {
  constructor(host, port, pathname) {
    this.host = host; this.port = port; this.path = pathname;
    this.key = crypto.randomBytes(16).toString("base64");
    this.buf = Buffer.alloc(0); this.id = 0; this.handlers = new Map(); this.onMsg = () => {};
  }
  connect() {
    return new Promise((resolve, reject) => {
      const req = http.request({
        host: this.host, port: this.port, path: this.path,
        headers: {
          Connection: "Upgrade", Upgrade: "websocket",
          "Sec-WebSocket-Key": this.key, "Sec-WebSocket-Version": "13"
        }
      });
      req.on("upgrade", (res, sock) => {
        this.sock = sock;
        sock.on("data", d => { this.buf = Buffer.concat([this.buf, d]); this.parse(); });
        sock.on("error", () => {});
        resolve();
      });
      req.on("error", reject);
      req.end();
    });
  }
  parse() {
    while (this.buf.length >= 2) {
      const b1 = this.buf[1], op = this.buf[0] & 0x0f, masked = (b1 & 0x80) !== 0;
      let len = b1 & 0x7f, off = 2;
      if (len === 126) { if (this.buf.length < 4) return; len = this.buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (this.buf.length < 10) return; len = Number(this.buf.readBigUInt64BE(2)); off = 10; }
      let mask = null;
      if (masked) { if (this.buf.length < off + 4) return; mask = this.buf.slice(off, off + 4); off += 4; }
      if (this.buf.length < off + len) return;
      let payload = this.buf.slice(off, off + len);
      if (mask) {
        const out = Buffer.alloc(len);
        for (let i = 0; i < len; i++) out[i] = payload[i] ^ mask[i % 4];
        payload = out;
      }
      this.buf = this.buf.slice(off + len);
      if (op === 0x1) { try { this.onMsg(JSON.parse(payload.toString("utf8"))); } catch (e) {} }
    }
  }
  send(obj) {
    const data = Buffer.from(JSON.stringify(obj), "utf8");
    const mask = crypto.randomBytes(4);
    const masked = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i++) masked[i] = data[i] ^ mask[i % 4];
    let header;
    if (data.length < 126) header = Buffer.from([0x81, 0x80 | data.length]);
    else { header = Buffer.alloc(4); header[0] = 0x81; header[1] = 0x80 | 126; header.writeUInt16BE(data.length, 2); }
    this.sock.write(Buffer.concat([header, mask, masked]));
  }
  cmd(method, params) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.handlers.set(id, m => m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result));
      this.send({ id, method, params: params || {} });
    });
  }
}

async function bootCheck() {
  const port = 9400 + Math.floor(Math.random() * 400);
  const profile = path.join(os.tmpdir(), "dsh-pages-" + Date.now());
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  let faviconNote = null;
  const chrome = spawn(CHROME, [
    "--headless=new", "--remote-debugging-port=" + port, "--user-data-dir=" + profile,
    "--no-first-run", "--no-default-browser-check", "--disable-gpu",
    "--hide-scrollbars", "--window-size=1200,860", "about:blank"
  ], { stdio: "ignore" });

  let ws = null;
  const cleanup = () => {
    try { if (ws && ws.sock) ws.sock.destroy(); } catch (e) {}
    try { chrome.kill(); } catch (e) {}
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
  };

  try {
    await waitPort(port);
    const page = (await getJson(port, "/json/list")).find(t => t.type === "page");
    if (!page) throw new Error("no DevTools page target");
    const u = new URL(page.webSocketDebuggerUrl.replace(/^ws:\/\//, "http://"));
    ws = new WS(u.hostname, u.port, u.pathname);
    await ws.connect();
    ws.onMsg = m => {
      if (m.id && ws.handlers.has(m.id)) { const h = ws.handlers.get(m.id); ws.handlers.delete(m.id); h(m); return; }
      if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
        consoleErrors.push((m.params.args || []).map(a => a.value !== undefined ? a.value : a.description).join(" "));
      }
      if (m.method === "Runtime.exceptionThrown") {
        const d = m.params.exceptionDetails || {};
        pageErrors.push((d.exception && (d.exception.description || d.exception.value)) || d.text || "unknown exception");
      }
      if (m.method === "Network.loadingFailed") {
        failedRequests.push((m.params.errorText || "failed") + " " + (m.params.blockedReason || ""));
      }
      if (m.method === "Network.responseReceived") {
        const r = m.params.response || {};
        if (r.status < 400) return;
        // A browser asks for /favicon.ico at the ORIGIN root when the page
        // declares no icon. That path belongs to the github.io user site, not
        // to this repository, so it cannot be fixed from here. Recorded as a
        // note, not a failure.
        const pathname = new URL(r.url).pathname;
        if (pathname === "/favicon.ico") { faviconNote = "HTTP " + r.status + " " + r.url; return; }
        failedRequests.push("HTTP " + r.status + " " + r.url);
      }
    };
    await ws.cmd("Runtime.enable");
    await ws.cmd("Page.enable");
    await ws.cmd("Network.enable");
    await ws.cmd("Log.enable");

    const ev = async expr => {
      const r = await ws.cmd("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) {
        throw new Error((r.exceptionDetails.exception || {}).description || r.exceptionDetails.text);
      }
      return r.result.value;
    };

    await ws.cmd("Page.navigate", { url: base });
    await sleep(4000);   // boot, assets, first frames

    const probe = JSON.parse(await ev(`(function(){
      return JSON.stringify({
        href: location.href,
        title: document.title,
        state: (window.GAME && GAME.getState) ? GAME.getState() : null,
        chapters: (window.G && G.chapters && G.chapters.list) ? G.chapters.list().length : null,
        storyTitle: (window.G && G.data && G.data.story) ? G.data.story.title : null,
        canvas: (function(){
          var c = document.getElementById("game");
          return c ? { w: c.width, h: c.height } : null;
        })(),
        hasStage: !!document.getElementById("stage"),
        bodyChars: document.body ? document.body.innerText.length : 0
      });
    })()`));

    check("headless Chrome loaded " + base, probe.state !== null, "state=" + JSON.stringify(probe.state));
    check("game boots to the title screen", probe.state === "title", "GAME.getState() = " + JSON.stringify(probe.state));
    check("chapter registry is populated", probe.chapters !== null && probe.chapters > 0, probe.chapters + " chapter(s)");
    check("canvas is 960x600", !!probe.canvas && probe.canvas.w === 960 && probe.canvas.h === 600,
      probe.canvas ? probe.canvas.w + "x" + probe.canvas.h : "no canvas");
    check("no uncaught page exceptions", pageErrors.length === 0,
      pageErrors.length ? pageErrors.join(" | ").slice(0, 400) : "none");
    check("no console errors", consoleErrors.length === 0,
      consoleErrors.length ? consoleErrors.join(" | ").slice(0, 400) : "none");
    check("no failed network requests", failedRequests.length === 0,
      failedRequests.length ? failedRequests.slice(0, 6).join(" | ") : "none");
    if (faviconNote) console.log("  NOTE  ignored browser favicon probe outside the app: " + faviconNote);

    // Pressing Enter on the title screen starts the game. Proves the site is
    // actually playable, not merely that its scripts parsed.
    await ev(`window.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))`);
    await sleep(1500);
    const after = JSON.parse(await ev(`(function(){
      var p = (window.G && G.world) ? G.world.player : null;
      var c = (window.G && G.world) ? G.world.cam : null;
      return JSON.stringify({
        state: (window.GAME && GAME.getState) ? GAME.getState() : null,
        chapter: (window.G && G.state) ? G.state.chapter : null,
        beat: (window.G && G.state) ? G.state.beat : null,
        player: p ? { x: Math.round(p.x), y: Math.round(p.y) } : null,
        cam: c ? { x: Math.round(c.x), y: Math.round(c.y) } : null
      });
    })()`));
    check("Enter starts the game from the title screen", after.state === "play",
      "GAME.getState() = " + JSON.stringify(after.state) + ", chapter " + after.chapter);
    check("player exists in the world", !!after.player,
      after.player ? "at " + after.player.x + "," + after.player.y : "no player");
    check("no uncaught exceptions after starting", pageErrors.length === 0,
      pageErrors.length ? pageErrors.join(" | ").slice(0, 400) : "none");
    check("no console errors after starting", consoleErrors.length === 0,
      consoleErrors.length ? consoleErrors.join(" | ").slice(0, 400) : "none");

    console.log("");
    console.log("  boot probe:  " + JSON.stringify(probe));
    console.log("  play probe:  " + JSON.stringify(after));
  } finally {
    cleanup();
  }
}

(async () => {
  console.log("live site: " + base);
  console.log("");

  let home = null;
  try {
    home = await get(base);
  } catch (e) {
    console.log("  FAIL  homepage unreachable: " + e.message);
  }
  if (home) {
    check("GET " + base, home.status === 200, "HTTP " + home.status + " " + home.type);
    check('homepage HTML contains "' + NEEDLE + '"', home.body.indexOf(NEEDLE) !== -1,
      home.body.indexOf(NEEDLE) !== -1 ? "found" : "NOT found (" + home.body.length + " bytes)");

    for (const asset of ASSETS) {
      const url = base + asset;
      try {
        const r = await get(url);
        check("GET " + asset, r.status === 200 && r.body.length > 0,
          "HTTP " + r.status + " " + r.body.length + " bytes " + r.type);
      } catch (e) {
        check("GET " + asset, false, e.message);
      }
    }

    // A leading "/" reference would resolve to the domain root and 404 under
    // the /School_story/ subpath. Catch it without a browser.
    const badRefs = [];
    const re = /(?:src|href)\s*=\s*["']([^"']+)["']/gi;
    let m;
    while ((m = re.exec(home.body))) {
      const ref = m[1];
      if (/^(?:[a-z]+:)?\/\//i.test(ref) || ref.startsWith("data:") || ref.startsWith("#")) continue;
      if (ref.startsWith("/")) badRefs.push(ref);
    }
    check("no root-absolute asset references in HTML", badRefs.length === 0,
      badRefs.length ? "found " + badRefs.join(", ") : "all relative");

    // The workflow stages the root minus dev-only material. Confirm that
    // exclusion actually took effect on the live site.
    const excluded = ["tools/probe-hero.js", "play-stable.bat", "_stable-play/"];
    const stillServed = [];
    for (const p of excluded) {
      try {
        const r = await get(base + p);
        if (r.status === 200) stillServed.push(p);
      } catch (e) { /* unreachable is fine — it is meant to be absent */ }
    }
    check("dev-only material is not deployed", stillServed.length === 0,
      stillServed.length ? "still served: " + stillServed.join(", ") : excluded.length + " dev paths 404");
  }

  if (!NO_BROWSER && home && home.status === 200) {
    console.log("");
    console.log("headless Chrome boot check:");
    if (!fs.existsSync(CHROME)) {
      check("headless Chrome available", false, "not found at " + CHROME);
    } else {
      try {
        await bootCheck();
      } catch (e) {
        check("headless Chrome boot check", false, e.message);
      }
    }
  }

  const failed = results.filter(r => !r.ok);
  console.log("");
  console.log(failed.length === 0
    ? "  PASS  " + results.length + "/" + results.length + " checks green — " + base
    : "  FAIL  " + failed.length + " of " + results.length + " checks failed");
  process.exit(failed.length === 0 ? 0 : 1);
})();
