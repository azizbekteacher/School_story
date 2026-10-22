/* Dialogue system: interprets story scene nodes, applies effects, renders the UI. */
window.G = window.G || {};

G.dialogue = (function () {
  var W = 960, H = 600;

  var scene = null;        // current scene object { nodes: {...} }
  var nodeId = null;
  var node = null;
  var typed = 0;           // chars revealed
  var typing = false;
  var choiceSel = 0;
  var multiPicked = [];
  var multiReturn = null;
  var pendingNext = null;
  var onSceneEnd = null;
  var sceneKey = "";
  var active = false;
  var visT = 0;
  var typeSoundT = 0;

  function startScene(key, callbacks) {
    var story = G.data && G.data.story;
    if (!story || !story.scenes) return false;
    var sc = story.scenes[key];
    if (!sc || !sc.nodes) {
      console.warn("Missing scene: " + key);
      if (callbacks && callbacks.onEnd) callbacks.onEnd();
      return false;
    }
    scene = sc;
    sceneKey = key;
    active = true;
    visT = 0;
    multiPicked = [];
    multiReturn = null;
    onSceneEnd = (callbacks && callbacks.onEnd) || null;
    var first = sc.start || Object.keys(sc.nodes)[0];
    goto(first);
    return true;
  }

  function goto(id) {
    if (!id) { endScene(); return; }
    var n = scene.nodes[id];
    if (!n) {
      console.warn("Missing node: " + id + " in scene " + sceneKey);
      endScene();
      return;
    }
    nodeId = id;
    node = n;
    typed = 0;
    typing = true;
    choiceSel = 0;
    visT = 0;

    if (n.effects && n.effects.length) applyEffects(n.effects);
    if (n.type === "end") {
      // apply then end on a short delay so the text (if any) can't be missed.
      // Do NOT clobber an endMission request raised by this node's own effects:
      // __finish__ goes to the debrief, __end__ just closes the scene.
      if (pendingNext !== "__finish__") pendingNext = "__end__";
      return;
    }
    if (n.type === "minigame") {
      // launch after the player sees a beat — launch immediately but render overlay
      launchMinigame(n);
    }
  }

  function launchMinigame(n) {
    var cfg = n.config || {};
    G.dialogueActive = false;
    var ok = G.minigameHost.start(n.game, cfg, {
      onFinish: function (result) {
        G.dialogueActive = true;
        applyMinigameResult(result);
        var next = (result && result.win) ? (n.onWin || n.next) : (n.onLose || n.next);
        if (next) goto(next);
        else endScene();
      }
    });
    if (!ok) {
      // game missing: continue without blocking
      var nb = n.onWin || n.next;
      if (nb) goto(nb); else endScene();
    }
  }

  function applyMinigameResult(result) {
    if (!result) return;
    if (result.choiceId) G.state.recordChoice(result.choiceId);
    if (result.effects) applyEffects(result.effects);
    if (result.notes) {
      for (var i = 0; i < result.notes.length; i++) {
        G.state.addNote({
          principle: result.notes[i].principle,
          text: result.notes[i].text,
          verdict: result.notes[i].verdict || (result.win ? "good" : "bad")
        });
      }
    }
  }

  function applyEffects(effects) {
    if (!effects) return;
    // Journal / notes describe the beat that is just finishing, so they must be
    // stamped with the OLD beat. Only after that do beat/objective changes land.
    var priorBeat = G.state.beat;
    for (var i = 0; i < effects.length; i++) {
      var e = effects[i];
      if (!e) continue;
      if (e.flag) G.state.setFlag(e.flag, e.value === undefined ? true : e.value);
      if (e.intel) G.state.addIntel(e.intel);
      if (typeof e.trust === "number") G.state.addTrust(e.trust);
      if (e.journal) G.state.addJournal(e.journal, priorBeat);
      if (e.note) G.state.addNote(e.note, priorBeat);
      if (e.choice) G.state.recordChoice(e.choice);
      if (e.endMission) { pendingNext = "__finish__"; }
    }
    // transitions last, so the next frame sees the new beat
    for (var p = 0; p < effects.length; p++) {
      var eb = effects[p];
      if (!eb) continue;
      if (eb.beat) G.state.setBeat(eb.beat);
      if (eb.objective) G.state.setObjectiveOverride(eb.objective);
    }
  }

  function conditionMet(cond) {
    if (!cond) return true;
    if (cond.intel && !G.state.hasIntel(cond.intel)) return false;
    if (cond.intelAny) {
      var any = false;
      for (var i = 0; i < cond.intelAny.length; i++) {
        if (G.state.hasIntel(cond.intelAny[i])) { any = true; break; }
      }
      if (!any) return false;
    }
    if (cond.flag && !G.state.hasFlag(cond.flag)) return false;
    if (cond.notFlag && G.state.hasFlag(cond.notFlag)) return false;
    if (cond.chosen && !G.state.hasChosen(cond.chosen)) return false;
    if (cond.notChosen && G.state.hasChosen(cond.notChosen)) return false;
    if (cond.trustMin !== undefined && G.state.trust < cond.trustMin) return false;
    return true;
  }

  function endsTyping() {
    if (typing) { typing = false; typed = nodeText().length; return; }
  }

  function nodeText() {
    if (!node) return "";
    return node.text || "";
  }

  /* ---- copy-to-clipboard -------------------------------------------------
     Every message gets a copy control, because players screenshot dialogue to
     share a line or to keep it as a note. `navigator.clipboard` is unavailable
     or rejected on `file://` in some browsers, so there is a hidden-textarea +
     execCommand fallback. Both are async-ish; the UI only needs to know whether
     the attempt was accepted, so the visible state is set optimistically and
     corrected on failure. */
  var COPY_W = 62, COPY_H = 22;
  var copyRect = null;          // screen rect of the copy control this frame
  var copyFlash = 0;            // >0 shows "Nusxalandi"
  var copyFlashOk = true;

  function copyTextFor() {
    if (!node) return "";
    if (node.type === "say") {
      var t = nodeText();
      return node.speaker ? node.speaker + ": " + t : t;
    }
    if (node.type === "choice" || node.type === "multi") {
      // Copy the prompt plus the options as they are shown, locked ones marked
      // so a pasted copy is still honest about what was reachable.
      var out = [];
      if (node.prompt) out.push(node.prompt);
      var opts = availableOptions();
      for (var i = 0; i < opts.length; i++) {
        var mark = opts[i].locked ? " [yopiq]" : "";
        out.push((i + 1) + ". " + (opts[i].locked ? (opts[i].o.lockedText || opts[i].o.text) : opts[i].o.text) + mark);
      }
      return out.join("\n");
    }
    return nodeText();
  }

  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function doCopy() {
    var text = copyTextFor();
    if (!text) return;
    copyFlash = 1.6;
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        copyFlashOk = true;
      }, function () {
        copyFlashOk = legacyCopy(text);
      });
    } else {
      copyFlashOk = legacyCopy(text);
    }
    if (copyFlashOk) G.audio.select(); else G.audio.bad();
    if (G.quest && G.quest.showToast) {
      G.quest.showToast(copyFlashOk ? "Nusxalandi" : "Nusxalab bo'lmadi", copyFlashOk ? "good" : "bad");
    }
  }

  /* The control is a small rect in the message panel's top-right. Returns the
     rect so draw and hit-test agree on one value. */
  function messagePanel() {
    var px = 96, pw = W - 192;
    var ph = 176;
    var py = H - ph - 44;
    return { x: px, y: py, w: pw, h: ph };
  }

  function copyButtonRect() {
    if (node && (node.type === "choice" || node.type === "multi")) {
      // these panels have their prompt box at the top of the screen, so the
      // control sits inside that box's top-right corner
      var qy = 60, qh = 74;
      return { x: 96 + (W - 192) - COPY_W - 12, y: qy + qh - COPY_H - 8, w: COPY_W, h: COPY_H };
    }
    var p = messagePanel();
    return { x: p.x + p.w - COPY_W - 14, y: p.y - 11, w: COPY_W, h: COPY_H };
  }

  function hitCopy() {
    var r = copyButtonRect();
    return G.util.pointInRect(G.input.mouse.x, G.input.mouse.y, r);
  }

  function drawCopyButton(ctx) {
    var r = copyButtonRect();
    copyRect = r;
    var hover = G.util.pointInRect(G.input.mouse.x, G.input.mouse.y, r);
    var copied = copyFlash > 0;

    ctx.save();
    G.util.roundRect(ctx, r.x, r.y, r.w, r.h, 6);
    ctx.fillStyle = copied ? "rgba(127,184,107,.30)"
                  : (hover ? "rgba(255,255,255,.13)" : "rgba(38,29,22,.92)");
    ctx.fill();
    ctx.strokeStyle = copied ? "rgba(127,184,107,.85)"
                    : (hover ? "rgba(240,230,216,.6)" : "rgba(240,230,216,.32)");
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = copied ? "#d9f0cf" : "rgba(244,236,224,.9)";
    ctx.fillText(copied ? "Nusxalandi" : "Nusxa", r.x + r.w / 2, r.y + r.h / 2 + 0.5);
    ctx.restore();
  }

  function advance() {
    if (!node) return;
    if (node.type === "say") {
      if (typing) { endsTyping(); return; }
      if (node.next) goto(node.next); else endScene();
      return;
    }
    if (node.type === "end") { endScene(); return; }
    if (node.type === "choice") { pickChoice(); return; }
    if (node.type === "multi") { finishMulti(); return; }
  }

  function pickChoice(index) {
    if (!node || node.type !== "choice") return;
    var wraps = availableOptions();
    if (!wraps.length) { endScene(); return; }
    var idx = (index === undefined) ? choiceSel : index;
    idx = G.util.clamp(idx, 0, wraps.length - 1);
    var wrap = wraps[idx];
    if (!wrap) return;
    if (wrap.locked) { G.audio.bad(); return; }   // gated option: cannot pick
    var o = wrap.o;
    G.audio.select();
    if (o.id) G.state.recordChoice(o.id);
    if (o.effects && o.effects.length) applyEffects(o.effects);
    if (pendingNext === "__finish__") { finishMission(); return; }
    if (o.next) goto(o.next); else endScene();
  }

  function availableOptions() {
    if (!node || !node.options) return [];
    var out = [];
    for (var i = 0; i < node.options.length; i++) {
      var o = node.options[i];
      if (conditionMet(o.requires)) out.push({ o: o, i: i, locked: false });
      else if (o.lockedText) out.push({ o: o, i: i, locked: true });
    }
    return out;
  }

  function pickMulti(index) {
    if (!node || node.type !== "multi") return;
    var opts = availableOptions();
    if (!opts.length) { finishMulti(); return; }
    var idx = (index === undefined) ? choiceSel : index;
    idx = G.util.clamp(idx, 0, opts.length - 1);
    var wrap = opts[idx];
    if (!wrap || wrap.locked) { G.audio.bad(); return; }
    var o = wrap.o;
    if (multiPicked.indexOf(o.id) !== -1) return;
    if (multiPicked.length >= (node.max || 99)) { G.audio.bad(); return; }

    multiPicked.push(o.id);
    G.state.recordChoice(o.id);
    G.audio.select();
    if (o.intel) G.state.addIntel(o.intel);
    if (o.effects && o.effects.length) applyEffects(o.effects);

    if (otherQuestionsLeft()) {
      // stay on this node, mark the picked one
      choiceSel = 0;
      return;
    }
    finishMulti();
  }

  function otherQuestionsLeft() {
    if (!node || node.type !== "multi") return false;
    if (multiPicked.length >= (node.max || 99)) return false;
    var opts = availableOptions();
    for (var i = 0; i < opts.length; i++) {
      if (multiPicked.indexOf(opts[i].o.id) === -1) return true;
    }
    return false;
  }

  function finishMulti() {
    if (!node || node.type !== "multi") return;
    var next = (node.nextAfter && G.state.hasIntel(node.nextAfter.intel))
      ? node.nextAfter.true
      : (node.next || node.nextFallback);
    if (next) goto(next); else endScene();
  }

  function endScene() {
    active = false;
    var cb = onSceneEnd;
    onSceneEnd = null;
    scene = null; node = null; nodeId = null;
    if (cb) cb();
  }

  function finishMission() {
    active = false;
    var cb = onSceneEnd;
    onSceneEnd = null;
    scene = null; node = null; nodeId = null;
    if (G.debrief) G.debrief.show();
    if (cb) cb();
  }

  function update(dt) {
    if (!active || !node) return;
    visT += dt;
    if (copyFlash > 0) copyFlash = Math.max(0, copyFlash - dt);

    if (node.type === "say" || node.type === "end") {
      var full = nodeText();
      if (typing) {
        var speed = 52;   // chars per second
        typed += dt * speed;
        typeSoundT += dt;
        if (typeSoundT > 0.055) {
          typeSoundT = 0;
          if (node.speaker) G.audio.blip(520 + Math.random() * 120);
        }
        if (typed >= full.length) { typed = full.length; typing = false; }
      }
    }
    if (pendingNext === "__finish__") {
      pendingNext = null;
      finishMission();
      return;
    }
    if (pendingNext === "__end__") {
      pendingNext = null;
      endScene();
      return;
    }
  }

  function handleInput() {
    if (!active || !node) return;

    // Copy control wins over advance: clicking it must never advance the beat,
    // or the player loses the line they were trying to copy.
    if (G.input.mouse.clicked && hitCopy()) {
      doCopy();
      return;
    }
    // C is the keyboard equivalent, for players who never reach for the mouse.
    if (G.input.wasPressed("c")) {
      G.input.consume("c");
      doCopy();
      return;
    }

    if (node.type === "say") {
      if (G.input.wasPressed("space") || G.input.wasPressed("enter") || G.input.wasPressed("e") ||
          G.input.mouse.clicked) {
        G.input.consume("space"); G.input.consume("enter"); G.input.consume("e");
        advance();
      }
      return;
    }

    if (node.type === "choice") {
      var opts = availableOptions();
      var n = G.input.numberPressed();
      if (n > 0 && n <= opts.length) { pickChoice(n - 1); return; }
      if (G.input.wasPressed("arrowdown") || G.input.wasPressed("s")) {
        G.input.consume("arrowdown"); G.input.consume("s");
        choiceSel = (choiceSel + 1) % opts.length; G.audio.tick();
      }
      if (G.input.wasPressed("arrowup") || G.input.wasPressed("w")) {
        G.input.consume("arrowup"); G.input.consume("w");
        choiceSel = (choiceSel - 1 + opts.length) % opts.length; G.audio.tick();
      }
      if (G.input.wasPressed("enter") || G.input.wasPressed("space") || G.input.wasPressed("e")) {
        G.input.consume("enter"); G.input.consume("space"); G.input.consume("e");
        pickChoice();
      }
      // mouse hover/click
      var rects = lastOptionRects;
      for (var i = 0; i < rects.length && i < opts.length; i++) {
        if (G.util.pointInRect(G.input.mouse.x, G.input.mouse.y, rects[i])) {
          if (choiceSel !== i) { choiceSel = i; G.audio.tick(); }
          if (G.input.mouse.clicked) { pickChoice(i); return; }
        }
      }
      return;
    }

    if (node.type === "multi") {
      var mopts = availableOptions();
      var mn = G.input.numberPressed();
      if (mn > 0 && mn <= mopts.length) { pickMulti(mn - 1); return; }
      if (G.input.wasPressed("arrowdown") || G.input.wasPressed("s")) {
        G.input.consume("arrowdown"); G.input.consume("s");
        choiceSel = (choiceSel + 1) % mopts.length; G.audio.tick();
      }
      if (G.input.wasPressed("arrowup") || G.input.wasPressed("w")) {
        G.input.consume("arrowup"); G.input.consume("w");
        choiceSel = (choiceSel - 1 + mopts.length) % mopts.length; G.audio.tick();
      }
      if (G.input.wasPressed("enter") || G.input.wasPressed("space")) {
        G.input.consume("enter"); G.input.consume("space");
        if (multiPicked.length > 0) finishMulti();
        else pickMulti();
      }
      var mrects = lastOptionRects;
      for (var j = 0; j < mrects.length && j < mopts.length; j++) {
        if (G.util.pointInRect(G.input.mouse.x, G.input.mouse.y, mrects[j])) {
          if (choiceSel !== j) { choiceSel = j; G.audio.tick(); }
          if (G.input.mouse.clicked) { pickMulti(j); return; }
        }
      }
      return;
    }
  }

  var lastOptionRects = [];

  // ---------- drawing ----------

  function draw(ctx) {
    if (!active || !node) return;

    if (node.type === "minigame") return;   // overlay handles itself

    ctx.save();
    // letterbox dim
    var g = ctx.createLinearGradient(0, H * 0.45, 0, H);
    g.addColorStop(0, "rgba(34,28,23,0)");
    g.addColorStop(0.35, "rgba(34,28,23,.40)");
    g.addColorStop(1, "rgba(34,28,23,.70)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    if (node.type === "say" || node.type === "end") drawSay(ctx);
    else if (node.type === "choice") drawChoice(ctx);
    else if (node.type === "multi") drawMulti(ctx);
  }

  function drawSay(ctx) {
    var full = nodeText();
    var shown = full.substring(0, Math.floor(typed));
    var isNarration = !node.speaker;

    var px = 96, pw = W - 192;
    var ph = 176;
    var py = H - ph - 44;

    G.render.panel(ctx, px, py, pw, ph, {
      fill: isNarration ? "rgba(16,20,24,.95)" : "rgba(22,18,15,.96)",
      stroke: isNarration ? "rgba(120,170,190,.5)" : "rgba(217,164,76,.55)",
      radius: 12,
      inner: true
    });

    // speaker plate
    if (node.speaker) {
      ctx.save();
      ctx.font = "bold 15px 'Segoe UI', system-ui, sans-serif";
      var nw = ctx.measureText(node.speaker).width + 32;
      G.util.roundRect(ctx, px + 26, py - 16, nw, 32, 8);
      ctx.fillStyle = "rgba(38,29,22,.99)";
      ctx.fill();
      ctx.strokeStyle = "rgba(217,164,76,.8)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#f2dfae";
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.fillText(node.speaker, px + 42, py + 1);
      ctx.restore();
    } else {
      ctx.save();
      ctx.font = "italic 12px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(150,190,210,.85)";
      ctx.fillText("ichimdan", px + 30, py + 14);
      ctx.restore();
    }

    // body text
    ctx.save();
    ctx.font = isNarration ? "italic 17px 'Segoe UI', system-ui, sans-serif"
                           : "17px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = isNarration ? "#cfe2ea" : "#f0e6d8";
    ctx.textBaseline = "top";
    var lines = G.util.wrapText(ctx, shown, pw - 68);
    for (var i = 0; i < lines.length && i < 6; i++) {
      ctx.fillText(lines[i], px + 34, py + 36 + i * 26);
    }
    ctx.restore();

    // continue chevron
    if (!typing) {
      ctx.save();
      var bob = Math.sin(visT * 4) * 2.5;
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "#d9a44c";
      ctx.beginPath();
      ctx.moveTo(px + pw - 34, py + ph - 30 + bob);
      ctx.lineTo(px + pw - 24, py + ph - 30 + bob);
      ctx.lineTo(px + pw - 29, py + ph - 23 + bob);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    G.render.hint(ctx, "SPACE / E — davom", visT);
    drawCopyButton(ctx);
  }

  function drawChoice(ctx) {
    var opts = availableOptions();
    lastOptionRects = [];

    // prompt box
    var qh = 74;
    var qy = 60;
    G.render.panel(ctx, 96, qy, W - 192, qh, {
      fill: "rgba(74,63,51,.96)", stroke: "rgba(232,196,128,.55)", radius: 10
    });
    ctx.save();
    ctx.font = "bold 16px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#f2dfae";
    ctx.textBaseline = "middle";
    var top = node.promptLines ? node.promptLines : null;
    ctx.fillText(node.prompt || "", 120, qy + (top ? 24 : qh / 2));
    ctx.restore();

    var count = opts.length;
    var boxH = Math.min(64, Math.floor((H - qy - qh - 70) / Math.max(1, count)) - 8);
    boxH = Math.max(40, boxH);
    var startY = qy + qh + 12;

    for (var i = 0; i < count; i++) {
      var wrap = opts[i];
      var o = wrap.o;
      var y = startY + i * (boxH + 8);
      var x = 96, w = W - 192;
      var sel = (i === choiceSel);
      var locked = wrap.locked;

      lastOptionRects.push({ x: x, y: y, w: w, h: boxH });

      G.render.panel(ctx, x, y, w, boxH, {
        fill: locked ? "rgba(26,22,20,.86)" : (sel ? "rgba(52,40,26,.98)" : "rgba(28,23,19,.94)"),
        stroke: locked ? "rgba(120,110,100,.28)" : (sel ? "rgba(217,164,76,.95)" : "rgba(217,164,76,.22)"),
        radius: 9,
        lineWidth: sel ? 2.5 : 1.5
      });

      // number badge
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + 30, y + boxH / 2, 13, 0, Math.PI * 2);
      ctx.fillStyle = locked ? "rgba(60,56,50,.8)" : (sel ? "#d9a44c" : "rgba(217,164,76,.18)");
      ctx.fill();
      ctx.font = "bold 13px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = locked ? "rgba(180,170,155,.7)" : (sel ? "#1a1512" : "#d9a44c");
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(i + 1), x + 30, y + boxH / 2 + 0.5);
      ctx.restore();

      // text
      ctx.save();
      ctx.font = "15px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = locked ? "rgba(170,160,148,.55)" : (sel ? "#fff5e2" : "#e6dac8");
      ctx.textBaseline = "middle";
      var label = locked ? (o.lockedText || o.text) : o.text;
      var lines = G.util.wrapText(ctx, label, w - 90);
      if (lines.length > 1 && boxH < 52) lines = [lines[0]];
      var ly = y + boxH / 2 - (lines.length - 1) * 9;
      for (var li = 0; li < lines.length; li++) {
        ctx.fillText(lines[li], x + 56, ly + li * 18);
      }
      ctx.restore();

      // lock icon
      if (locked) {
        ctx.save();
        ctx.strokeStyle = "rgba(180,170,155,.4)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + w - 34, y + boxH / 2 - 7, 11, 9);
        ctx.beginPath();
        ctx.arc(x + w - 28.5, y + boxH / 2 - 7, 4, Math.PI, 0);
        ctx.stroke();
        ctx.restore();
      }
    }

    G.render.hint(ctx, "1-" + count + " yoki ↑↓ + ENTER — tanlash", visT);
    drawCopyButton(ctx);
  }

  function drawMulti(ctx) {
    var opts = availableOptions();
    lastOptionRects = [];
    var max = node.max || 99;
    var picked = multiPicked.length;

    var qh = 84;
    var qy = 48;
    G.render.panel(ctx, 96, qy, W - 192, qh, {
      fill: "rgba(74,63,51,.96)", stroke: "rgba(150,196,214,.6)", radius: 10
    });
    ctx.save();
    ctx.font = "bold 16px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#cfe2ea";
    ctx.textBaseline = "top";
    ctx.fillText(node.prompt || "", 120, qy + 16);
    ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.6)";
    ctx.fillText("Tanlandi: " + picked + " / " + max + "   ·   ENTER — davom etish", 120, qy + 52);
    ctx.restore();

    var count = opts.length;
    var boxH = 46;
    var startY = qy + qh + 12;

    for (var i = 0; i < count; i++) {
      var wrap = opts[i];
      var o = wrap.o;
      var y = startY + i * (boxH + 7);
      var x = 96, w = W - 192;
      var sel = (i === choiceSel);
      var locked = wrap.locked;
      var chosen = multiPicked.indexOf(o.id) !== -1;

      lastOptionRects.push({ x: x, y: y, w: w, h: boxH });

      G.render.panel(ctx, x, y, w, boxH, {
        fill: chosen ? "rgba(46,60,40,.96)" : (locked ? "rgba(26,22,20,.86)" : (sel ? "rgba(40,45,52,.98)" : "rgba(28,23,19,.94)")),
        stroke: chosen ? "rgba(127,184,107,.7)" : (locked ? "rgba(120,110,100,.28)" : (sel ? "rgba(140,190,210,.9)" : "rgba(140,190,210,.2)")),
        radius: 8,
        lineWidth: sel ? 2.5 : 1.5
      });

      ctx.save();
      ctx.beginPath();
      ctx.arc(x + 28, y + boxH / 2, 12, 0, Math.PI * 2);
      ctx.fillStyle = chosen ? "#7fb86b" : (locked ? "rgba(60,56,50,.8)" : (sel ? "#8fc3d9" : "rgba(140,190,210,.16)"));
      ctx.fill();
      ctx.font = "bold 12px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = chosen ? "#16210f" : (locked ? "rgba(180,170,155,.7)" : (sel ? "#10181c" : "#8fc3d9"));
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(chosen ? "✓" : String(i + 1), x + 28, y + boxH / 2 + 0.5);
      ctx.restore();

      ctx.save();
      ctx.font = "14px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = chosen ? "rgba(200,225,190,.9)" : (locked ? "rgba(170,160,148,.55)" : "#e6dac8");
      ctx.textBaseline = "middle";
      var label = locked ? (o.lockedText || o.text) : o.text;
      var lines = G.util.wrapText(ctx, label, w - 86);
      ctx.fillText(lines[0] + (lines.length > 1 ? "…" : ""), x + 52, y + boxH / 2);
      ctx.restore();
    }

    G.render.hint(ctx, "1-" + count + " — savol berish · ENTER — davom", visT);
    drawCopyButton(ctx);
  }

  return {
    startScene: startScene,
    update: update,
    draw: draw,
    handleInput: handleInput,
    isActive: function () { return active; },
    getSceneKey: function () { return sceneKey; },
    // debug/test hooks — used by tools/playtest.js
    debugNode: function () { return node; },
    debugNodeId: function () { return nodeId; },
    debugOptions: function () { return availableOptions().map(function (w) { return w.o; }); },
    debugTyping: function () { return typing; },
    debugPick: function (i) {
      if (!node) return false;
      if (node.type === "say") { advance(); return true; }
      if (node.type === "choice") { pickChoice(i); return true; }
      if (node.type === "multi") { pickMulti(i); return true; }
      return false;
    },
    debugFinishMulti: function () { finishMulti(); },
    // Test hooks for the copy control: what text would be copied for the node
    // currently on screen, and the button's hit rect.
    __copyForTest: function () { return copyTextFor(); },
    __copyRectForTest: function () { return copyButtonRect(); },
    __doCopyForTest: function () { doCopy(); }
  };
})();
