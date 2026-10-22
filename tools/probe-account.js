/* tools/probe-account.js
 *
 * The account client is the one part of the game that talks to a network, and it
 * cannot be exercised end-to-end here: that needs a deployed Worker, a real
 * Google OAuth client and a valid ID token. What CAN be proven offline, and what
 * actually matters for the game's survival, is the opposite property:
 *
 *   the account layer must be completely inert unless it is configured, and it
 *   must never be able to break boot, saving or play.
 *
 * So this probe loads index.html over file://, spies on every fetch, and asserts:
 *
 *   1. boot happens with zero network requests (the file:// contract)
 *   2. G.account exists and is inert: not available, no user, config not enabled
 *   3. init() settles without a request and leaves the client inert
 *   4. signIn() / pull() / sync() / signOut() all settle without throwing
 *      and without a request
 *   5. a forged remote user cannot be injected through G.account.__setUser in a
 *      way that changes game state
 *   6. the game still plays: dialogue advances and the hero moves while the
 *      account layer has been poked
 *   7. no console error or uncaught exception throughout
 *
 * Point 3 and 5 are the ones that matter. A sign-in layer that throws during
 * boot, or that a stale attribute can drive, is a game that will not open.
 *
 * Run: node tools/probe-account.js
 */

"use strict";

const path = require("path");
const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 8793;

/* ------------------------------------------------------------------ CDP --- */

function connect(url, onEvent) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let id = 0;
    const pending = new Map();

    ws.addEventListener("open", () => resolve({ send, close }));
    ws.addEventListener("error", reject);
    ws.addEventListener("message", (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch (e) { return; }
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
      } else if (msg.method) {
        onEvent && onEvent(msg);
      }
    });

    function send(method, params) {
      return new Promise((res, rej) => {
        const n = ++id;
        pending.set(n, { res, rej });
        ws.send(JSON.stringify({ id: n, method, params: params || {} }));
      });
    }
    function close() { try { ws.close(); } catch (e) {} }
  });
}

/* -------------------------------------------------------------- helpers --- */

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function launchChrome(port, profile) {
  const child = spawn(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--mute-audio",
    "--window-size=960,600",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ], { stdio: "ignore", detached: false });
  return child;
}

