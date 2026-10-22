/* The menu (TAB): the chapter's teaching, what it wants you to learn, your own
   notes, and the raw record of the day.

   FOUR TABS, all Uzbek:
     Xulosalar  — the insight behind each interaction you actually had. This is
                  the point of the chapter: not what happened, but what it
                  taught. Built from the choiceNotes of the choices you made.
     Qaydlar    — your own notes. Add, edit and delete them here. They live in
                  G.state.userNotes, so they save and reload with the game.
     Ma'lumot   — the intel you gathered from people.
     Kundalik   — the story's own journal of the day, in order.

   Written for both keys and thumbs: every control is a clickable rect, and the
   arrow keys / number keys do the same thing. Text entry uses a real overlay
   textarea rather than a hand-rolled canvas keyboard, because that is what gets
   the native keyboard on a phone. */
window.G = window.G || {};

G.notebook = (function () {
  var W = 960, H = 600;
  var open = false;
  var tab = 0;
  var scroll = 0;
  var visT = 0;
  var tabRects = [];

  var TABS = ["Xulosalar", "Qaydlar", "Ma'lumot", "Kundalik"];

  /* ---- text entry ------------------------------------------------------
     A DOM textarea positioned over the canvas. It is the only reliable way to
     get a native keyboard on a phone and IME support for Uzbek characters, and
     it keeps working on file://. It is created lazily and hidden when unused. */
  var editor = null;         // the textarea
  var editorMode = null;     // "new" | "edit"
  var editorId = null;       // note id when editing
  var editorDraft = "";
  var composerOpen = false;
  var composerRect = null;
  var noteRects = [];        // per-note hit areas: { id, edit, del, body }
  var composerButtons = {};  // { save, cancel }

  function ensureEditor() {
    if (editor || typeof document === "undefined") return editor;
    var cv = document.getElementById("game");
    if (!cv) return null;
    var stage = cv.parentNode || document.body;
    editor = document.createElement("textarea");
    editor.id = "note-editor";
    editor.setAttribute("aria-label", "Qayd matni");
    editor.setAttribute("spellcheck", "false");
    editor.style.position = "absolute";
    editor.style.display = "none";
    editor.style.zIndex = "40";
    editor.style.boxSizing = "border-box";
    editor.style.resize = "none";
    editor.style.border = "1px solid rgba(217,164,76,.7)";
    editor.style.borderRadius = "8px";
    editor.style.background = "#3a3128";
    editor.style.color = "#f4ece0";
    editor.style.font = "14px 'Segoe UI', system-ui, sans-serif";
    editor.style.lineHeight = "20px";
    editor.style.padding = "8px 10px";
    editor.style.outline = "none";
    editor.style.boxShadow = "0 8px 24px rgba(0,0,0,.45)";
    editor.maxLength = 2000;

    // Keep the game's own key handling out of the textarea entirely: while it
    // has focus, WASD must type letters, not walk the hero.
    editor.addEventListener("keydown", function (e) {
      e.stopPropagation();
      if (e.key === "Escape") {
        e.preventDefault();
        cancelEditor();
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        commitEditor();
      }
    });
    editor.addEventListener("keyup", function (e) { e.stopPropagation(); });
    editor.addEventListener("input", function () { editorDraft = editor.value; });
    // A touch scroll inside the textarea must not move the page.
    editor.addEventListener("touchstart", function (e) { e.stopPropagation(); });
    editor.addEventListener("touchmove", function (e) { e.stopPropagation(); });

    stage.appendChild(editor);
    return editor;
  }

  /* Map a logical canvas rect to CSS pixels. The canvas is scaled by the
     #stage letterbox, so a fixed px position would drift on a phone. */
  function toCssRect(x, y, w, h) {
    var cv = document.getElementById("game");
    if (!cv) return null;
    var r = cv.getBoundingClientRect();
    var sx = r.width / W, sy = r.height / H;
    return {
      left: (r.left + x * sx) + "px",
      top: (r.top + y * sy) + "px",
      width: (w * sx) + "px",
      height: (h * sy) + "px",
      fontSize: Math.max(11, Math.round(14 * sy)) + "px"
    };
  }

  function positionEditor(rect) {
    var e = ensureEditor();
    if (!e) return;
    var c = toCssRect(rect.x, rect.y, rect.w, rect.h);
    if (!c) return;
    e.style.left = c.left;
    e.style.top = c.top;
    e.style.width = c.width;
    e.style.height = c.height;
    e.style.fontSize = c.fontSize;
  }

  function openEditor(mode, id, initial) {
    var e = ensureEditor();
    if (!e) return;
    editorMode = mode;
    editorId = id || null;
    editorDraft = initial || "";
    e.value = editorDraft;
    e.style.display = "block";
    positionEditor(composerTextRect());
    // Focus without scrolling the page on mobile.
    try { e.focus({ preventScroll: true }); } catch (err) { try { e.focus(); } catch (e2) {} }
    try { e.setSelectionRange(e.value.length, e.value.length); } catch (err2) {}
  }

  function hideEditor() {
    if (!editor) return;
    editor.style.display = "none";
    try { editor.blur(); } catch (e) {}
    editorMode = null;
    editorId = null;
    editorDraft = "";
  }

  function commitEditor() {
    var text = editor ? editor.value : editorDraft;
    if (editorMode === "edit" && editorId) {
      G.state.updateUserNote(editorId, text);
      G.audio.tick();
    } else {
      if (G.state.addUserNote(text)) G.audio.tick();
      else G.audio.bad();
    }
    hideEditor();
    composerOpen = false;
    G.memory.autosave("note");
  }

  function cancelEditor() {
    hideEditor();
    G.audio.tick();
  }

  /* ---- open / close ---------------------------------------------------- */

  function toggle() {
    open = !open;
    if (open) {
      visT = 0;
      G.audio.door();
    } else {
      hideEditor();
      composerOpen = false;
      G.audio.tick();
    }
  }

  function isOpen() { return open; }
  function close() {
    if (!open) return;
    open = false;
    hideEditor();
    composerOpen = false;
  }

  /* True while the player is typing: main.js must not treat keys as gameplay. */
  function isTyping() {
    return !!(editor && editor.style.display !== "none");
  }

  /* ---- geometry -------------------------------------------------------- */

  function panelRect() {
    var pw = 780, ph = 496;
    return { x: (W - pw) / 2, y: (H - ph) / 2, w: pw, h: ph };
  }
  function contentRect() {
    var p = panelRect();
    return { x: p.x + 26, y: p.y + 132, w: p.w - 52, h: p.h - 186 };
  }
  function composerTextRect() {
    var c = contentRect();
    return { x: c.x + 12, y: c.y + 44, w: c.w - 24, h: 74 };
  }
  function noteCardHeight() { return 58; }

  /* ---- update ---------------------------------------------------------- */

  function update(dt) {
    if (!open) return;
    visT += dt;

    if (G.input.wasPressed("tab")) {
      G.input.consume("tab");
      toggle();
      return;
    }
    if (isTyping()) {
      // The textarea owns the keyboard. Escape is handled by its own listener.
      if (G.input.wasPressed("escape")) { G.input.consume("escape"); cancelEditor(); }
      return;
    }
    if (G.input.wasPressed("escape")) {
      G.input.consume("escape");
      if (composerOpen) { composerOpen = false; hideEditor(); G.audio.tick(); }
      else toggle();
      return;
    }

    if (G.input.wasPressed("arrowright") || G.input.wasPressed("d")) {
      G.input.consume("arrowright"); G.input.consume("d");
      tab = (tab + 1) % TABS.length; scroll = 0; G.audio.tick();
    }
    if (G.input.wasPressed("arrowleft") || G.input.wasPressed("a")) {
      G.input.consume("arrowleft"); G.input.consume("a");
      tab = (tab - 1 + TABS.length) % TABS.length; scroll = 0; G.audio.tick();
    }
    if (G.input.wasPressed("arrowdown") || G.input.wasPressed("s")) {
      G.input.consume("arrowdown"); G.input.consume("s");
      scroll += 1; clampScroll();
    }
    if (G.input.wasPressed("arrowup") || G.input.wasPressed("w")) {
      G.input.consume("arrowup"); G.input.consume("w");
      scroll = Math.max(0, scroll - 1);
    }
    for (var k = 0; k < 4; k++) {
      var key = String(k + 1);
      if (G.input.wasPressed(key)) {
        G.input.consume(key);
        tab = k; scroll = 0; G.audio.tick();
      }
    }

    // "N" starts a new note from anywhere in the menu — the one shortcut worth
    // teaching, because writing something down is the whole point of the tab.
    if (G.input.wasPressed("n")) {
      G.input.consume("n");
      tab = 1; scroll = 0;
      startNewNote();
      return;
    }

    handlePointer();
  }

  function clampScroll() {
    var c = contentRect();
    var rows = Math.max(1, Math.floor((c.h - 20) / noteCardHeight()));
    var total = 0;
    if (tab === 1) total = G.state.userNotes().length;
    else if (tab === 2) total = G.state.intel.length;
    else if (tab === 3) total = G.state.journal.length;
    else total = maxRow();
    var maxScroll = Math.max(0, total - rows);
    if (scroll > maxScroll) scroll = maxScroll;
  }

  /* Xulosalar rows are principle-sized, so scrolling counts principles not cards. */
  function maxRow() { return 99; }

  function handlePointer() {
    var m = G.input.mouse;
    if (!m.clicked) return;

    // tabs
    for (var i = 0; i < tabRects.length; i++) {
      if (G.util.pointInRect(m.x, m.y, tabRects[i])) {
        tab = i; scroll = 0; G.audio.tick();
        return;
      }
    }

    // composer buttons
    if (composerOpen) {
      if (composerButtons.save && G.util.pointInRect(m.x, m.y, composerButtons.save)) {
        commitEditor(); return;
      }
      if (composerButtons.cancel && G.util.pointInRect(m.x, m.y, composerButtons.cancel)) {
        cancelEditor(); composerOpen = false; return;
      }
      // Tapping the text area focuses the real editor.
      if (composerButtons.field && G.util.pointInRect(m.x, m.y, composerButtons.field)) {
        if (!isTyping()) openEditor("new", null, "");
        return;
      }
      // A tap outside the composer while writing saves, which is what a player
      // expects and is far kinder than silently throwing the words away.
      if (editorMode === "new" && !G.util.pointInRect(m.x, m.y, composerTextRect())) {
        if (editorDraft) commitEditor(); else { composerOpen = false; hideEditor(); }
        return;
      }
    }

    // note rows
    if (tab === 1) {
      for (var r = 0; r < noteRects.length; r++) {
        var nr = noteRects[r];
        if (G.util.pointInRect(m.x, m.y, nr.edit)) {
          composerOpen = true; scroll = scroll; openEditor("edit", nr.id, nr.text);
          return;
        }
        if (G.util.pointInRect(m.x, m.y, nr.del)) {
          G.state.removeUserNote(nr.id);
          G.memory.autosave("note");
          G.audio.bad();
          return;
        }
      }
      if (composerButtons.adder && G.util.pointInRect(m.x, m.y, composerButtons.adder)) {
        startNewNote();
        return;
      }
    }
  }

  function startNewNote() {
    composerOpen = true;
    openEditor("new", null, "");
  }

  /* ---- draw ------------------------------------------------------------ */

  function draw(ctx) {
    if (!open) return;
    var p = G.util.clamp(visT / 0.16, 0, 1);
    var e = G.util.easeOut(p);

    ctx.save();
    ctx.globalAlpha = 0.84 * e;
    ctx.fillStyle = "#2e2820";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    ctx.restore();

    var pr = panelRect();
    var off = (1 - e) * 22;

    ctx.save();
    ctx.translate(0, off);

    G.render.panel(ctx, pr.x, pr.y, pr.w, pr.h, {
      fill: "rgba(72,61,49,.985)",
      stroke: "rgba(217,164,76,.6)",
      radius: 14,
      inner: true
    });

    drawHeader(ctx, pr);
    drawTabs(ctx, pr);

    // content, clipped
    var c = contentRect();
    ctx.save();
    ctx.beginPath();
    ctx.rect(c.x, c.y, c.w, c.h);
    ctx.clip();
    if (tab === 0) drawInsights(ctx, c);
    else if (tab === 1) drawNotes(ctx, c);
    else if (tab === 2) drawIntel(ctx, c);
    else drawJournal(ctx, c);
    ctx.restore();

    drawFooter(ctx, pr);
    ctx.restore();

    // The composer is drawn last so it sits above the list, and the textarea is
    // repositioned every frame in case the letterbox changed (rotate, resize).
    if (composerOpen) {
      drawComposer(ctx, pr);
      if (isTyping()) positionEditor(composerTextRect());
    }
  }

  function drawHeader(ctx, pr) {
    ctx.save();
    ctx.font = "bold 22px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#f2dfae";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Daftar", pr.x + 28, pr.y + 42);

    var ch = (G.chapters && G.chapters.current && G.chapters.current()) || null;
    ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.48)";
    ctx.fillText("Azizbek · Sulton School" + (ch && ch.title ? " · " + ch.title : ""), pr.x + 100, pr.y + 42);

    var tr = G.state.trust;
    ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.55)";
    ctx.textAlign = "right";
    ctx.fillText("Ishonch: " + G.state.trustLabel(), pr.x + pr.w - 28, pr.y + 32);
    ctx.restore();
    G.render.progressBar(ctx, pr.x + pr.w - 190, pr.y + 40, 162, 9, tr / 10,
      tr >= 7 ? "#7fb86b" : (tr >= 4 ? "#d9a44c" : "#c4553f"));
  }

  function drawTabs(ctx, pr) {
    tabRects = [];
    var tx = pr.x + 28;
    for (var i = 0; i < TABS.length; i++) {
      ctx.save();
      ctx.font = (i === tab ? "bold " : "") + "14px 'Segoe UI', system-ui, sans-serif";
      var tw = ctx.measureText(TABS[i]).width + 30;
      var r = { x: tx, y: pr.y + 66, w: tw, h: 32 };
      tabRects.push(r);
      G.util.roundRect(ctx, r.x, r.y, r.w, r.h, 7);
      ctx.fillStyle = i === tab ? "rgba(217,164,76,.22)" : "rgba(255,255,255,.035)";
      ctx.fill();
      if (i === tab) {
        ctx.strokeStyle = "rgba(217,164,76,.7)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.fillStyle = i === tab ? "#f2dfae" : "rgba(244,236,224,.55)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(TABS[i], r.x + r.w / 2, r.y + r.h / 2 + 1);

      // a count badge where a count is meaningful
      var n = i === 1 ? G.state.userNotes().length : (i === 2 ? G.state.intel.length : 0);
      if (n > 0) {
        ctx.font = "10px 'Segoe UI', system-ui, sans-serif";
        ctx.fillStyle = "rgba(244,236,224,.45)";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(String(n), r.x + r.w + 6, r.y + r.h / 2 + 1);
      }
      ctx.restore();
      tx += tw + (n > 0 ? 22 : 10);
    }
  }

  function drawFooter(ctx, pr) {
    ctx.save();
    ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.4)";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    var hint = tab === 1
      ? "← → bo'lim · N — yangi qayd · TAB yopish"
      : "← → bo'lim · TAB yopish";
    ctx.fillText(hint, pr.x + pr.w / 2, pr.y + pr.h - 18);
    ctx.restore();
  }

  /* ---- Xulosalar: the point of the chapter -----------------------------
     Every dialogue choice carries a choiceNote: the principle it touches, the
     verdict, why it mattered, what it cost, and what to do instead. This tab
     shows the notes for the choices this player actually made — so it is a
     record of what this run taught, not a generic lesson list. */
  function drawInsights(ctx, c) {
    var learning = (G.data && G.data.learning) || {};
    var all = learning.choiceNotes || {};
    var principles = learning.principles || {};
    var made = G.state.choicesMade;
    var marks = G.state.marks;

    ctx.save();
    ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.5)";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Bu bob o'rgatmoqchi bo'lgan fikrlar — sizning tanlovlaringiz bo'yicha", c.x, c.y + 2);
    ctx.restore();

    // Which notes belong to this run: everything for a choice that was made.
    var seen = {};
    var ids = [];
    for (var i = 0; i < made.length; i++) {
      var cid = made[i];
      if (seen[cid] || !all[cid]) continue;
      seen[cid] = true;
      ids.push(cid);
    }
    if (!ids.length) {
      // Fall back to principles touched by scored notes, so the tab is never
      // empty for a run whose choices were all engine-driven.
      var notes = G.state.notes;
      for (var n = 0; n < notes.length; n++) {
        var pid = notes[n].principle;
        if (pid && principles[pid] && !seen["p:" + pid]) { seen["p:" + pid] = true; ids.push("p:" + pid); }
      }
    }

    if (!ids.length) {
      ctx.save();
      ctx.font = "italic 13px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(244,236,224,.34)";
      ctx.textAlign = "left";
      ctx.fillText("Hali xulosa yo'q. Odamlar bilan gaplashing va tanlov qiling —", c.x, c.y + 34);
      ctx.fillText("shundan keyin bu yerda bobning asosiy fikrlari paydo bo'ladi.", c.x, c.y + 54);
      ctx.restore();
      return;
    }

    var y = c.y + 22 - scroll * 30;
    var verdictColor = {
      good: "#8fc47a", ok: "#d9c06c", weak: "#d9a44c", bad: "#c4553f"
    };
    var verdictWord = { good: "to'g'ri", ok: "yaxshi", weak: "bo'sh", bad: "xato" };

    for (var k = 0; k < ids.length; k++) {
      var id = ids[k];
      var isPrinciple = id.indexOf("p:") === 0;
      var note = isPrinciple ? null : all[id];
      var pr = isPrinciple ? principles[id.slice(2)] : principles[note.principle];
      if (!pr) { if (isPrinciple) continue; }

      var title = isPrinciple ? (pr.name || "") : (note.title || pr.name || "");
      var body = isPrinciple
        ? (pr.gist || "")
        : ((note.why || "") + (note.alternative ? "  →  " + note.alternative : ""));
      var lines = wrap(ctx, body, c.w - 28, "12px 'Segoe UI', system-ui, sans-serif");
      var cardH = 46 + lines.length * 17;
      if (y < c.y + c.h && y + cardH > c.y) {
        drawInsightCard(ctx, c.x, y, c.w, cardH, title, lines, note ? note.verdict : null,
          verdictColor, verdictWord, pr, note);
      }
      y += cardH + 12;
    }
  }

  function drawInsightCard(ctx, x, y, w, h, title, lines, verdict, colors, words, pr, note) {
    G.render.panel(ctx, x, y, w, h, {
      fill: "rgba(94,80,64,.72)",
      stroke: "rgba(232,196,128,.32)",
      radius: 8
    });

    // verdict chip
    if (verdict && colors[verdict]) {
      var label = words[verdict] || verdict;
      ctx.save();
      ctx.font = "bold 10px 'Segoe UI', system-ui, sans-serif";
      var cw = ctx.measureText(label).width + 14;
      G.util.roundRect(ctx, x + w - cw - 12, y + 12, cw, 18, 9);
      ctx.fillStyle = colors[verdict] + "33";
      ctx.fill();
      ctx.fillStyle = colors[verdict];
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, x + w - cw / 2 - 12, y + 21);
      ctx.restore();
    }

    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = "bold 13px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#f2dfae";
    ctx.fillText(clip(ctx, title, w - 90), x + 14, y + 24);

    if (pr && pr.name && title !== pr.name) {
      ctx.font = "10px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(232,196,128,.6)";
      ctx.fillText(clip(ctx, pr.name, w - 90), x + 14, y + 39);
    }
    ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(240,230,216,.82)";
    var ty = y + (pr && pr.name && title !== pr.name ? 56 : 42);
    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x + 14, ty + i * 17);
    }
    ctx.restore();
  }

  /* ---- Qaydlar: my own notes ------------------------------------------ */
  function drawNotes(ctx, c) {
    var notes = G.state.userNotes();

    // the "add" affordance, always visible at the top of the tab
    var addR = { x: c.x, y: c.y + 6, w: 168, h: 30 };
    composerButtons.adder = addR;
    G.util.roundRect(ctx, addR.x, addR.y, addR.w, addR.h, 7);
    ctx.save();
    ctx.fillStyle = "rgba(217,164,76,.2)";
    ctx.fill();
    ctx.strokeStyle = "rgba(217,164,76,.6)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.font = "bold 12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#f2dfae";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("+  Yangi qayd  (N)", addR.x + addR.w / 2, addR.y + addR.h / 2 + 1);
    ctx.restore();

    ctx.save();
    ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.4)";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(notes.length + " qayd", c.x + c.w, c.y + 21);
    ctx.restore();

    noteRects = [];
    if (!notes.length) {
      ctx.save();
      ctx.font = "italic 13px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(244,236,224,.34)";
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("Hali qayd yo'q. Darsdan keyin bir gap yozib qo'ying —", c.x, c.y + 62);
      ctx.fillText("keyingi safar o'zingizga tashakkur aytasiz.", c.x, c.y + 82);
      ctx.restore();
      return;
    }

    var y = c.y + 48 - scroll * noteCardHeight();
    for (var i = 0; i < notes.length; i++) {
      var n = notes[i];
      var h = noteCardHeight();
      if (y + h > c.y + 44 && y < c.y + c.h) {
        G.render.panel(ctx, c.x, y, c.w, h, {
          fill: "rgba(88,76,60,.7)",
          stroke: "rgba(217,164,76,.26)",
          radius: 8
        });
        ctx.save();
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.font = "13px 'Segoe UI', system-ui, sans-serif";
        ctx.fillStyle = "rgba(244,238,228,.92)";
        var lines = wrap(ctx, n.text, c.w - 150, "13px 'Segoe UI', system-ui, sans-serif");
        ctx.fillText(lines[0] || "", c.x + 14, y + 24);
        if (lines.length > 1) {
          ctx.fillStyle = "rgba(244,238,228,.55)";
          ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
          ctx.fillText(lines[1], c.x + 14, y + 43);
        }
        if (n.at) {
          ctx.font = "10px 'Segoe UI', system-ui, sans-serif";
          ctx.fillStyle = "rgba(244,236,224,.32)";
          ctx.fillText(fmtDate(n.at), c.x + 14, y + h - 8);
        }
        ctx.restore();

        // edit / delete controls
        var editR = { x: c.x + c.w - 116, y: y + 15, w: 48, h: 26 };
        var delR = { x: c.x + c.w - 60, y: y + 15, w: 46, h: 26 };
        drawMiniButton(ctx, editR, "Tahrir", "rgba(217,164,76,.5)");
        drawMiniButton(ctx, delR, "O'chir", "rgba(196,85,63,.6)");
        noteRects.push({ id: n.id, text: n.text, edit: editR, del: delR });
      }
      y += h + 8;
    }
  }

  function drawMiniButton(ctx, r, label, stroke) {
    G.util.roundRect(ctx, r.x, r.y, r.w, r.h, 6);
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.05)";
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.8)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, r.x + r.w / 2, r.y + r.h / 2 + 1);
    ctx.restore();
  }

  function drawComposer(ctx, pr) {
    var t = composerTextRect();
    var boxY = t.y - 40;
    var boxH = 132;

    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#241f19";
    ctx.fillRect(pr.x, pr.y, pr.w, pr.h);
    ctx.restore();

    G.render.panel(ctx, t.x - 12, boxY, t.w + 24, boxH, {
      fill: "rgba(58,49,40,.99)",
      stroke: "rgba(217,164,76,.75)",
      radius: 10,
      inner: true
    });

    ctx.save();
    ctx.font = "bold 13px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#f2dfae";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(editorMode === "edit" ? "Qaydni tahrirlash" : "Yangi qayd", t.x - 4, boxY + 22);
    ctx.font = "10px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.42)";
    ctx.fillText("Ctrl+Enter — saqlash · Esc — bekor qilish", t.x + 120, boxY + 22);
    ctx.restore();

    // The textarea paints the text itself when focused; when a phone has not
    // focused it yet, draw the draft so the player is not staring at a blank box.
    if (!isTyping()) {
      G.util.roundRect(ctx, t.x, t.y, t.w, t.h, 8);
      ctx.save();
      ctx.fillStyle = "rgba(30,26,21,.75)";
      ctx.fill();
      ctx.strokeStyle = "rgba(217,164,76,.4)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.font = "14px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = editorDraft ? "#f4ece0" : "rgba(244,236,224,.3)";
      ctx.textAlign = "left";
      ctx.fillText(editorDraft || "Shu yerga yozing…", t.x + 10, t.y + 26);
      ctx.restore();
    }

    var saveR = { x: t.x + t.w - 216, y: boxY + boxH - 44, w: 100, h: 30 };
    var cancelR = { x: t.x + t.w - 108, y: boxY + boxH - 44, w: 100, h: 30 };
    composerButtons.save = saveR;
    composerButtons.cancel = cancelR;
    composerButtons.field = t;
    drawMiniButton(ctx, saveR, "Saqlash", "rgba(127,184,107,.8)");
    drawMiniButton(ctx, cancelR, "Bekor", "rgba(196,85,63,.7)");
  }

  /* ---- Ma'lumot: the intel you gathered ------------------------------- */
  function drawIntel(ctx, c) {
    var intel = G.state.intel;
    var learning = (G.data && G.data.learning) || {};
    var meta = learning.intel || {};

    ctx.save();
    ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.5)";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Odamlardan eshitganlarim", c.x, c.y + 2);
    ctx.restore();

    if (!intel.length) {
      ctx.save();
      ctx.font = "italic 13px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(244,236,224,.34)";
      ctx.textAlign = "left";
      ctx.fillText("Hali hech narsa bilmayman. Odamlar bilan gaplashish kerak.", c.x, c.y + 36);
      ctx.restore();
      return;
    }

    var y = c.y + 20 - scroll * 40;
    for (var i = 0; i < intel.length; i++) {
      var id = intel[i];
      var m = meta[id] || { label: id, usedFor: "" };
      if (y + 34 > c.y + 16 && y < c.y + c.h) {
        G.render.panel(ctx, c.x, y, c.w, 34, {
          fill: "rgba(96,116,92,.42)", stroke: "rgba(127,184,107,.38)", radius: 7
        });
        ctx.save();
        ctx.font = "13px 'Segoe UI', system-ui, sans-serif";
        ctx.fillStyle = "#d9e8cf";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText("• " + m.label, c.x + 14, y + 17);
        if (m.usedFor) {
          ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
          ctx.fillStyle = "rgba(200,225,190,.5)";
          ctx.textAlign = "right";
          ctx.fillText(m.usedFor, c.x + c.w - 14, y + 17);
        }
        ctx.restore();
      }
      y += 38;
    }
  }

  /* ---- Kundalik: the day as it happened ------------------------------- */
  function drawJournal(ctx, c) {
    var j = G.state.journal;
    ctx.save();
    ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.5)";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Bugungi kundan yozganlarim", c.x, c.y + 2);
    ctx.restore();

    if (!j.length) {
      ctx.save();
      ctx.font = "italic 13px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(244,236,224,.34)";
      ctx.textAlign = "left";
      ctx.fillText("Bugun hali hech narsa yozmadim.", c.x, c.y + 36);
      ctx.restore();
      return;
    }

    var y = c.y + 22 - scroll * 20;
    for (var i = 0; i < j.length; i++) {
      var lines = wrap(ctx, j[i].text, c.w - 16, "13px 'Segoe UI', system-ui, sans-serif");
      for (var l = 0; l < lines.length; l++) {
        if (y > c.y && y < c.y + c.h) {
          ctx.save();
          ctx.font = "13px 'Segoe UI', system-ui, sans-serif";
          ctx.fillStyle = "rgba(240,230,216,.85)";
          ctx.textAlign = "left";
          ctx.textBaseline = "alphabetic";
          ctx.fillText(lines[l], c.x + 6, y);
          ctx.restore();
        }
        y += 19;
      }
      y += 7;
    }
  }

  /* ---- helpers --------------------------------------------------------- */

  function wrap(ctx, text, maxW, font) {
    ctx.save();
    if (font) ctx.font = font;
    var lines = G.util.wrapText(ctx, text, maxW);
    ctx.restore();
    return lines;
  }

  function clip(ctx, text, maxW) {
    if (!text) return "";
    if (ctx.measureText(text).width <= maxW) return text;
    var t = text;
    while (t.length > 4 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
    return t + "…";
  }

  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    var dd = d.getDate(), mm = d.getMonth() + 1;
    var hh = d.getHours(), mi = d.getMinutes();
    function p(n) { return n < 10 ? "0" + n : String(n); }
    return p(dd) + "." + p(mm) + " " + p(hh) + ":" + p(mi);
  }

  return {
    toggle: toggle,
    close: close,
    update: update,
    draw: draw,
    isOpen: isOpen,
    isTyping: isTyping,
    // test hooks
    __tabs: function () { return TABS.slice(); },
    __tab: function () { return tab; },
    __setTab: function (i) { tab = i; scroll = 0; },
    __noteRects: function () { return noteRects.length; },
    __openEditor: function (mode, id, text) { openEditor(mode, id, text); },
    __commit: function () { commitEditor(); },
    __type: function (t) { if (editor) { editor.value = t; editorDraft = t; } },
    __composerOpen: function () { return composerOpen; }
  };
})();
