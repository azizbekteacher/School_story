/* Notebook (TAB): intel gathered, journal, principles learned, trust. GTA-style info page. */
window.G = window.G || {};

G.notebook = (function () {
  var W = 960, H = 600;
  var open = false;
  var tab = 0;             // 0 intel, 1 journal, 2 principles
  var scroll = 0;
  var visT = 0;

  var TABS = ["Ma'lumot", "Kundalik", "Tamoyillar"];

  function toggle() {
    open = !open;
    if (open) { visT = 0; G.audio.door(); }
    else G.audio.tick();
  }

  function isOpen() { return open; }
  function close() { open = false; }

  function update(dt) {
    if (!open) return;
    visT += dt;

    if (G.input.wasPressed("tab") || G.input.wasPressed("escape")) {
      G.input.consume("tab"); G.input.consume("escape");
      toggle();
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
      scroll += 1;
    }
    if (G.input.wasPressed("arrowup") || G.input.wasPressed("w")) {
      G.input.consume("arrowup"); G.input.consume("w");
      scroll = Math.max(0, scroll - 1);
    }
    if (G.input.wasPressed("1")) { G.input.consume("1"); tab = 0; scroll = 0; }
    if (G.input.wasPressed("2")) { G.input.consume("2"); tab = 1; scroll = 0; }
    if (G.input.wasPressed("3")) { G.input.consume("3"); tab = 2; scroll = 0; }

    // tab click
    for (var i = 0; i < tabRects.length; i++) {
      if (G.util.pointInRect(G.input.mouse.x, G.input.mouse.y, tabRects[i])) {
        if (G.input.mouse.clicked) { tab = i; scroll = 0; G.audio.tick(); }
      }
    }
  }

  var tabRects = [];

  function draw(ctx) {
    if (!open) return;
    var p = G.util.clamp(visT / 0.16, 0, 1);
    var e = G.util.easeOut(p);

    ctx.save();
    ctx.globalAlpha = 0.82 * e;
    ctx.fillStyle = "#3d342b";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    ctx.restore();

    var pw = 760, ph = 480;
    var px = (W - pw) / 2, py = (H - ph) / 2;
    var off = (1 - e) * 24;

    ctx.save();
    ctx.translate(0, off);

    G.render.panel(ctx, px, py, pw, ph, {
      fill: "rgba(78,66,53,.985)",
      stroke: "rgba(217,164,76,.6)",
      radius: 14,
      inner: true
    });

    // header
    ctx.save();
    ctx.font = "bold 22px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#f2dfae";
    ctx.fillText("Daftar", px + 30, py + 44);
    ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.5)";
    ctx.fillText("Azizbek · Sulton School · 1-kun", px + 30, py + 64);
    ctx.restore();

    // trust meter top-right
    var tr = G.state.trust;
    ctx.save();
    ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.6)";
    ctx.textAlign = "right";
    ctx.fillText("Timur bilan ishonch: " + G.state.trustLabel(), px + pw - 30, py + 40);
    ctx.restore();
    G.render.progressBar(ctx, px + pw - 190, py + 48, 160, 10, tr / 10,
      tr >= 7 ? "#7fb86b" : (tr >= 4 ? "#d9a44c" : "#c4553f"));

    // tabs
    tabRects = [];
    var tx = px + 30;
    for (var i = 0; i < TABS.length; i++) {
      ctx.save();
      ctx.font = (i === tab ? "bold " : "") + "14px 'Segoe UI', system-ui, sans-serif";
      var tw = ctx.measureText(TABS[i]).width + 28;
      var r = { x: tx, y: py + 84, w: tw, h: 30 };
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
      ctx.restore();
      tx += tw + 10;
    }

    // content area
    ctx.save();
    ctx.beginPath();
    ctx.rect(px + 24, py + 126, pw - 48, ph - 170);
    ctx.clip();
    if (tab === 0) drawIntel(ctx, px + 30, py + 132, pw - 60);
    else if (tab === 1) drawJournal(ctx, px + 30, py + 132, pw - 60);
    else drawPrinciples(ctx, px + 30, py + 132, pw - 60);
    ctx.restore();

    // footer
    ctx.save();
    ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.42)";
    ctx.textAlign = "center";
    ctx.fillText("← → bo'lim · TAB yopish", px + pw / 2, py + ph - 20);
    ctx.restore();

    ctx.restore();
  }

  function drawIntel(ctx, x, y, w) {
    var intel = G.state.intel;
    var learning = (G.data && G.data.learning) || {};
    var meta = learning.intel || {};

    ctx.save();
    ctx.font = "13px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.55)";
    ctx.fillText("Bilganlarim — Timur haqida", x, y);
    ctx.restore();
    y += 26;

    if (!intel.length) {
      ctx.save();
      ctx.font = "italic 14px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(244,236,224,.32)";
      ctx.fillText("Hali hech narsa bilmayman. Odamlar bilan gaplashish kerak.", x, y + 14);
      ctx.restore();
      return;
    }

    for (var i = 0; i < intel.length; i++) {
      var id = intel[i];
      var m = meta[id] || { label: id, usedFor: "" };
      var yy = y + i * 44;
      G.render.panel(ctx, x, yy, w, 36, {
        fill: "rgba(96,116,92,.45)", stroke: "rgba(127,184,107,.4)", radius: 7
      });
      ctx.save();
      ctx.font = "13px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "#d9e8cf";
      ctx.textBaseline = "middle";
      ctx.fillText("• " + m.label, x + 14, yy + 18);
      if (m.usedFor) {
        ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
        ctx.fillStyle = "rgba(200,225,190,.5)";
        ctx.textAlign = "right";
        ctx.fillText(m.usedFor, x + w - 14, yy + 18);
      }
      ctx.restore();
    }
  }

  function drawJournal(ctx, x, y, w) {
    var j = G.state.journal;
    ctx.save();
    ctx.font = "13px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.55)";
    ctx.fillText("Bugungi kundan yozganlarim", x, y);
    ctx.restore();
    y += 26;

    if (!j.length) {
      ctx.save();
      ctx.font = "italic 14px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(244,236,224,.32)";
      ctx.fillText("Bugun hali hech narsa yozmadim.", x, y + 14);
      ctx.restore();
      return;
    }
    var yy = y - scroll * 20;
    for (var i = 0; i < j.length; i++) {
      var lines = wrap(ctx, j[i].text, w - 20, "14px 'Segoe UI', system-ui, sans-serif");
      for (var l = 0; l < lines.length; l++) {
        if (yy > y - 30 && yy < H - 100) {
          ctx.save();
          ctx.font = "14px 'Segoe UI', system-ui, sans-serif";
          ctx.fillStyle = "rgba(240,230,216,.85)";
          ctx.fillText(lines[l], x + 8, yy);
          ctx.restore();
        }
        yy += 20;
      }
      yy += 6;
    }
  }

  function drawPrinciples(ctx, x, y, w) {
    var learning = (G.data && G.data.learning) || {};
    var principles = learning.principles || {};
    var encountered = {};

    // principles touched by notes
    var notes = G.state.notes;
    for (var i = 0; i < notes.length; i++) encountered[notes[i].principle] = true;

    ctx.save();
    ctx.font = "13px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.55)";
    ctx.fillText("O'rgangan tamoyillarim", x, y);
    ctx.restore();
    y += 26;

    var ids = Object.keys(principles);
    var shown = 0;
    for (var k = 0; k < ids.length; k++) {
      var id = ids[k];
      if (!encountered[id]) continue;
      var p = principles[id];
      var yy = y + shown * 62 - scroll * 20;
      if (yy > y - 70 && yy < H - 120) {
        G.render.panel(ctx, x, yy, w, 54, {
          fill: "rgba(96,82,68,.72)", stroke: "rgba(232,196,128,.4)", radius: 7
        });
        ctx.save();
        ctx.font = "bold 13px 'Segoe UI', system-ui, sans-serif";
        ctx.fillStyle = "#f2dfae";
        ctx.fillText(p.name || id, x + 14, yy + 20);
        ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
        ctx.fillStyle = "rgba(244,236,224,.55)";
        var gist = wrap(ctx, p.gist || "", w - 28, "11px 'Segoe UI', system-ui, sans-serif");
        ctx.fillText(gist[0] || "", x + 14, yy + 38);
        ctx.restore();
      }
      shown++;
    }
    if (!shown) {
      ctx.save();
      ctx.font = "italic 14px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(244,236,224,.32)";
      ctx.fillText("Tanlovlar qilganingizda tamoyillar shu yerda paydo bo'ladi.", x, y + 14);
      ctx.restore();
    }
  }

  function wrap(ctx, text, maxW, font) {
    ctx.save();
    if (font) ctx.font = font;
    var lines = G.util.wrapText(ctx, text, maxW);
    ctx.restore();
    return lines;
  }

  return {
    toggle: toggle,
    close: close,
    update: update,
    draw: draw,
    isOpen: isOpen
  };
})();
