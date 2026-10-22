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

      /* The chapter overlay owns input while it is open: it is the topmost
         surface, and it must be able to close itself with Escape. */
      if (chapterMenuOpen) {
        updateChapterMenu();
        return;
      }

      /* XULOSALAR — the coaching overview (the original MENYU behaviour). */
      if (menuButtonVisible() && G.input.mouse.clicked && xulButtonHit()) {
        if (G.debrief.openOverview()) {
          G.audio.select();
          return;
        }
      }
      /* MENYU — the chapter list. */
      if (menuButtonVisible() && G.input.mouse.clicked && menuButtonHit()) {
        openChapterMenu();
        return;
      }
      // Ctrl/Cmd-free keyboard route: Escape also opens it while free-roaming.
      // The notebook is checked before anything else that reads Escape, because
      // while the player is typing a note the textarea must own the keyboard.
      if (G.notebook.isOpen()) {
        G.notebook.update(dt);
        return;
      }

      // since nothing else claims Escape in the play state.
      if (menuButtonVisible() && G.input.wasPressed("escape")) {
        G.input.consume("escape");
        openChapterMenu();
        return;
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
        drawMenuButtons();
        drawControlHint();
      }

      // the chapter list sits above everything in the play state
      drawChapterMenu();
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

  /* ---- In-game chapter menu ----------------------------------------------
     Two buttons now live in the top-left column, under the objective and trust
     panels:

       XULOSALAR  — opens the read-only coaching overview (the four chapter-end
                    tabs). This is the ORIGINAL MENYU behaviour, renamed: the
                    user asked for a button that "does the function of current
                    menu button".
       MENYU      — opens a chapter list, so a chapter can be picked mid-game
                    without going back to the title screen.

     In the chapter list, tapping the chapter you are currently in offers two
     explicit choices — "Davom etish" (resume where you are) and "Boshidan
     boshlash" (restart from the first beat, clearing the save). A chapter that
     has already been completed restarts from the beginning when re-tapped,
     because a finished run has nothing left to resume: its save sits on the
     terminal debrief. */
  var CHAP_BTN_W = 104, CHAP_BTN_H = 28;
  var XUL_BTN = { x: 20, y: 116, w: CHAP_BTN_W, h: CHAP_BTN_H };
  var MENU_BTN = { x: 20 + CHAP_BTN_W + 8, y: 116, w: CHAP_BTN_W, h: CHAP_BTN_H };

  // chapter menu overlay state
  var chapterMenuOpen = false;
  var chapterMenuSel = 0;         // which chapter row is highlighted
  var chapterMenuConfirm = null;  // chapter id awaiting Davom/Boshidan choice
  var chapterMenuT = 0;
  var chapterRowRects = [];       // hit rects for the rows this frame
  var chapterActionRects = [];    // hit rects for the confirm buttons

  function menuButtonVisible() {
    return state === "play" && !G.dialogue.isActive() && !G.minigameHost.isActive() &&
      !G.notebook.isOpen() && !G.debrief.isVisible() && !chapterMenuOpen;
  }

  function openChapterMenu() {
    chapterMenuOpen = true;
    chapterMenuT = 0;
    chapterMenuConfirm = null;
    var chs = G.chapters.list();
    // highlight the chapter we are currently in
    var cur = G.state.chapter;
    for (var i = 0; i < chs.length; i++) {
      if (chs[i].id === cur) { chapterMenuSel = i; break; }
    }
    G.audio.door();
  }

  function closeChapterMenu() {
    if (!chapterMenuOpen) return;
    chapterMenuOpen = false;
    chapterMenuConfirm = null;
    G.audio.tick();
  }

  /* Start (or restart) a chapter from this overlay.
       fresh  — discard the save and begin at the chapter's first beat
       else   — start the chapter; if the save belongs to it, resume that run
     `startGame` itself decides between resume and fresh from the save it is
     handed, so the honest call for "Davom etish" is to pass the saved object. */
  function chapterMenuStart(chapterId, fresh) {
    var resume = null;
    if (fresh) {
      G.memory.clear();
      // A restarted chapter is no longer "finished": the menu should offer
      // Davom etish again once there is real progress to continue from.
      if (G.memory.clearCompleted) G.memory.clearCompleted(chapterId);
    } else {
      var saved = G.memory.load();
      // only resume a save that belongs to the chapter being opened
      if (saved && saved.chapter === chapterId && !saved.finished) resume = saved;
    }
    closeChapterMenu();
    pendingState = function () { startGame(resume, chapterId); };
    fadeDir = 1;
    G.audio.select();
  }

  /* What tapping a chapter row means. The user's two rules, applied in order:

       "Re-tapping the current chapter should show 2 buttons:
        Davom etish / Boshidan boshlash"
       "Completed chapters should start from beginning if re-tapped on menu"

     So:
       - a COMPLETED chapter that is not the live one: start it from the top,
         right away. One tap, matching "completed chapters start from beginning".
       - the LIVE chapter, still in progress: ask, offering both buttons.
       - the LIVE chapter, already finished: there is nothing to "continue" — the
         save sits on the terminal debrief — so offer BOSHIDAN BOSHLASH only
         rather than a Davom etish that would silently restart anyway.
       - a chapter never played: start it. */
  function chapterRowTap(index) {
    var chs = G.chapters.list();
    var ch = chs[index];
    if (!ch) return;
    if (ch.status !== "ready") { G.audio.bad(); return; }
    var live = (ch.id === G.state.chapter);
    var done = !!(G.memory.isCompleted && G.memory.isCompleted(ch.id));
    if (live && !done) {
      chapterMenuConfirm = ch.id;      // both buttons
      G.audio.select();
    } else if (done) {
      chapterMenuStart(ch.id, true);   // completed: straight to the top
    } else {
      chapterMenuStart(ch.id, false);  // never played: start it
    }
  }

  /* Can the live chapter be continued? Only if it has an unfinished save.
     Used by the confirm row to decide whether to show "Davom etish". */
  function chapterResumable(chapterId) {
    if (chapterId !== G.state.chapter) return false;
    if (G.memory.isCompleted && G.memory.isCompleted(chapterId)) return false;
    var saved = G.memory.load();
    return !!(saved && saved.chapter === chapterId && !saved.finished);
  }

  function drawMenuButton() { drawMenuButtons(); }

  function menuButtonHit() {
    var b = MENU_BTN;
    return G.util.pointInRect(G.input.mouse.x, G.input.mouse.y, b);
  }

  function xulButtonHit() {
    var b = XUL_BTN;
    return G.util.pointInRect(G.input.mouse.x, G.input.mouse.y, b);
  }

  /* One left-column button. Kept as a helper so the two buttons cannot drift
     apart in size, font or hover treatment. */
  function drawPill(b, label, opts) {
    opts = opts || {};
    var hover = !opts.disabled && G.util.pointInRect(G.input.mouse.x, G.input.mouse.y, b);
    ctx.save();
    G.util.roundRect(ctx, b.x, b.y, b.w, b.h, 8);
    ctx.fillStyle = opts.disabled ? "rgba(44,38,32,.72)"
                  : (hover ? "rgba(217,164,76,.28)" : "rgba(68,58,47,.85)");
    ctx.fill();
    ctx.strokeStyle = opts.disabled ? "rgba(232,196,128,.18)"
                    : (hover ? "rgba(232,196,128,.9)" : "rgba(232,196,128,.45)");
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.font = "bold 11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = opts.disabled ? "rgba(242,223,174,.42)" : "#f2dfae";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, b.x + b.w / 2, b.y + b.h / 2 + 0.5);
    ctx.restore();
  }

  function drawMenuButtons() {
    if (!menuButtonVisible()) return;
    drawPill(XUL_BTN, "XULOSALAR");
    drawPill(MENU_BTN, "MENYU");
  }

  /* ---- the chapter list overlay ----------------------------------------- */
  var CH_PANEL = { x: 150, y: 96, w: 660, h: 408 };

  function drawChapterMenu() {
    if (!chapterMenuOpen) return;
    var chs = G.chapters.list();
    var P = CH_PANEL;
    chapterRowRects = [];
    chapterActionRects = [];

    // scrim, so the frozen world reads as "behind" the menu
    ctx.save();
    ctx.fillStyle = "rgba(12,10,8,.72)";
    ctx.fillRect(0, 0, W, H);

    G.render.panel(ctx, P.x, P.y, P.w, P.h, {
      fill: "rgba(44,37,30,.985)", stroke: "rgba(232,196,128,.6)", radius: 12, lineWidth: 2
    });

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "bold 22px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#f6e7c4";
    ctx.fillText("BOBLAR", P.x + P.w / 2, P.y + 22);

    ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.55)";
    ctx.fillText("Bobni tanlang — hozirgi bobni yana bossangiz, davom etish yoki boshidan boshlash so'raladi",
                 P.x + P.w / 2, P.y + 54);

    // rows
    var rowX = P.x + 26, rowW = P.w - 52, rowH = 54, rowGap = 10;
    var rowY = P.y + 86;
    for (var i = 0; i < chs.length; i++) {
      var ch = chs[i];
      var y = rowY + i * (rowH + rowGap);
      var sel = (i === chapterMenuSel);
      var live = (ch.id === G.state.chapter);
      var done = !!(G.memory.isCompleted && G.memory.isCompleted(ch.id));
      var prog = (G.memory.progress && G.memory.progress()[ch.id]) || null;

      chapterRowRects.push({ x: rowX, y: y, w: rowW, h: rowH, index: i });

      G.render.panel(ctx, rowX, y, rowW, rowH, {
        fill: sel ? "rgba(96,74,44,.98)" : "rgba(34,29,24,.94)",
        stroke: sel ? "rgba(255,222,152,.95)" : (live ? "rgba(217,164,76,.42)" : "rgba(200,180,150,.20)"),
        radius: 9, lineWidth: sel ? 2.2 : 1.3
      });

      // number badge
      ctx.save();
      ctx.beginPath();
      ctx.arc(rowX + 30, y + rowH / 2, 15, 0, Math.PI * 2);
      ctx.fillStyle = sel ? "#d9a44c" : "rgba(217,164,76,.16)";
      ctx.fill();
      ctx.font = "bold 14px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = sel ? "#1a1512" : "#d9a44c";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(ch.num), rowX + 30, y + rowH / 2 + 0.5);
      ctx.restore();

      // title + status, left aligned off the badge
      ctx.save();
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.font = "bold 15px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = sel ? "#fff5e2" : "rgba(244,236,224,.9)";
      ctx.fillText(ch.title, rowX + 58, y + rowH / 2 - 8);

      var status, statusColor;
      if (ch.status !== "ready") {
        status = "ma'lumotlari topilmadi"; statusColor = "rgba(200,120,100,.85)";
      } else if (done) {
        status = "tugatilgan" + (prog && prog.times > 1 ? " · " + prog.times + " marta" : "") +
                 " — boshidan boshlanadi"; statusColor = "rgba(150,200,140,.9)";
      } else if (live) {
        status = "hozirgi bob · " + (G.state.beat || ""); statusColor = "rgba(255,222,152,.92)";
      } else {
        status = "hali o'ynalmagan"; statusColor = "rgba(244,236,224,.48)";
      }
      ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = statusColor;
      ctx.fillText(status, rowX + 58, y + rowH / 2 + 11);
      ctx.restore();
    }

    /* The confirm row: shown when the tapped chapter needs a decision. For the
       LIVE chapter we offer both; for a COMPLETED (but not live) chapter the
       only meaningful action is a fresh start, so we say so plainly. */
    var cy = P.y + P.h - 78;
    if (chapterMenuConfirm) {
      var conf = null;
      for (var c2 = 0; c2 < chs.length; c2++) if (chs[c2].id === chapterMenuConfirm) conf = chs[c2];
      var canResume = chapterResumable(chapterMenuConfirm);
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "13px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,240,214,.9)";
      ctx.fillText(conf ? conf.title + " — nima qilamiz?" : "", P.x + P.w / 2, cy - 22);
      ctx.restore();

      var bw = 190, bh = 40, bgap = 18;
      var labels = canResume ? ["DAVOM ETISH", "BOSHIDAN BOSHLASH"] : ["BOSHIDAN BOSHLASH"];
      var totalB = labels.length * bw + (labels.length - 1) * bgap;
      var bx0 = P.x + (P.w - totalB) / 2;
      for (var b2 = 0; b2 < labels.length; b2++) {
        var bx = bx0 + b2 * (bw + bgap);
        var isFresh = (labels[b2] === "BOSHIDAN BOSHLASH");
        chapterActionRects.push({ x: bx, y: cy, w: bw, h: bh, fresh: isFresh, label: labels[b2] });
        G.render.panel(ctx, bx, cy, bw, bh, {
          fill: isFresh ? "rgba(96,52,44,.96)" : "rgba(56,84,52,.96)",
          stroke: isFresh ? "rgba(226,150,130,.85)" : "rgba(160,210,150,.85)",
          radius: 9, lineWidth: 1.8
        });
        ctx.save();
        ctx.font = "bold 13px 'Segoe UI', system-ui, sans-serif";
        ctx.fillStyle = isFresh ? "#ffe0d4" : "#e8ffe0";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(labels[b2], bx + bw / 2, cy + bh / 2 + 0.5);
        ctx.restore();
      }
    } else {
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(244,236,224,.5)";
      ctx.fillText("ESC / MENYU — yopish    ·    ↑ ↓ — tanlash    ·    ENTER — ochish",
                   P.x + P.w / 2, P.y + P.h - 32);
      ctx.restore();
    }

    ctx.restore();
  }

  /* Input for the chapter overlay. Returns true when it consumed the frame. */
  function updateChapterMenu() {
    chapterMenuT += 0.016;
    var chs = G.chapters.list();

    /* Mouse first: the confirm buttons are only reachable by pointer, so this
       must be handled before any branch that returns early. Getting this order
       wrong drew the buttons but made them dead — the panel looked fine and
       clicking did nothing. */
    if (G.input.mouse.clicked) {
      for (var a = 0; a < chapterActionRects.length; a++) {
        var ar = chapterActionRects[a];
        if (G.util.pointInRect(G.input.mouse.x, G.input.mouse.y, ar)) {
          chapterMenuStart(chapterMenuConfirm, ar.fresh);
          return true;
        }
      }
      for (var r = 0; r < chapterRowRects.length; r++) {
        var rr = chapterRowRects[r];
        if (G.util.pointInRect(G.input.mouse.x, G.input.mouse.y, rr)) {
          chapterMenuSel = rr.index;
          chapterRowTap(rr.index);
          return true;
        }
      }
      // a click inside the panel but on neither a row nor an action is a no-op
      if (!chapterMenuHitAny()) {
        if (chapterMenuConfirm) { chapterMenuConfirm = null; G.audio.tick(); return true; }
        closeChapterMenu();
        return true;
      }
    }

    if (G.input.wasPressed("escape")) {
      G.input.consume("escape");
      // Escape backs out one level: confirm row first, then the menu itself.
      if (chapterMenuConfirm) { chapterMenuConfirm = null; G.audio.tick(); return true; }
      closeChapterMenu();
      return true;
    }

    // keyboard navigation
    if (chapterMenuConfirm) {
      var canResume = chapterResumable(chapterMenuConfirm);
      if (G.input.wasPressed("enter")) {
        G.input.consume("enter");
        // ENTER takes the safe default: resume when that is possible, else restart
        if (canResume) closeChapterMenu();
        else chapterMenuStart(chapterMenuConfirm, true);
        return true;
      }
      if (G.input.wasPressed("2") || G.input.wasPressed("arrowright")) {
        G.input.consume("2"); G.input.consume("arrowright");
        chapterMenuStart(chapterMenuConfirm, true);
        return true;
      }
      if (G.input.wasPressed("1")) {
        G.input.consume("1");
        if (canResume) closeChapterMenu();          // "davom etish": stay where we are
        else chapterMenuStart(chapterMenuConfirm, true);
        return true;
      }
      if (G.input.wasPressed("b")) {
        G.input.consume("b");
        chapterMenuStart(chapterMenuConfirm, true);
        return true;
      }
      return true;
    }

    if (G.input.wasPressed("arrowdown") || G.input.wasPressed("s")) {
      G.input.consume("arrowdown"); G.input.consume("s");
      chapterMenuSel = (chapterMenuSel + 1) % chs.length;
      G.audio.tick();
    }
    if (G.input.wasPressed("arrowup") || G.input.wasPressed("w")) {
      G.input.consume("arrowup"); G.input.consume("w");
      chapterMenuSel = (chapterMenuSel - 1 + chs.length) % chs.length;
      G.audio.tick();
    }
    for (var i = 0; i < chs.length && i < 9; i++) {
      if (G.input.wasPressed(String(i + 1))) {
        G.input.consume(String(i + 1));
        chapterMenuSel = i;
        chapterRowTap(i);
        return true;
      }
    }
    if (G.input.wasPressed("enter") || G.input.wasPressed("space")) {
      G.input.consume("enter"); G.input.consume("space");
      chapterRowTap(chapterMenuSel);
      return true;
    }

    return true;
  }

  function chapterMenuHitAny() {
    var P = CH_PANEL;
    return G.util.pointInRect(G.input.mouse.x, G.input.mouse.y, P);
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
    getState: function () { return state; },
    /* test hooks for the chapter menu. The overlay is entirely canvas-drawn, so
       the only way a probe can assert on it is through these — but they mirror
       the real handlers exactly rather than reimplementing them. */
    __menu: {
      isOpen: function () { return chapterMenuOpen; },
      open: openChapterMenu,
      close: closeChapterMenu,
      rows: function () { return chapterRowRects.slice(); },
      actions: function () { return chapterActionRects.slice(); },
      confirm: function () { return chapterMenuConfirm; },
      sel: function () { return chapterMenuSel; },
      tapRow: function (i) { chapterRowTap(i); },
      startChapter: function (id, fresh) { chapterMenuStart(id, fresh); },
      buttons: function () { return { xul: XUL_BTN, menu: MENU_BTN }; },
      panel: function () { return CH_PANEL; }
    }
  };
})();
