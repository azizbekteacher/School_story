/* Boot, title screen, main loop, screen-state machine. */
window.G = window.G || {};

(function () {
  var W = 960, H = 600;
  var canvas, ctx;
  var lastTime = 0;
  var state = "title";        // title | play | debrief
  var titleT = 0;
  var bootT = 0;
  var fadeAlpha = 1;
  var fadeDir = -1;
  var pendingState = null;
  var storyLoaded = false;
  var showHelp = false;

  function boot() {
    G.memory.install();
    canvas = document.getElementById("game");
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;

    G.input.init(canvas);
    G.map.build();

    if (G.data && G.data.story) {
      storyLoaded = true;
    } else {
      console.error("story.js missing");
    }

    bindFirstGesture();
    requestAnimationFrame(loop);
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
  function startGame(resume) {
    G.state.reset();
    G.quest.reset();
    G.world.init();
    G.state.started = true;
    if (G.state.onChange) G.state.onChange(function () { G.memory.autosave("state"); });

    var story = G.data.story;
    if (story && story.npcs) G.world.setNpcs(story.npcs);

    state = "play";
    G.dialogueActive = false;

    if (resume) {
      var rep = G.memory.apply(resume);
      if (rep.ok) {
        // put the camera on the restored position before the first frame
        if (G.world.cam && resume.position) {
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
      if (G.input.wasPressed("enter") || G.input.wasPressed("space")) {
        G.input.consume("enter"); G.input.consume("space");
        G.audio.select();
        pendingState = function () { startGame(saved); };
        fadeDir = 1;
      }
      if (saved && G.input.wasPressed("n")) {
        G.input.consume("n");
        G.memory.clear();
        G.audio.bad();
        pendingState = function () { startGame(null); };
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
      // pause? (no pause screen; esc handled elsewhere)
      if (G.debrief.isVisible()) { state = "debrief"; }

      if (G.notebook.isOpen()) {
        G.notebook.update(dt);
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
    ctx.fillText("WASD — yurish · E — gaplash · TAB — daftar · M — saqlash", W - 20, H - 16);
    ctx.restore();
  }

  function drawTitle() {
    var t = titleT;

    // backdrop: slow drifting bokeh over brick
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#1b1512");
    g.addColorStop(0.5, "#241a15");
    g.addColorStop(1, "#120e0c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // warm glow
    var rg = ctx.createRadialGradient(W * 0.5, H * 0.38, 20, W * 0.5, H * 0.38, 420);
    rg.addColorStop(0, "rgba(217,164,76,.16)");
    rg.addColorStop(1, "rgba(217,164,76,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);

    // drifting dust motes
    for (var i = 0; i < 46; i++) {
      var seed = G.util.hash(i * 13.7);
      var x = ((seed * W + t * (8 + seed * 16)) % (W + 60)) - 30;
      var y = (G.util.hash(i * 7.3) * H + Math.sin(t * 0.5 + i) * 20 + t * 4) % H;
      var a = 0.05 + 0.10 * G.util.hash(i * 3.1);
      ctx.fillStyle = "rgba(240,220,180," + a + ")";
      ctx.beginPath();
      ctx.arc(x, y, 1 + seed * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // a small school silhouette
    drawSchoolSilhouette(t);

    // title text
    ctx.save();
    ctx.textAlign = "center";

    var ty = 214;
    ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(217,164,76,.8)";
    ctx.fillText("UNREASONABLE HOSPITALITY · O'YIN", W / 2, ty - 46);

    ctx.font = "bold 52px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(0,0,0,.5)";
    ctx.fillText("Birinchi kun", W / 2 + 2, ty + 2);
    var tg = ctx.createLinearGradient(0, ty - 40, 0, ty + 10);
    tg.addColorStop(0, "#f7e9c8");
    tg.addColorStop(1, "#d9a44c");
    ctx.fillStyle = tg;
    ctx.fillText("Birinchi kun", W / 2, ty);

    ctx.font = "16px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.62)";
    ctx.fillText("Sulton School — matematika o'qituvchisining birinchi kuni", W / 2, ty + 36);

    ctx.font = "italic 14px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(200,190,175,.45)";
    ctx.fillText("Timur ismli bola bilan bir kunda nima qila olasiz?", W / 2, ty + 62);

    // start prompt
    var pulse = 0.6 + 0.4 * Math.sin(t * 2.4);
    ctx.globalAlpha = pulse;
    ctx.font = "bold 16px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#f2dfae";
    var saveInfo = G.memory.load();
    if (saveInfo) {
      ctx.fillText("ENTER — davom etish", W / 2, H - 108);
      ctx.globalAlpha = 1;
      ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(242,223,174,.75)";
      var when = String(saveInfo.savedAt || "").replace("T", " ").slice(0, 16);
      ctx.fillText("Saqlangan: " + when + "  ·  " + (saveInfo.beat || "") +
                   "  ·  ishonch " + saveInfo.trust + "/10", W / 2, H - 88);
      ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(244,236,224,.42)";
      ctx.fillText("N — boshidan boshlash", W / 2, H - 70);
    } else {
      ctx.fillText("ENTER — boshlash", W / 2, H - 108);
      ctx.globalAlpha = 1;
    }

    ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.38)";
    ctx.fillText("WASD / strelkalar — yurish    E — gaplash    TAB — daftar    M — saqlash", W / 2, H - 76);
    ctx.fillText("Bu o'yin qilgan tanlovlaringizni o'qituvchilik uslubingizga bog'laydi", W / 2, H - 54);

    ctx.restore();

    // mission brief card bottom-left
    if (G.data && G.data.story && G.data.story.brief) {
      var brief = G.data.story.brief;
      var bh = 26 + brief.length * 18;
      G.render.panel(ctx, 40, H - bh - 40, 400, bh, {
        fill: "rgba(66,56,45,.78)", stroke: "rgba(232,196,128,.3)", radius: 8
      });
      ctx.save();
      ctx.font = "10px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(217,164,76,.7)";
      ctx.fillText("BUGUNGI VAZIFA", 56, H - bh - 22);
      ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(240,230,216,.75)";
      for (var b = 0; b < brief.length; b++) {
        ctx.fillText("• " + brief[b], 56, H - bh - 6 + b * 18);
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
