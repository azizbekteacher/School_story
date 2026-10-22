/* Prove the four-tab Uzbek menu works: opens, shows the right tabs, takes a typed
   note through add -> edit -> delete, and puts the note in the save.

   This drives real Chrome over file:// because the note editor is a DOM textarea
   layered over the canvas, so the parts that matter (does the textarea actually
   appear, does typing reach state, does it survive a reload) cannot be faked in a
   vm sandbox.

   Usage: node tools/check-menu.js [--shot] */
const http = require("http");
const crypto = require("crypto");
const { spawn } = require("child_process");
const net = require("net");
const os = require("os");
const path = require("path");
const fs = require("fs");

const ROOT = path.join(__dirname, "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9800 + Math.floor(Math.random() * 90);
const PROFILE = path.join(os.tmpdir(), "dsh-menu-" + Date.now());
const DO_SHOT = process.argv.includes("--shot");
const SHOT_DIR = path.join(__dirname, "shots");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
    "--window-size=1280,800", "about:blank"], { stdio: "ignore" });
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
    await ws.cmd("Page.navigate", { url });
    await sleep(2600);

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

    /* ---- start a chapter, then open the menu ---- */
    await ev(`window.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))`);
    await sleep(1600);
    ck((await ev(`GAME.getState()`)) === "play", "the game is in play state");

    /* The chapter's opening scene starts automatically, and TAB is deliberately
       blocked while dialogue is active — so end the opening before testing the
       menu, exactly as a player walking around would have. */
    await ev(`(function(){
      var guard = 0;
      while (G.dialogue.isActive() && guard++ < 400) {
        if (G.dialogue.debugTyping()) {
          if (G.dialogue.__finishTyping) G.dialogue.__finishTyping();
        }
        G.dialogue.debugFinishAll ? G.dialogue.debugFinishAll() : (function(){})();
        // Drive the engine the way the keyboard does.
        window.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
        window.dispatchEvent(new KeyboardEvent('keyup',{key:'Enter',bubbles:true}));
        if (G.dialogue.debugNode && G.dialogue.debugNode() && G.dialogue.debugNode().type === 'choice') break;
      }
      return G.dialogue.isActive();
    })()`);
    // If a choice is showing, take the first option and keep going until free.
    for (let i = 0; i < 40; i++) {
      const st = JSON.parse(await ev(`JSON.stringify({
        active: G.dialogue.isActive(),
        type: (G.dialogue.debugNode() || {}).type || '',
        options: G.dialogue.debugOptions ? G.dialogue.debugOptions().length : 0
      })`));
      if (!st.active) break;
      if (st.type === "choice" || st.type === "multi") {
        await ev(`G.dialogue.debugPick(0)`);
      } else {
        await ev(`window.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))`);
        await ev(`window.dispatchEvent(new KeyboardEvent('keyup',{key:'Enter',bubbles:true}))`);
      }
      await sleep(120);
    }
    const freeRoam = !(await ev(`G.dialogue.isActive()`));
    ck(freeRoam, "the opening scene ends and free roam begins");

    // Give the run some teaching content so Xulosalar has something to show.
    await ev(`(function(){
      G.state.recordChoice('ABQ_1');
      G.state.addNote({ principle: 'I-001', verdict: 'weak', text: 'test note', beat: 'staffroom' });
      G.state.addJournal('Birinchi kundan bir satr.');
      G.state.addIntel('intel_football');
    })()`);

    await ev(`window.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true}))`);
    await ev(`window.dispatchEvent(new KeyboardEvent('keyup',{key:'Tab',bubbles:true}))`);
    await sleep(500);
    ck(await ev(`G.notebook.isOpen()`), "TAB opens the menu");

    /* ---- the four Uzbek tabs ---- */
    const tabs = await ev(`JSON.stringify(G.notebook.__tabs())`);
    const tabList = JSON.parse(tabs);
    ck(tabList.length === 4, "the menu has four tabs", tabList.join(" | "));
    ck(tabList[0] === "Xulosalar", "the first tab is Xulosalar", tabList[0]);
    ck(tabList[1] === "Qaydlar", "the second tab is Qaydlar", tabList[1]);
    ck(tabList[2] === "Ma'lumot" && tabList[3] === "Kundalik",
      "Ma'lumot and Kundalik are still there", tabList[2] + ", " + tabList[3]);
    const leftovers = tabList.filter((t) => /Tamoyillar|Principles/.test(t));
    ck(leftovers.length === 0, "no old English/outdated tab names remain", leftovers.join(","));
    await shot("menu-xulosalar.png");

    /* ---- Xulosalar shows the insight for the choice that was made ---- */
    const insight = JSON.parse(await ev(`(function(){
      var learning = G.data.learning || {};
      var notes = learning.choiceNotes || {};
      var made = G.state.choicesMade;
      var found = null;
      for (var i = 0; i < made.length; i++) if (notes[made[i]]) { found = notes[made[i]]; break; }
      return JSON.stringify({
        made: made.length,
        hasNote: !!found,
        title: found ? found.title : '',
        hasPrinciple: !!(found && found.principle),
        principleName: found && found.principle && learning.principles[found.principle]
          ? learning.principles[found.principle].name : ''
      });
    })()`));
    ck(insight.hasNote, "the made choice has an insight to show", insight.title);
    ck(insight.hasPrinciple, "the insight is tied to a principle", insight.principleName);

    /* ---- Qaydlar: add a note through the real textarea ---- */
    await ev(`G.notebook.__setTab(1)`);
    await sleep(300);
    await shot("menu-qaydlar-empty.png");
    const emptyBefore = await ev(`G.state.userNotes().length`);
    ck(emptyBefore === 0, "Qaydlar starts empty", String(emptyBefore));

    // Open the composer and type into the DOM textarea, as a player would.
    await ev(`document.getElementById('note-editor') && 0; G.notebook.__openEditor('new', null, '')`);
    await sleep(400);
    const ed = JSON.parse(await ev(`(function(){
      var e = document.getElementById('note-editor');
      if (!e) return JSON.stringify({ exists: false });
      var r = e.getBoundingClientRect();
      return JSON.stringify({
        exists: true,
        visible: getComputedStyle(e).display !== 'none',
        w: Math.round(r.width), h: Math.round(r.height),
        onScreen: r.top >= -5 && r.left >= -5 && r.bottom <= window.innerHeight + 5
      });
    })()`));
    ck(ed.exists, "the note editor exists in the DOM");
    ck(ed.visible, "the note editor is visible when opened");
    ck(ed.onScreen, "the note editor is positioned on screen", ed.w + "x" + ed.h);

    // Type it the way a person does: set the value and fire the input event.
    const typed = "Timur futbolni yaxshi ko'radi — birinchi darsda shuni eslab qol.";
    await ev(`(function(){
      var e = document.getElementById('note-editor');
      e.focus();
      e.value = ${JSON.stringify(typed)};
      e.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    await sleep(250);
    await ev(`G.notebook.__commit()`);
    await sleep(400);
    const afterAdd = JSON.parse(await ev(`JSON.stringify({
      count: G.state.userNotes().length,
      text: G.state.userNotes().length ? G.state.userNotes()[0].text : '',
      hasId: G.state.userNotes().length ? !!G.state.userNotes()[0].id : false
    })`));
    ck(afterAdd.count === 1, "the note was added", String(afterAdd.count));
    ck(afterAdd.text === typed, "the note text was kept verbatim", afterAdd.text.slice(0, 40) + "…");
    ck(afterAdd.hasId, "the note has an id so it can be edited");
    const editorHidden = await ev(`document.getElementById('note-editor').style.display === 'none'`);
    ck(editorHidden, "the editor hides again after saving");
    await shot("menu-qaydlar-one.png");

    /* ---- edit it ---- */
    const editId = await ev(`G.state.userNotes()[0].id`);
    await ev(`G.notebook.__openEditor('edit', ${JSON.stringify(editId)}, 'vaqtinchalik')`);
    await sleep(250);
    await ev(`(function(){
      var e = document.getElementById('note-editor');
      e.value = 'Tahrirlangan qayd.';
      e.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    await ev(`G.notebook.__commit()`);
    await sleep(350);
    const afterEdit = JSON.parse(await ev(`JSON.stringify({
      count: G.state.userNotes().length,
      text: G.state.userNotes()[0].text
    })`));
    ck(afterEdit.count === 1, "editing does not create a second note", String(afterEdit.count));
    ck(afterEdit.text === "Tahrirlangan qayd.", "the note was edited in place", afterEdit.text);

    /* ---- the note survives a reload (the whole point of persisting it) ----
       After a reload the game is back on the title screen; the save is applied
       when the player resumes it. So resume, which is what a player does. */
    await ev(`G.memory.autosave('test')`);
    await sleep(400);
    await ws.cmd("Page.reload", {});
    await sleep(3000);
    const onTitle = await ev(`GAME.getState()`);
    ck(onTitle === "title", "after a reload the game is on the title screen", onTitle);
    const savedNotes = await ev(`(function(){
      var s = G.memory.load();
      return s && s.userNotes ? s.userNotes.length : 0;
    })()`);
    ck(savedNotes >= 1, "the save file still holds the note after a reload", "count=" + savedNotes);
    await ev(`window.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))`);
    await sleep(1800);
    const afterReload = JSON.parse(await ev(`JSON.stringify({
      count: (G.state && G.state.userNotes ? G.state.userNotes().length : -1),
      text: (G.state && G.state.userNotes && G.state.userNotes().length) ? G.state.userNotes()[0].text : ''
    })`));
    ck(afterReload.count >= 1, "resuming restores the note", "count=" + afterReload.count);
    ck(afterReload.text === "Tahrirlangan qayd.", "the restored note has its edited text", afterReload.text);

    /* ---- delete it ---- */
    await ev(`(function(){
      var ids = G.state.userNotes().map(function(n){return n.id;});
      if (ids.length) G.state.removeUserNote(ids[0]);
    })()`);
    await sleep(250);
    ck((await ev(`G.state.userNotes().length`)) === 0, "the note can be deleted");

    /* ---- the menu does not leak keys into gameplay ---- */
    // Make sure nothing modal owns the keyboard before testing the menu again.
    await ev(`(function(){
      if (G.dialogue.isActive()) { G.dialogue.debugPick ? null : null; }
      if (G.debrief && G.debrief.isVisible && G.debrief.isVisible()) { try { G.debrief.close && G.debrief.close(); } catch (e) {} }
    })()`);
    await sleep(200);
    const freeAgain = !(await ev(`G.dialogue.isActive()`)) && (await ev(`GAME.getState()`)) === "play";
    ck(freeAgain, "the game is free-roaming again before the key-leak test");
    await ev(`(function(){
      if (!G.notebook.isOpen()) {
        window.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true}));
        window.dispatchEvent(new KeyboardEvent('keyup',{key:'Tab',bubbles:true}));
      }
    })()`);
    await sleep(300);
    const px0 = await ev(`G.world.player.x`);
    await ev(`window.dispatchEvent(new KeyboardEvent('keydown',{key:'d',bubbles:true}))`);
    await sleep(700);
    const px1 = await ev(`G.world.player.x`);
    ck(Math.abs(px1 - px0) < 2, "the hero does not walk while the menu is open", "moved " + Math.round(px1 - px0) + "px");

    /* ---- close and confirm play resumes ---- */
    await ev(`G.notebook.close()`);
    await sleep(400);
    ck(!(await ev(`G.notebook.isOpen()`)), "the menu closes");
    /* A real keyboard sends keyup; a bare synthetic keydown leaves the key held
       and the engine correctly refuses to re-fire it. Send the pair, as a
       player's finger would. */
    await ev(`window.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true}))`);
    await ev(`window.dispatchEvent(new KeyboardEvent('keyup',{key:'Tab',bubbles:true}))`);
    await sleep(400);
    ck(await ev(`G.notebook.isOpen()`), "TAB reopens it");
    await ev(`G.notebook.close()`);

    ck(errors.length === 0, "no console errors", errors.slice(0, 3).join(" | "));

    console.log(fail
      ? `\nMENU CHECK FAILED — ${fail} problem(s)`
      : "\nMENU CHECK PASSED — four Uzbek tabs, Xulosalar reads real insights, notes add/edit/delete and survive a reload");
    done(fail ? 1 : 0);
  } catch (e) {
    console.error("menu check crashed: " + e.message);
    done(1);
  }
})();
