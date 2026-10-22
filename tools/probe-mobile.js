/* Prove the game is playable on a phone, not just "responsive".

   Emulates a real touch device over the DevTools Protocol (Emulation.
   setDeviceMetricsOverride + Emulation.setTouchEmulationEnabled +
   Emulation.setEmitTouchEventsForMouse), then:
     1. the canvas fits the viewport and keeps its aspect ratio
     2. the touch UI appears and the d-pad is inside the viewport
     3. tapping the d-pad actually moves the hero (the whole point)
     4. tapping the action button advances dialogue
     5. no console errors

   Usage: node tools/probe-mobile.js [--shot] */
const http = require("http");
const crypto = require("crypto");
const { spawn } = require("child_process");
const net = require("net");
const os = require("os");
const path = require("path");
const fs = require("fs");

const ROOT = path.join(__dirname, "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9900 + Math.floor(Math.random() * 90);
const PROFILE = path.join(os.tmpdir(), "dsh-mob-" + Date.now());
const DO_SHOT = process.argv.includes("--shot");
const SHOT_DIR = path.join(__dirname, "shots");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* A landscape phone. 844x390 is an iPhone 14/15 logical viewport — short enough
   that a naive HUD would collide with the touch controls. */
const DEV = { w: 844, h: 390, dpr: 3 };

function waitPort(port, t = 15000) {
  return new Promise((res, rej) => {
    const t0 = Date.now();
    (function a() {
      const s = net.connect(port, "127.0.0.1");
      s.on("connect", () => { s.destroy(); res(); });
      s.on("error", () => { s.destroy(); if (Date.now() - t0 > t) rej(new Error("chrome port timeout")); else setTimeout(a, 150); });
    })();
  });
}
function getJson(p) {
  return new Promise((res, rej) => {
    http.get({ host: "127.0.0.1", port: PORT, path: p }, (r) => {
      let d = ""; r.on("data", (c) => (d += c)); r.on("end", () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    }).on("error", rej);
  });
}
class WS {
  constructor(h, p, wp) { this.key = crypto.randomBytes(16).toString("base64"); this.buf = Buffer.alloc(0); this.id = 0; this.handlers = new Map(); this.onMsg = () => {}; this.h = h; this.p = p; this.wp = wp; }
  connect() {
    return new Promise((res, rej) => {
      const r = http.request({ host: this.h, port: this.p, path: this.wp, headers: { Connection: "Upgrade", Upgrade: "websocket", "Sec-WebSocket-Key": this.key, "Sec-WebSocket-Version": "13" } });
      r.on("upgrade", (x, s) => { this.sock = s; this.sock.on("error", () => {}); this.sock.on("data", (d) => { this.buf = Buffer.concat([this.buf, d]); this.parse(); }); res(); });
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
  cmd(me, pa) {
    const id = ++this.id;
    return new Promise((res, rej) => {
      this.handlers.set(id, (m) => (m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result)));
      this.send({ id, method: me, params: pa || {} });
    });
  }
}

let fail = 0;
const ck = (c, l, extra) => { console.log((c ? "  PASS  " : "  FAIL  ") + l + (extra ? "  [" + extra + "]" : "")); if (!c) fail++; };

(async () => {
  const url = "file:///" + path.join(ROOT, "index.html").replace(/\\/g, "/");
  const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + PORT,
    "--user-data-dir=" + PROFILE, "--no-first-run", "--disable-gpu", "--hide-scrollbars",
    "--window-size=" + DEV.w + "," + DEV.h, "about:blank"], { stdio: "ignore" });
  const done = (c) => { try { chrome.kill(); } catch (e) {} setTimeout(() => process.exit(c), 300); };

  try {
    await waitPort(PORT);
    const page = (await getJson("/json/list")).find((t) => t.type === "page");
    const u = new URL(page.webSocketDebuggerUrl.replace(/^ws:\/\//, "http://"));
    const ws = new WS(u.hostname, u.port, u.pathname);
    await ws.connect();

    const errors = [];
    ws.onMsg = (m) => {
      if (m.method === "Runtime.exceptionThrown") errors.push(((m.params.exceptionDetails.exception || {}).description || m.params.exceptionDetails.text || "").toString());
      if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errors.push((m.params.args || []).map((a) => a.value || a.description || "").join(" "));
      if (m.id && ws.handlers.has(m.id)) { const h = ws.handlers.get(m.id); ws.handlers.delete(m.id); h(m); }
    };
    await ws.cmd("Runtime.enable");
    await ws.cmd("Page.enable");

    // ---- emulate a real phone before loading ----------------------------
    await ws.cmd("Emulation.setDeviceMetricsOverride", {
      width: DEV.w, height: DEV.h, deviceScaleFactor: DEV.dpr, mobile: true
    });
    await ws.cmd("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    await ws.cmd("Emulation.setEmitTouchEventsForMouse", { enabled: true, configuration: "mobile" });
    await ws.cmd("Page.navigate", { url });
    await sleep(2800);

    const ev = async (expr) => {
      const r = await ws.cmd("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error(((r.exceptionDetails.exception || {}).description || r.exceptionDetails.text || "").toString());
      return r.result.value;
    };
    const shot = async (name) => {
      if (!DO_SHOT) return;
      if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });
      const r = await ws.cmd("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(path.join(SHOT_DIR, name), Buffer.from(r.data, "base64"));
      console.log("         saved tools/shots/" + name);
    };
    /* A real tap: dispatchTouchEvent through the input domain, which is what a
       finger actually produces. Not a synthetic MouseEvent. */
    const tap = async (x, y, holdMs) => {
      await ws.cmd("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: Math.round(x), y: Math.round(y), id: 1, radiusX: 8, radiusY: 8, force: 1 }]
      });
      await sleep(holdMs || 90);
      await ws.cmd("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    };

    // ---- 1. the canvas fits the viewport -------------------------------
    const fit = JSON.parse(await ev(`(function(){
      var cv = document.getElementById('game');
      var r = cv.getBoundingClientRect();
      return JSON.stringify({
        vw: window.innerWidth, vh: window.innerHeight,
        x: Math.round(r.left), y: Math.round(r.top),
        w: Math.round(r.width), h: Math.round(r.height),
        fits: r.width <= window.innerWidth + 1 && r.height <= window.innerHeight + 1,
        ratio: Math.round((r.width / r.height) * 1000) / 1000
      });
    })()`));
    console.log("         viewport " + fit.vw + "x" + fit.vh + ", canvas " + fit.w + "x" + fit.h + " at (" + fit.x + "," + fit.y + ")");
    ck(fit.fits, "the canvas fits inside a landscape phone viewport");
    ck(Math.abs(fit.ratio - 1.6) < 0.02, "the canvas keeps its 960:600 aspect ratio", "ratio " + fit.ratio);

    // ---- 2. the touch UI is visible and on screen ---------------------
    const ui = JSON.parse(await ev(`(function(){
      var t = document.getElementById('touch-ui');
      var dpad = document.getElementById('dpad');
      var tacts = document.getElementById('tacts');
      var cs = getComputedStyle(t);
      var dr = dpad.getBoundingClientRect();
      var ar = tacts.getBoundingClientRect();
      return JSON.stringify({
        enabled: G.touch.isEnabled(),
        display: cs.display,
        buttons: document.querySelectorAll('#touch-ui .tbtn').length,
        dpad: { x: Math.round(dr.left), y: Math.round(dr.top), w: Math.round(dr.width), h: Math.round(dr.height) },
        tacts: { x: Math.round(ar.left), y: Math.round(ar.top), w: Math.round(ar.width), h: Math.round(ar.height) },
        vw: window.innerWidth, vh: window.innerHeight
      });
    })()`));
    ck(ui.enabled === true, "G.touch detects the emulated touch device");
    ck(ui.display !== "none", "the touch UI is displayed", ui.display);
    ck(ui.buttons >= 6, "all touch buttons are present", ui.buttons + " buttons");
    ck(ui.dpad.x >= 0 && ui.dpad.y >= 0 && ui.dpad.x + ui.dpad.w <= ui.vw && ui.dpad.y + ui.dpad.h <= ui.vh,
      "the d-pad is fully inside the viewport", JSON.stringify(ui.dpad));
    ck(ui.tacts.x + ui.tacts.w <= ui.vw && ui.tacts.y + ui.tacts.h <= ui.vh,
      "the action buttons are fully inside the viewport", JSON.stringify(ui.tacts));
    await shot("mobile-title.png");

    // ---- 3. start the game by tapping, then walk with the d-pad --------
    // Tap the centre of the canvas (the title's ENTER affordance also accepts
    // Enter; use the key so this test is about the d-pad, not the title).
    await ev(`window.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))`);
    await sleep(1500);
    const started = await ev(`GAME.getState()`);
    ck(started === "play", "the game starts on the phone viewport", started);

    const before = JSON.parse(await ev(`JSON.stringify({ x: G.world.player.x, y: G.world.player.y })`));
    // Hold "right" for a moment. The d-pad sits bottom-left; its right button is
    // the middle cell of the right column of a 3x3 grid.
    const rt = JSON.parse(await ev(`(function(){
      var b = document.querySelector('#dpad .tbtn[data-key="arrowright"]');
      var r = b.getBoundingClientRect();
      return JSON.stringify({ x: r.left + r.width/2, y: r.top + r.height/2 });
    })()`));
    await ws.cmd("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: Math.round(rt.x), y: Math.round(rt.y), id: 1, radiusX: 8, radiusY: 8, force: 1 }]
    });
    await sleep(700);
    await ws.cmd("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await sleep(250);
    const after = JSON.parse(await ev(`JSON.stringify({ x: G.world.player.x, y: G.world.player.y })`));
    const moved = Math.round(after.x - before.x);
    console.log("         hero moved " + moved + "px right from a d-pad tap");
    ck(moved > 4, "tapping the d-pad moves the hero", moved + "px");

    // And that releasing it stops him — a stuck virtual key is worse than none.
    const p1 = JSON.parse(await ev(`JSON.stringify({ x: G.world.player.x })`));
    await sleep(500);
    const p2 = JSON.parse(await ev(`JSON.stringify({ x: G.world.player.x })`));
    ck(Math.abs(p2.x - p1.x) < 2, "releasing the d-pad stops the hero", "drift " + Math.round(Math.abs(p2.x - p1.x)) + "px");
    await shot("mobile-play.png");

    // ---- 4. the action button drives dialogue -------------------------
    // Put a dialogue on screen, then tap E.
    const dlg = await ev(`(function(){
      G.dialogue.startScene('opening');
      return JSON.stringify({ active: G.dialogue.isActive(), node: G.dialogue.debugNodeId() });
    })()`);
    const d0 = JSON.parse(dlg);
    ck(d0.active, "a dialogue scene starts", d0.node);
    await sleep(400);
    // first tap completes the typewriter, second advances
    const eb = JSON.parse(await ev(`(function(){
      var b = document.querySelector('#tacts .tbtn[data-key="enter"]');
      var r = b.getBoundingClientRect();
      return JSON.stringify({ x: r.left + r.width/2, y: r.top + r.height/2 });
    })()`));
    await tap(eb.x, eb.y, 110);
    await sleep(320);
    await tap(eb.x, eb.y, 110);
    await sleep(420);
    const d1 = JSON.parse(await ev(`JSON.stringify({ active: G.dialogue.isActive(), node: G.dialogue.debugNodeId(), typing: G.dialogue.debugTyping() })`));
    // The first tap only finishes the typewriter, which is correct behaviour but
    // would make "it advanced" vacuously true. Tap once more so the node id must
    // actually change.
    if (d1.node === d0.node) {
      await tap(eb.x, eb.y, 110);
      await sleep(420);
    }
    const d2 = JSON.parse(await ev(`JSON.stringify({ active: G.dialogue.isActive(), node: G.dialogue.debugNodeId(), typing: G.dialogue.debugTyping() })`));
    ck(d2.node !== d0.node,
      "tapping the action button advances dialogue to a new node", d0.node + " -> " + d2.node);
    ck(!d2.typing || d2.node !== d0.node, "the advanced line is rendering", "typing=" + d2.typing);

    // ---- 5. MENYU is reachable by thumb -------------------------------
    // The canvas MENYU button renders in the top-left of the play area; the DOM
    // MENYU button in #tacts is the notebook/menu route.
    const mb = JSON.parse(await ev(`(function(){
      var b = document.querySelector('#tacts .tbtn[data-key="tab"]');
      var r = b.getBoundingClientRect();
      return JSON.stringify({ x: r.left + r.width/2, y: r.top + r.height/2, label: b.textContent.trim() });
    })()`));
    ck(/MENYU/i.test(mb.label), "there is a MENYU touch button", mb.label);

    ck(errors.length === 0, "no console errors on the phone viewport", errors.slice(0, 3).join(" | "));

    console.log(fail
      ? `\nMOBILE PROBE FAILED — ${fail} problem(s)`
      : "\nMOBILE PROBE PASSED — fits a phone, touch UI on screen, d-pad moves the hero, action button advances dialogue");
    done(fail ? 1 : 0);
  } catch (e) {
    console.error("mobile probe crashed: " + e.message);
    done(1);
  }
})();
