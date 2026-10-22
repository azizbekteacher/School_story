/* Boot, title screen, main loop, screen-state machine. */
window.G = window.G || {};

(function () {
  var W = 960, H = 600;
  var canvas, ctx;
  var lastTime = 0;
  var state = "title";        // title | play | debrief
  var titleChapter = 0;       // which chapter is highlighted on the title
  var titleResume = null;     // the save offered as "continue", if any
  var titleT = 0;
  var bootT = 0;
  var fadeAlpha = 1;
  var fadeDir = -1;
  var pendingState = null;
  var storyLoaded = false;
  var showHelp = false;
  var pendingRemoteSave = null;   // a newer cloud save waiting to be loaded

  function boot() {
    G.memory.install();
    // open the title on whichever chapter the save belongs to
    var bootSave = G.memory.load();
    if (bootSave && bootSave.chapter) titleChapter = G.chapters.indexOf(bootSave.chapter);
    canvas = document.getElementById("game");
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;

    G.input.init(canvas);
    // Touch controls are opt-in by device: on a desktop this is a no-op and the
    // d-pad stays hidden. Guarded because touch.js must never be able to stop
    // the game booting.
    if (G.touch && G.touch.install) {
      try { G.touch.install(); } catch (e) { console.warn("touch install failed", e); }
    }
    G.map.build();

    if (G.data && G.data.story) {
      storyLoaded = true;
    } else {
      console.error("story.js missing");
    }

    bindFirstGesture();
    initAccount();
    requestAnimationFrame(loop);
  }

  /* Account init is deliberately fire-and-forget: boot must not wait on the
     network, and with no Worker configured G.account settles instantly. A game
     played from file:// with no connection does not notice this code exists. */
  function initAccount() {
    if (!G.account || !G.account.init) return;
    try {
      G.account.init().then(function (u) {
        if (u) {
          if (G.quest && G.quest.showToast) {
            G.quest.showToast("Hisob: " + (u.name || u.email || "ulandi"), "good");
          }
          offerRemoteSave();
        }
      }, function () { /* never let auth break the boot */ });
    } catch (e) {
      console.warn("account init failed", e);
    }
  }

  /* Debounced cloud push, so a burst of state changes becomes one request.
     Signed out, or with no Worker, this is a no-op. */
  var cloudTimer = null;
  function cloudSyncSoon() {
    if (!G.account || !G.account.isSignedIn || !G.account.isSignedIn()) return;
    if (cloudTimer) return;
    cloudTimer = setTimeout(function () {
      cloudTimer = null;
      try {
        var snap = G.memory.snapshot();
        if (snap) G.account.sync(snap);
      } catch (e) { /* a failed sync is not a problem the player needs */ }
    }, 4000);
  }

  /* Compare the cloud save with the local one and, if the cloud copy is newer,
     ask before replacing local progress — never silently. The loser is kept:
     a device whose clock is wrong must not be able to delete real progress. */
  function offerRemoteSave() {
    if (!G.account || !G.account.pull) return;
    G.account.pull().then(function (remote) {
      if (!remote || !remote.save) return;
      var local = G.memory.load();
      var remoteAt = Date.parse(remote.updatedAt || remote.save.savedAt || "") || 0;
      var localAt = Date.parse((local && local.savedAt) || "") || 0;
      if (!local || remoteAt > localAt + 60000) {
        pendingRemoteSave = remote.save;
        if (G.quest && G.quest.showToast) {
          G.quest.showToast("Bulutda yangiroq saqlangan o'yin bor — TAB orqali yuklang", "info");
        }
      } else if (local && localAt > remoteAt + 60000) {
        // local is ahead: push it so the account is up to date
        G.account.sync(local);
      }
    }, function () { /* offline is normal */ });
  }

  function bindFirstGesture() {
    var once = function () {
      G.audio.resume();
      window.removeEventListener("keydown", once);
      window.removeEventListener("mousedown", once);
      window.removeEventListener("touchstart", once);
    };
    window.addEventListener("keydown", once);
    window.addEventListener("mousedown", once);
    window.addEventListener("touchstart", once);
  }

  /* Start a chapter. `resume` is a save object from G.memory, or null for a
     fresh run. Resuming restores state and drops the player where they stood;
     scenes are re-enterable, so an interrupted scene simply replays. */
  function startGame(resume, chapterId) {
    // Which chapter: an explicit request wins, then the save, then chapter 1.
    var wantId = chapterId || (resume && resume.chapter) || "ch1";
    var ch = G.chapters ? G.chapters.activate(wantId) : null;
    if (!ch) {
      // no registry loaded: fall back to the single-story behaviour
      ch = { id: "ch1", firstBeat: "arrive", startZone: "street", startAnchor: 0,
             title: (G.data.story || {}).title || "" };
      if (G.data.story) { /* story is already G.data.story */ }
    }

    G.state.reset();
    G.state.chapter = ch.id;
    // reset() parks the beat at chapter 1's opening; move it to this chapter's
    // first beat so objectives, NPC routing and triggers are correct at once.
    G.state.setBeat(ch.firstBeat);

    G.quest.reset();
    G.world.init();
    G.state.started = true;
    if (G.state.onChange) G.state.onChange(function () {
      G.memory.autosave("state");
      cloudSyncSoon();
    });

    var story = G.data.story;
    if (story && story.npcs) G.world.setNpcs(story.npcs);

    // Chapters after the first spawn at their own anchor. Chapter 1 keeps
    // world.init()'s original spawn and camera, exactly as it always was.
    if (ch.id !== "ch1") {
      var spawn = G.map.anchor(ch.startZone, ch.startAnchor);
      G.world.setPlayerPos(spawn.x, spawn.y);
      G.world.cam.x = spawn.x - W / 2;
      G.world.cam.y = spawn.y - H / 2;
    }

    state = "play";
    G.dialogueActive = false;

    if (resume) {
      var rep = G.memory.apply(resume);
      if (rep.ok) {
        // restore the saved position over the chapter spawn, and follow it
        if (G.world.cam && resume.position) {
          G.world.setPlayerPos(resume.position.x, resume.position.y);
          G.world.cam.x = resume.position.x - W / 2;
          G.world.cam.y = resume.position.y - H / 2;
        }
        G.quest.showToast("Davom etamiz — " + (resume.objective || "yuklanmoqda"), "info");
        if (rep.rejected && rep.rejected.length) {
          console.warn("memory: rejected fields", rep.rejected);
        }
        return;
      }
    }

    G.memory.autosave("start");

    // opening scene if provided
    if (story && story.opening) {
      G.dialogue.startScene(story.opening, {
        onEnd: function () { G.quest.showToast("Bugun birinchi kuningiz. Omad!", "info"); }
      });
    } else {
      G.quest.showToast("Bugun birinchi kuningiz. Omad!", "info");
    }
  }

  function loop(now) {
    var dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0.016;
    lastTime = now;

    try {
      update(dt);
      draw(dt);
    } catch (e) {
      console.error("loop error", e);
    }

    G.input.endFrame();
    requestAnimationFrame(loop);
  }

  function update(dt) {
    bootT += dt;

    if (fadeAlpha > 0 || fadeDir !== 0) {
      fadeAlpha += fadeDir * dt * 2.6;
      if (fadeAlpha <= 0) { fadeAlpha = 0; fadeDir = 0; }
      if (fadeAlpha >= 1) {
        fadeAlpha = 1;
        if (pendingState) { var p = pendingState; pendingState = null; p(); }
        fadeDir = -1;
      }
    }

    if (state === "title") {
      titleT += dt;
      var saved = G.memory.load();
      var chs = G.chapters.list();

      // choose a chapter: left/right arrows, or the number keys
      var moved = 0;
      if (G.input.wasPressed("arrowleft")) { G.input.consume("arrowleft"); moved = -1; }
      if (G.input.wasPressed("arrowright")) { G.input.consume("arrowright"); moved = 1; }
      if (moved) { titleChapter = (titleChapter + moved + chs.length) % chs.length; G.audio.tick(); }
      for (var ci = 0; ci < chs.length && ci < 9; ci++) {
        if (G.input.wasPressed(String(ci + 1))) {
          G.input.consume(String(ci + 1));
          titleChapter = ci; G.audio.select();
        }
      }

      var sel = chs[titleChapter] || chs[0];
      // a save only counts as "continue" when it belongs to this chapter
      var resumable = (saved && sel && saved.chapter === sel.id) ? saved : null;
      titleResume = resumable;

      if (sel && sel.status !== "ready") {
        // chapter data missing: refuse rather than start a broken mission
        if (G.input.wasPressed("enter") || G.input.wasPressed("space")) {
          G.input.consume("enter"); G.input.consume("space");
          G.audio.bad();
        }
        return;
      }

      if (G.input.wasPressed("enter") || G.input.wasPressed("space")) {
        G.input.consume("enter"); G.input.consume("space");
        G.audio.select();
        pendingState = function () { var r = titleResume; startGame(r, sel.id); };
        fadeDir = 1;
      }
      // N — start the selected chapter over, discarding its save
      if (resumable && G.input.wasPressed("n")) {
        G.input.consume("n");
        G.memory.clear();
        titleResume = null;
        G.audio.bad();
        pendingState = function () { startGame(null, sel.id); };
        fadeDir = 1;
      }
      return;
    }

    if (state === "play") {
      // memory: accrue playtime, flush periodically, honour M / F
      G.memory.tickPlaytime();
      if (G.input.wasPressed("m")) {
        G.input.consume("m");
        G.memory.autosave("manual");
        var mst = G.memory.status();
        if (mst.fileWrites) G.quest.showToast("Saqlandi \u2192 memory.md va memory.js", "good");
        else if (mst.supportsFileAccess) G.quest.showToast("Saqlandi. Faylga yozish uchun F", "info");
        else G.quest.showToast("Saqlandi (brauzer xotirasida)", "info");
      }
      if (G.input.wasPressed("f")) {
        G.input.consume("f");
        G.memory.attachFolder().then(function (r) {
          if (r.ok) G.quest.showToast("memory.md endi avtomatik yoziladi \u2192 " + r.name, "good");
          else G.quest.showToast(r.reason || "Fayl tanlanmadi", "info");
        });
      }
      // the mission ended: hand over to the debrief and stop simulating the
      // world this frame, so the player cannot take one more step into it
      if (G.debrief.isVisible()) { state = "debrief"; return; }

      // MENYU opens the read-only overview. Checked before the overlays so the
      // button is never stolen by a dialogue hit-test, and guarded by
      // menuButtonVisible() so it cannot fire while something modal owns input.
      if (menuButtonVisible() && G.input.mouse.clicked && menuButtonHit()) {
        if (G.debrief.openOverview()) {
          G.audio.select();
          return;
        }
      }
      // Ctrl/Cmd-free keyboard route: Escape also opens it while free-roaming,
      // The notebook is checked before anything else that reads Escape, because
      // while the player is typing a note the textarea must own the keyboard.
      if (G.notebook.isOpen()) {
        G.notebook.update(dt);
        return;
      }

      // since nothing else claims Escape in the play state.
      if (menuButtonVisible() && G.input.wasPressed("escape")) {
        G.input.consume("escape");
        if (G.debrief.openOverview()) { G.audio.select(); return; }
      }

      if (G.minigameHost.isActive()) {
        G.minigameHost.update(dt);
        return;
      }

      if (G.dialogue.isActive()) {
        G.dialogue.update(dt);
        G.dialogue.handleInput();
        G.world.tick(dt * 0.15);      // world breathes but player frozen
        return;
      }

      // tab opens notebook
      if (G.input.wasPressed("tab")) {
        G.input.consume("tab");
        G.notebook.toggle();
        return;
      }

      G.quest.update(dt);
      G.world.tick(dt);

      if (G.debrief.isVisible()) { state = "debrief"; }
      return;
    }

    if (state === "debrief") {
      G.debrief.update(dt);
      // The overview is closeable, so leaving it must return to play. The final
      // debrief is terminal — it has no close control, so this can never fire
      // for it.
      if (!G.debrief.isVisible()) { state = "play"; }
      return;
    }
  }

  function draw(dt) {
    ctx.clearRect(0, 0, W, H);

    if (state === "title") {
      drawTitle();
    } else {
      // world
      G.world.draw(ctx);

      // dim while in dialogue handled by dialogue itself
      G.quest.drawHud(ctx);

      if (G.dialogue.isActive()) G.dialogue.draw(ctx);
      if (G.minigameHost.isActive()) G.minigameHost.draw(ctx);
      if (G.notebook.isOpen()) G.notebook.draw(ctx);
      if (G.debrief.isVisible()) G.debrief.draw(ctx);

      // objective tick overlay when free
      if (!G.dialogue.isActive() && !G.minigameHost.isActive() &&
          !G.notebook.isOpen() && !G.debrief.isVisible()) {
        drawMenuButton();
        drawControlHint();
      }
    }

    G.render.vignette(ctx);

    if (fadeAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = fadeAlpha;
      ctx.fillStyle = "#332c25";
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }

  function drawControlHint() {
    ctx.save();
    ctx.globalAlpha = 0.32;
    ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#f4ece0";
    ctx.textAlign = "right";
    ctx.fillText("WASD — yurish · E — gaplash · TAB — daftar · C — nusxa · M — saqlash", W - 20, H - 16);
    ctx.restore();
  }

  /* ---- MENYU -------------------------------------------------------------
     A button in the top-left, under the objective and trust column, that opens
     the debrief panel in read-only "overview" mode at any point in a chapter —
     the same four tabs the player sees at the end, without ending the mission.
     From there the coaching menu (Xulosalar / Qaydlar / …) is one tap away. */
  var MENU_BTN = { x: 20, y: 116, w: 96, h: 30 };

  function menuButtonVisible() {
    return state === "play" && !G.dialogue.isActive() && !G.minigameHost.isActive() &&
      !G.notebook.isOpen() && !G.debrief.isVisible();
  }

  function drawMenuButton() {
    if (!menuButtonVisible()) return;
    var b = MENU_BTN;
    var hover = G.util.pointInRect(G.input.mouse.x, G.input.mouse.y, b);
    ctx.save();
    G.util.roundRect(ctx, b.x, b.y, b.w, b.h, 8);
    ctx.fillStyle = hover ? "rgba(217,164,76,.28)" : "rgba(68,58,47,.85)";
    ctx.fill();
    ctx.strokeStyle = hover ? "rgba(232,196,128,.9)" : "rgba(232,196,128,.45)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.font = "bold 12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#f2dfae";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("MENYU", b.x + b.w / 2, b.y + b.h / 2 + 0.5);
    ctx.restore();
  }

  function menuButtonHit() {
    var b = MENU_BTN;
    return G.util.pointInRect(G.input.mouse.x, G.input.mouse.y, b);
  }

  function drawTitle() {
    var t = titleT;
    var chs = G.chapters.list();
    var sel = chs[titleChapter] || chs[0];
    var sv = G.memory.load();

    // daylight backdrop — warm, not the old dusk
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#8d8271");
    g.addColorStop(0.45, "#6f6453");
    g.addColorStop(1, "#52483c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // low sun
    var rg = ctx.createRadialGradient(W * 0.5, H * 0.28, 20, W * 0.5, H * 0.28, 470);
    rg.addColorStop(0, "rgba(255,230,176,.24)");
    rg.addColorStop(1, "rgba(255,230,176,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);

    // drifting dust
    for (var i = 0; i < 46; i++) {
      var seed = G.util.hash(i * 13.7);
      var x = ((seed * W + t * (8 + seed * 16)) % (W + 60)) - 30;
      var y = (G.util.hash(i * 7.3) * H + Math.sin(t * 0.5 + i) * 20 + t * 4) % H;
      var al = 0.07 + 0.13 * G.util.hash(i * 3.1);
      ctx.fillStyle = "rgba(255,246,214," + al + ")";
      ctx.beginPath();
      ctx.arc(x, y, 1 + seed * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    drawSchoolSilhouette(t);

    ctx.save();
    ctx.textAlign = "center";

    ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,240,210,.74)";
    ctx.fillText("UNREASONABLE HOSPITALITY · O'YIN", W / 2, 90);

    // the selected chapter, named large
    var ty = 152;
    ctx.font = "bold 46px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(30,24,18,.30)";
    ctx.fillText(sel.title, W / 2 + 2, ty + 3);
    var tg = ctx.createLinearGradient(0, ty - 38, 0, ty + 10);
    tg.addColorStop(0, "#fff8e6");
    tg.addColorStop(1, "#e6bd70");
    ctx.fillStyle = tg;
    ctx.fillText(sel.title, W / 2, ty);

    ctx.font = "17px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,248,236,.86)";
    ctx.fillText(sel.subtitle, W / 2, ty + 32);
    ctx.restore();

    // chapter picker — one card each
    var pillW = 268, pillH = 52, gap = 18;
    var totalW = chs.length * pillW + (chs.length - 1) * gap;
    var px0 = (W - totalW) / 2;
    for (var ci = 0; ci < chs.length; ci++) {
      var ch = chs[ci];
      var on = (ci === titleChapter);
      var cx = px0 + ci * (pillW + gap);
      G.render.panel(ctx, cx, 232, pillW, pillH, {
        fill: on ? "rgba(140,110,60,.94)" : "rgba(84,74,60,.78)",
        stroke: on ? "rgba(255,222,152,.95)" : "rgba(255,240,208,.26)",
        radius: 9
      });
      ctx.save();
      ctx.textAlign = "left";
      ctx.font = "bold 14px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = on ? "#fff6e2" : "rgba(255,248,236,.72)";
      ctx.fillText(ch.num + "  " + ch.title, cx + 16, 256);

      var theirs = (sv && sv.chapter === ch.id) ? sv : null;
      var status;
      if (ch.status !== "ready") status = "mavjud emas";
      else if (theirs) status = "saqlangan · ishonch " + theirs.trust + "/10";
      else status = "hali o'ynalmagan";
      ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = on ? "rgba(255,240,212,.88)" : "rgba(255,248,236,.46)";
      ctx.fillText(status, cx + 16, 273);
      ctx.restore();
    }

    // the call to action for the selected chapter
    var resumable = (sv && sel && sv.chapter === sel.id) ? sv : null;
    var pulse = 0.62 + 0.38 * Math.sin(t * 2.4);
    ctx.save();
    ctx.textAlign = "center";

    if (sel && sel.status !== "ready") {
      ctx.font = "bold 16px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "#f0c9a0";
      ctx.fillText("Bu bobning ma'lumotlari topilmadi", W / 2, 340);
    } else {
      ctx.globalAlpha = pulse;
      ctx.font = "bold 17px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "#fff1cd";
      ctx.fillText(resumable ? "ENTER — davom etish" : "ENTER — boshlash", W / 2, 340);
      ctx.globalAlpha = 1;

      ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,246,226,.72)";
      if (resumable) {
        var when = String(resumable.savedAt || "").replace("T", " ").slice(0, 16);
        ctx.fillText("Saqlangan: " + when + "  ·  " + (resumable.beat || "") +
                     "  ·  ishonch " + resumable.trust + "/10", W / 2, 362);
        ctx.fillStyle = "rgba(255,246,226,.44)";
        ctx.fillText("N — bu bobni boshidan boshlash", W / 2, 380);
      } else {
        ctx.fillText("← → yoki 1-2 — bob tanlash    ·    TAB — daftar    ·    M — saqlash", W / 2, 362);
      }
    }

    ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,248,236,.46)";
    ctx.fillText("WASD / strelkalar — yurish    E — gaplash    F — memory.md yozish uchun papkani tanlash", W / 2, 408);
    ctx.restore();

    // today's mission brief, for whichever chapter is selected
    if (sel && sel.brief && sel.brief.length) {
      var brief = sel.brief;
      var bh = 30 + brief.length * 17;
      var by = H - bh - 26;
      G.render.panel(ctx, 40, by, 470, bh, {
        fill: "rgba(78,68,56,.72)", stroke: "rgba(255,220,150,.34)", radius: 8
      });
      ctx.save();
      ctx.font = "10px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,222,152,.86)";
      ctx.fillText("BUGUNGI VAZIFA", 56, by + 18);
      ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,246,232,.84)";
      for (var b = 0; b < brief.length && b < 6; b++) {
        var line = String(brief[b]);
        if (line.length > 62) line = line.slice(0, 59) + "…";
        ctx.fillText("• " + line, 56, by + 36 + b * 17);
      }
      ctx.restore();
    }
  }

  function drawSchoolSilhouette(t) {
    ctx.save();
    ctx.globalAlpha = 0.30;
    var baseY = H - 150;
    ctx.fillStyle = "#3a322a";
    // main block
    ctx.fillRect(W / 2 - 250, baseY - 90, 500, 90);
    // roofline
    ctx.beginPath();
    ctx.moveTo(W / 2 - 260, baseY - 90);
    ctx.lineTo(W / 2 - 200, baseY - 118);
    ctx.lineTo(W / 2 + 200, baseY - 118);
    ctx.lineTo(W / 2 + 260, baseY - 90);
    ctx.closePath();
    ctx.fill();
    // windows
    for (var i = 0; i < 7; i++) {
      var wx = W / 2 - 224 + i * 66;
      var flick = 0.5 + 0.5 * Math.sin(t * 0.7 + i * 1.3);
      ctx.fillStyle = "rgba(217,164,76," + (0.10 + 0.10 * flick) + ")";
      ctx.fillRect(wx, baseY - 72, 30, 34);
    }
    // gate
    ctx.fillStyle = "#332c25";
    ctx.fillRect(W / 2 - 34, baseY - 46, 68, 46);
    ctx.fillStyle = "rgba(217,164,76,.12)";
    ctx.fillRect(W / 2 - 30, baseY - 42, 60, 42);
    ctx.restore();
  }

  // boot when DOM ready (scripts are at end of body, so this is immediate)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.GAME = {
    startGame: startGame,
    getState: function () { return state; }
  };
})();