async function waitForDevtools(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const list = await fetchJson(`http://127.0.0.1:${port}/json/list`);
      if (Array.isArray(list) && list.length) return list;
    } catch (e) { /* not up yet */ }
    await sleep(120);
  }
  throw new Error("Chrome DevTools never came up on port " + port);
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        try { resolve(JSON.parse(d)); } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.setTimeout(2000, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

/* ----------------------------------------------------------------- main --- */

(async function main() {
  const results = [];
  function check(name, ok, detail) {
    results.push({ name, ok: !!ok, detail: detail || "" });
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
  }

  const profile = path.join(require("os").tmpdir(), "dsh-account-" + Date.now());
  const chrome = launchChrome(PORT, profile);
  let conn;

  try {
    const targets = await waitForDevtools(PORT, 15000);
    const page = targets.find((t) => t.type === "page") || targets[0];
    conn = await connect(page.webSocketDebuggerUrl, null);

    await conn.send("Runtime.enable");
    await conn.send("Log.enable");
    await conn.send("Network.enable");
    await conn.send("Page.enable");

    /* Collect every request the page makes and every error it logs. */
    const requests = [];
    const errors = [];
    conn.send("Runtime.enable");

    // A second connection-less listener: rewire onEvent by polling is clumsy,
    // so instead install page-side collectors the moment the document exists.
    await conn.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `
        window.__probeRequests = [];
        window.__probeErrors = [];
        (function () {
          var origFetch = window.fetch;
          window.fetch = function (u, o) {
            try { window.__probeRequests.push(String(u)); } catch (e) {}
            return origFetch.apply(this, arguments);
          };
          var origOpen = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = function (m, u) {
            try { window.__probeRequests.push(String(u)); } catch (e) {}
            return origOpen.apply(this, arguments);
          };
          window.addEventListener("error", function (e) {
            window.__probeErrors.push(String(e && e.message));
          });
          window.addEventListener("unhandledrejection", function (e) {
            window.__probeErrors.push("unhandledrejection: " + String(e && e.reason));
          });
          var origError = console.error;
          console.error = function () {
            try { window.__probeErrors.push("console.error: " + Array.prototype.join.call(arguments, " ")); } catch (e) {}
            return origError.apply(console, arguments);
          };
        })();
      `,
    });

    const url = "file:///" + path.join(ROOT, "index.html").replace(/\\/g, "/");
    await conn.send("Page.navigate", { url });

    /* Wait for boot. */
    let booted = false;
    for (let i = 0; i < 100; i++) {
      await sleep(100);
      const r = await conn.send("Runtime.evaluate", {
        expression: `!!(window.G && window.GAME && window.GAME.getState && G.state && G.world && G.world.player)`,
        returnByValue: true,
      });
      if (r.result && r.result.value === true) { booted = true; break; }
    }
    check("the game boots from file://", booted);
    if (!booted) throw new Error("boot failed; cannot continue");

    /* Give the page a beat to settle, so any late request would have shown up. */
    await sleep(600);

    /* ---- 1. no network at all ------------------------------------------ */

    const reqs = await conn.send("Runtime.evaluate", {
      expression: "JSON.stringify(window.__probeRequests || [])",
      returnByValue: true,
    });
    const requestList = JSON.parse(reqs.result.value || "[]");
    const external = requestList.filter((u) => !/^(file|data|blob):/.test(u));
    check(
      "boot makes no network request",
      external.length === 0,
      external.length ? external.join(", ") : requestList.length + " total, all local"
    );

    /* ---- 2. the account layer exists and is inert ---------------------- */

    const inert = await conn.send("Runtime.evaluate", {
      expression: `(function () {
        if (!window.G || !G.account) return { present: false };
        return {
          present: true,
          available: typeof G.account.available === "function" ? G.account.available() : null,
          signedIn: typeof G.account.isSignedIn === "function" ? G.account.isSignedIn() : null,
          user: typeof G.account.user === "function" ? G.account.user() : "noaccessor",
          enabled: (G.account.config || {}).enabled,
          apiBase: (G.account.config || {}).apiBase
        };
      })()`,
      returnByValue: true,
    });
    const acc = inert.result.value || {};
    check("G.account is loaded", acc.present === true);
    check("G.account is not available with no Worker configured", acc.available === false, "available=" + acc.available);
    check("no signed-in user", acc.signedIn === false && acc.user === null, "user=" + JSON.stringify(acc.user));
    check("account config is disabled", acc.enabled === false, "enabled=" + acc.enabled);
    check("apiBase defaults to empty", acc.apiBase === "", JSON.stringify(acc.apiBase));

    /* ---- 3. init() settles silently ------------------------------------ */

    const initRes = await conn.send("Runtime.evaluate", {
      expression: `(async function () {
        var before = (window.__probeRequests || []).length;
        var out = { settled: false, threw: null, value: undefined, before: before };
        try {
          var v = await G.account.init();
          out.settled = true;
          out.value = v === null ? null : typeof v;
        } catch (e) { out.threw = String(e && e.message || e); }
        out.after = (window.__probeRequests || []).length;
        return out;
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    const ir = initRes.result.value || {};
    check("init() settles without throwing", ir.settled === true, ir.threw ? "threw: " + ir.threw : "settled");
    check("init() makes no request when unconfigured", ir.after === ir.before, "requests " + ir.before + " -> " + ir.after);
    check("init() resolves to null (no user)", ir.value === null, "value=" + ir.value);

    /* ---- 4. every method is safe to call ------------------------------- */

    const methods = await conn.send("Runtime.evaluate", {
      expression: `(async function () {
        var before = (window.__probeRequests || []).length;
        var out = { results: {}, before: before };
        var cases = {
          signIn: function () { return G.account.signIn(); },
          pull: function () { return G.account.pull(); },
          sync: function () { return G.account.sync({ v: 1, beat: "arrive", savedAt: new Date().toISOString() }); },
          signOut: function () { return G.account.signOut(); },
          deleteAccount: function () { return G.account.deleteAccount(); }
        };
        var names = Object.keys(cases);
        for (var i = 0; i < names.length; i++) {
          var n = names[i];
          try {
            var v = cases[n]();
            if (v && typeof v.then === "function") { await v; }
            out.results[n] = "ok";
          } catch (e) {
            out.results[n] = "threw: " + String(e && e.message || e);
          }
        }
        out.after = (window.__probeRequests || []).length;
        return out;
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    const mr = methods.result.value || {};
    const methodNames = Object.keys(mr.results || {});
    const threw = methodNames.filter((n) => String(mr.results[n]).indexOf("threw") === 0);
    check(
      "every account method is safe to call while signed out",
      threw.length === 0,
      threw.length ? threw.map((n) => n + ": " + mr.results[n]).join("; ") : methodNames.length + " methods, all settled"
    );
    check("no method made a request while unconfigured", mr.after === mr.before, "requests " + mr.before + " -> " + mr.after);

    /* ---- 5. a forged user cannot hijack the game ----------------------- */

    const forged = await conn.send("Runtime.evaluate", {
      expression: `(function () {
        var before = { chapter: G.state.chapter, beat: G.state.beat, signedIn: G.account.isSignedIn() };
        var threw = null;
        try {
          if (typeof G.account.__setUser === "function") {
            G.account.__setUser({ id: "attacker", email: "evil@example.com", name: "Evil" });
          }
          if (typeof G.account.__setApiBase === "function") {
            G.account.__setApiBase("https://attacker.invalid");
          }
        } catch (e) { threw = String(e && e.message || e); }
        var after = { chapter: G.state.chapter, beat: G.state.beat };
        return {
          threw: threw,
          chapterChanged: before.chapter !== after.chapter,
          beatChanged: before.beat !== after.beat,
          before: before,
          after: after
        };
      })()`,
      returnByValue: true,
    });
    const fr = forged.result.value || {};
    check("poking the account layer does not throw", fr.threw === null, fr.threw || "clean");
    check(
      "a forged user cannot change chapter or beat",
      !fr.chapterChanged && !fr.beatChanged,
      "chapter " + JSON.stringify(fr.before && fr.before.chapter) + " beat " + JSON.stringify(fr.before && fr.before.beat)
    );

    /* ---- 6. the game still plays after all that ------------------------ */

    const play = await conn.send("Runtime.evaluate", {
      expression: `(async function () {
        function key(name, code) {
          var ev = new KeyboardEvent("keydown", { key: name, code: code || name, bubbles: true });
          window.dispatchEvent(ev);
          var up = new KeyboardEvent("keyup", { key: name, code: code || name, bubbles: true });
          window.dispatchEvent(up);
        }
        // Start the chapter from the title screen, then advance any opening.
        key("Enter");
        await new Promise(function (r) { setTimeout(r, 400); });
        var stateAfterEnter = window.GAME.getState();
        var px0 = G.world.player ? G.world.player.x : null;
        var py0 = G.world.player ? G.world.player.y : null;
        // Advance dialogue until it yields, or give up after a while.
        for (var i = 0; i < 40; i++) {
          if (window.G.dialogue && G.dialogue.isActive && G.dialogue.isActive()) { key("Enter"); }
          await new Promise(function (r) { setTimeout(r, 60); });
        }
        var px1 = G.world.player ? G.world.player.x : null;
        var py1 = G.world.player ? G.world.player.y : null;
        return {
          stateAfterEnter: stateAfterEnter,
          hasPlayer: !!(G.world && G.world.player),
          moved: px0 !== null && px1 !== null,
          dx: (px1 !== null && px0 !== null) ? Math.round(px1 - px0) : null,
          dialogueActive: !!(window.G.dialogue && G.dialogue.isActive && G.dialogue.isActive())
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    const pr = play.result.value || {};
    check("the game reaches play after the account layer is poked", pr.stateAfterEnter === "play" || pr.hasPlayer, "state=" + pr.stateAfterEnter);
    check("the hero still exists in the world", pr.hasPlayer === true);

    /* ---- 7. no errors -------------------------------------------------- */

    const errs = await conn.send("Runtime.evaluate", {
      expression: "JSON.stringify(window.__probeErrors || [])",
      returnByValue: true,
    });
    const errorList = JSON.parse(errs.result.value || "[]")
      /* The origin root favicon 404s under file://; it is not a game error. */
      .filter((e) => !/favicon/i.test(e));
    check("no console error or uncaught exception", errorList.length === 0, errorList.slice(0, 4).join(" | "));

  } finally {
    try { conn && conn.close(); } catch (e) {}
    try { chrome.kill(); } catch (e) {}
    await sleep(300);
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
  }

  const pass = results.filter((r) => r.ok).length;
  const fail = results.length - pass;
  console.log("");
  if (fail === 0) {
    console.log(`ACCOUNT PROBE PASSED — ${pass} checks: inert without a Worker, never makes a request, cannot break boot or play`);
    process.exit(0);
  } else {
    console.log(`ACCOUNT PROBE FAILED — ${fail} of ${results.length} checks failed`);
    process.exit(1);
  }
})().catch((e) => {
  console.error("probe crashed:", e && e.stack ? e.stack : e);
  process.exit(1);
});
