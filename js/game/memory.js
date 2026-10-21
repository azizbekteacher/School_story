/* Persistent memory: writes the player's current position and progress to
   memory.md (and its script-tag twin memory.js) so a later version of the game
   can pick up exactly where the player left off.

   Three layers, in order of reliability:
     1. localStorage  — always on, instant, silent, per-browser.
     2. memory.js     — a classic <script> that sets window.G_MEMORY. This is
                        what makes resume work from a plain double-click on
                        file://, where fetch() is blocked by the browser.
     3. memory.md     — the human- and model-readable save. Written directly to
                        disk through the File System Access API once the player
                        grants the folder a single time; after that every save is
                        silent and memory.md is genuinely live.

   The markdown is the source of truth for humans; memory.js is the same data in
   the form the browser can actually read back without a server. */
window.G = window.G || {};

G.memory = (function () {
  var SAVE_VERSION = 1;
  var LS_KEY = "sulton.save.v1";
  var IDB_NAME = "sulton-save";
  var IDB_STORE = "handles";

  var dirHandle = null;      // FileSystemDirectoryHandle, if granted
  var lastSave = 0;          // ms timestamp of last successful save
  var lastError = null;
  var dirty = false;
  var installed = false;
  var playSeconds = 0;
  var pendingResume = null;  // save object loaded but not yet applied
  var mdCache = null;        // parsed memory.md, when it could be fetched

  /* ---------------------------------------------------------------- snapshot */

  function chapter() {
    return (G.state && G.state.chapter) || (G.data && G.data.chapter && G.data.chapter.id) || "ch1";
  }

  function playerPos() {
    var p = G.world && G.world.player;
    if (!p) return null;
    return {
      x: Math.round(p.x * 10) / 10,
      y: Math.round(p.y * 10) / 10,
      facing: p.facing || "down"
    };
  }

  function snapshot() {
    var s = {
      v: SAVE_VERSION,
      savedAt: new Date().toISOString(),
      chapter: chapter(),
      chapterTitle: (G.data && G.data.story && G.data.story.title) || "",
      beat: G.state.beat,
      position: playerPos(),
      zone: (G.world && G.world.getZone && G.world.getZone()) || null,
      objective: G.state.currentObjective(),
      trust: G.state.trust,
      trustLabel: G.state.trustLabel(),
      intel: G.state.intel.slice(),
      flags: G.state.flags,
      notes: G.state.notes,
      journal: G.state.journal,
      choicesMade: G.state.choicesMade.slice(),
      marks: G.state.marks,
      scores: G.state.scores,
      objectiveOverride: (function () {
        // currentObjective() already folds the override in; store it separately
        return G.state.snapshot().objectiveOverride;
      })(),
      started: G.state.started,
      finished: G.state.finished,
      playSeconds: Math.round(playSeconds),
      summary: G.state.scoreSummary(),
      avgQuality: Math.round(G.state.avgQuality() * 100) / 100
    };
    return s;
  }

  /* ---------------------------------------------------------------- markdown */

  function toMarkdown(s) {
    s = s || snapshot();
    var pos = s.position ? (Math.round(s.position.x) + ", " + Math.round(s.position.y)) : "—";
    var json = JSON.stringify(s, null, 2);

    var intelLines = s.intel && s.intel.length
      ? s.intel.map(function (id) {
          var lab = (G.data && G.data.learning && G.data.learning.intel && G.data.learning.intel[id] && G.data.learning.intel[id].label);
          return "- `" + id + "`" + (lab ? " — " + lab : "");
        }).join("\n")
      : "- _(hali hech narsa o'rganilmagan)_";

    var journalLines = s.journal && s.journal.length
      ? s.journal.map(function (j) { return "- " + (j.text || j); }).join("\n")
      : "- _(bo'sh)_";

    var choiceLines = s.choicesMade && s.choicesMade.length
      ? s.choicesMade.map(function (c) { return "`" + c + "`"; }).join(", ")
      : "_(hali tanlov qilinmagan)_";

    var scoreLines = "";
    if (s.scores) {
      var keys = Object.keys(s.scores);
      if (keys.length) {
        scoreLines = keys.map(function (k) {
          var sc = s.scores[k];
          var name = (G.data && G.data.learning && G.data.learning.principles && G.data.learning.principles[k] && G.data.learning.principles[k].name) || k;
          return "| `" + k + "` | " + name + " | " + (sc.good || 0) + " | " + (sc.bad || 0) + " |";
        }).join("\n");
      }
    }

    return [
      "# Game memory — " + (s.chapterTitle || s.chapter),
      "",
      "<!-- Written automatically by the game. Safe to read; edit the JSON block only",
      "     if you know what you are doing, and keep it valid JSON. -->",
      "",
      "**Saved:** " + s.savedAt + "  ",
      "**Chapter:** `" + s.chapter + "` — " + (s.chapterTitle || "") + "  ",
      "**Beat:** `" + s.beat + "`  ",
      "**Position:** " + pos + " px" + (s.zone ? " (zone: `" + s.zone + "`)" : "") + "  ",
      "**Objective:** " + (s.objective || "—") + "  ",
      "**Trust:** " + s.trust + "/10 — " + s.trustLabel + "  ",
      "**Playtime:** " + Math.floor((s.playSeconds || 0) / 60) + "m " + ((s.playSeconds || 0) % 60) + "s  ",
      "**Saved by:** `" + (s.savedBy || "game") + "`",
      "",
      "## Resume",
      "",
      "Open `index.html` and choose **Davom etish** (Continue). The game reads this",
      "file's JSON block, or `memory.js` if this file cannot be read.",
      "",
      "## What Azizbek knows",
      "",
      intelLines,
      "",
      "## Notebook",
      "",
      journalLines,
      "",
      "## Decisions made",
      "",
      choiceLines,
      "",
      scoreLines ? "## Principle scores\n\n| id | principle | good | bad |\n|---|---|---|---|\n" + scoreLines + "\n" : "",
      "## Raw save",
      "",
      "```json",
      json,
      "```",
      "",
      "---",
      "",
      "*Service is black and white. Hospitality is colour.*",
      ""
    ].join("\n");
  }

  /* Extract the first ```json fenced block. Tolerant of trailing prose. */
  function parseMarkdown(text) {
    if (!text || typeof text !== "string") return null;
    var m = /```json\s*([\s\S]*?)```/i.exec(text);
    if (!m) return null;
    try {
      return JSON.parse(m[1]);
    } catch (e) {
      lastError = "memory.md JSON not parseable: " + e.message;
      return null;
    }
  }

  /* ------------------------------------------------------------- idb handles */

  function idb() {
    return new Promise(function (res, rej) {
      if (!window.indexedDB) { rej(new Error("no indexedDB")); return; }
      var r = indexedDB.open(IDB_NAME, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore(IDB_STORE); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function idbSet(k, v) {
    return idb().then(function (db) {
      return new Promise(function (res, rej) {
        var tx = db.transaction(IDB_STORE, "readwrite");
        tx.objectStore(IDB_STORE).put(v, k);
        tx.oncomplete = function () { res(true); };
        tx.onerror = function () { rej(tx.error); };
      });
    });
  }
  function idbGet(k) {
    return idb().then(function (db) {
      return new Promise(function (res, rej) {
        var tx = db.transaction(IDB_STORE, "readonly");
        var q = tx.objectStore(IDB_STORE).get(k);
        q.onsuccess = function () { res(q.result); };
        q.onerror = function () { rej(q.error); };
      });
    });
  }

  /* ------------------------------------------------------------- file writing */

  function supported() {
    return typeof window.showDirectoryPicker === "function";
  }

  /* Ask the player once for the game folder. Chromium keeps the grant, so all
     later saves are silent. */
  function attachFolder() {
    if (!supported()) {
      return Promise.resolve({ ok: false, reason: "Bu brauzer faylga yozishni qo'llamaydi (Chrome kerak)." });
    }
    return window.showDirectoryPicker({ id: "sulton-save", mode: "readwrite" })
      .then(function (dir) {
        dirHandle = dir;
        return idbSet("dir", dir).catch(function () {}).then(function () {
          return writeFiles(snapshot()).then(function () {
            return { ok: true, name: dir.name };
          });
        });
      })
      .catch(function (e) {
        if (e && e.name === "AbortError") return { ok: false, reason: "Bekor qilindi." };
        return { ok: false, reason: String(e && e.message || e) };
      });
  }

  function detachFolder() {
    dirHandle = null;
    return idbSet("dir", null).catch(function () {}).then(function () {
      return { ok: true };
    });
  }

  /* Restore a previously granted folder handle (if permission survived). */
  function restoreFolder() {
    return idbGet("dir").then(function (dir) {
      if (!dir || !dir.queryPermission) return false;
      return dir.queryPermission({ mode: "readwrite" }).then(function (p) {
        if (p === "granted") { dirHandle = dir; return true; }
        // needs a gesture; keep the handle but leave it unusable until then
        dirHandle = dir;
        return false;
      });
    }).catch(function () { return false; });
  }

  function writeOne(dir, name, text) {
    return dir.getFileHandle(name, { create: true }).then(function (fh) {
      return fh.createWritable();
    }).then(function (w) {
      return w.write(text).then(function () { return w.close(); });
    });
  }

  function writeFiles(s) {
    if (!dirHandle) return Promise.resolve(false);
    var md = toMarkdown(s);
    var js = "/* Auto-generated alongside memory.md — do not edit by hand.\n" +
             "   Loaded as a plain script so the game can resume from file:// without a server. */\n" +
             "window.G = window.G || {};\nwindow.G_MEMORY = " + JSON.stringify(s, null, 2) + ";\n";
    return writeOne(dirHandle, "memory.md", md)
      .then(function () { return writeOne(dirHandle, "memory.js", js); })
      .then(function () { return true; })
      .catch(function (e) { lastError = "fayl yozilmadi: " + (e && e.message); return false; });
  }

  /* ---------------------------------------------------------------- save / load */

  function saveLocal(s, by) {
    try {
      var copy = JSON.parse(JSON.stringify(s));
      copy.savedBy = by || "game";
      localStorage.setItem(LS_KEY, JSON.stringify(copy));
      return true;
    } catch (e) {
      lastError = "localStorage: " + (e && e.message);
      return false;
    }
  }

  /* Save now. `by` records what triggered it, for the markdown header. */
  function saveNow(by) {
    var s = snapshot();
    s.savedBy = by || "game";
    saveLocal(s, by);
    lastSave = Date.now();
    dirty = false;
    // fire-and-forget the disk write so gameplay never stalls
    if (dirHandle) writeFiles(s).catch(function () {});
    return s;
  }

  function autosave(by) {
    dirty = true;
    saveNow(by || "auto");
  }

  function load() {
    // 1. memory.js, written next to index.html. This is the path that works from
    //    a plain double-click, because classic scripts are not CORS-restricted.
    if (window.G_MEMORY && window.G_MEMORY.v) return window.G_MEMORY;

    // 2. memory.md, when the page is served over http and can be fetched. Its
    //    fenced JSON block is the same save, so the markdown is authoritative
    //    wherever the browser is allowed to read it.
    if (mdCache) return mdCache;
    if (location.protocol === "http:" || location.protocol === "https:") {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "memory.md", false);   // sync: load() is called during boot
        xhr.send(null);
        if (xhr.status === 200) {
          var parsed = parseMarkdown(xhr.responseText);
          if (parsed && parsed.v) { mdCache = parsed; return parsed; }
        }
      } catch (e) { /* not available; fall through */ }
    }

    // 3. localStorage — most recent, but scoped to this browser and origin
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) {
        var o = JSON.parse(raw);
        if (o && o.v) return o;
      }
    } catch (e) { lastError = "localStorage read: " + (e && e.message); }

    return null;
  }

  function hasSave() { return !!load(); }

  function clear() {
    try { localStorage.removeItem(LS_KEY); } catch (e) {}
    pendingResume = null;
    return true;
  }

  /* Apply a loaded save to the live game. Returns a report of what happened. */
  function apply(s) {
    if (!s) return { ok: false, reason: "saqlangan o'yin topilmadi" };
    var bad = G.state.restore(s);
    if (s.position && G.world && G.world.setPlayerPos) {
      G.world.setPlayerPos(s.position.x, s.position.y);
      if (G.world.player && s.position.facing) G.world.player.facing = s.position.facing;
    }
    if (s.playSeconds) playSeconds = s.playSeconds;
    lastError = null;
    return { ok: true, rejected: bad, beat: G.state.beat, trust: G.state.trust };
  }

  /* ---------------------------------------------------------------- install */

  function install() {
    if (installed) return;
    installed = true;
    restoreFolder().catch(function () {});

    // playtime accrual (called from the game loop)
    var t0 = Date.now();
    G.memory.tickPlaytime = function () {
      var now = Date.now();
      playSeconds += (now - t0) / 1000;
      t0 = now;
      // debounced autosave: at most once every 3s, only if something changed
      if (dirty && now - lastSave > 3000) saveNow("auto");
    };

    // save on the way out
    window.addEventListener("beforeunload", function () { saveNow("exit"); });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) saveNow("hidden");
    });

    // resuming the folder grant needs a user gesture
    document.addEventListener("pointerdown", function once() {
      document.removeEventListener("pointerdown", once);
      if (dirHandle && dirHandle.queryPermission) {
        dirHandle.queryPermission({ mode: "readwrite" }).then(function (p) {
          if (p === "prompt") dirHandle.requestPermission({ mode: "readwrite" }).catch(function () {});
        }).catch(function () {});
      }
    });
  }

  function status() {
    return {
      hasSave: hasSave(),
      folder: dirHandle ? (dirHandle.name || "(granted)") : null,
      fileWrites: !!dirHandle,
      lastSave: lastSave ? new Date(lastSave).toISOString() : null,
      supportsFileAccess: supported(),
      lastError: lastError,
      playSeconds: Math.round(playSeconds)
    };
  }

  return {
    snapshot: snapshot,
    toMarkdown: toMarkdown,
    parseMarkdown: parseMarkdown,
    saveNow: saveNow,
    autosave: autosave,
    load: load,
    hasSave: hasSave,
    apply: apply,
    clear: clear,
    install: install,
    attachFolder: attachFolder,
    detachFolder: detachFolder,
    supported: supported,
    status: status,
    get lastError() { return lastError; },
    get pendingResume() { return pendingResume; },
    set pendingResume(v) { pendingResume = v; },
    tickPlaytime: function () {}
  };
})();
