/* Debrief: the teaching moment. Score by principle, archetype, ideas, difficulties. */
window.G = window.G || {};

G.debrief = (function () {
  var W = 960, H = 600;
  var visible = false;
  var t = 0;
  var page = 0;              // 0 score, 1 notes, 2 ideas, 3 difficulties
  var scroll = 0;
  var PAGES = ["Natija", "Tanlovlar", "G'oyalar", "Qiyinchiliklar"];
  var cached = null;

  /* Two modes share one panel:
     - "final"    the end-of-mission debrief. Terminal; no close control.
     - "overview" the same four tabs, opened at any time from MENYU. Read-only
                  and closeable, so a player can check what a chapter has taught
                  so far without ending the mission. */
  var mode = "final";

  function show() {
    visible = true;
    mode = "final";
    t = 0;
    page = 0;
    scroll = 0;
    G.state.finished = true;
    cached = buildSummary();
    G.audio.win();
    if (G.world) G.world.freeze(true);
  }

  /* Open the same panel as a read-only overview, mid-mission. */
  function openOverview() {
    if (visible) return false;
    visible = true;
    mode = "overview";
    t = 0;
    page = 0;
    scroll = 0;
    cached = buildSummary();
    G.audio.select();
    if (G.world) G.world.freeze(true);
    return true;
  }

  function hide() {
    visible = false;
    if (G.world) G.world.freeze(false);
  }

  function isVisible() { return visible; }
  function isOverview() { return visible && mode === "overview"; }
  function isFinal() { return visible && mode === "final"; }

  function buildSummary() {
    var learning = (G.data && G.data.learning) || {};
    var principles = learning.principles || {};
    var choiceNotes = learning.choiceNotes || {};
    var notes = G.state.notes;
    var scores = G.state.scores;

    // per principle aggregation
    var byPrinciple = [];
    for (var pid in scores) {
      if (!scores.hasOwnProperty(pid)) continue;
      byPrinciple.push({
        id: pid,
        name: (principles[pid] && principles[pid].name) || pid,
        good: scores[pid].good,
        bad: scores[pid].bad,
        notes: scores[pid].notes,
        gist: principles[pid] ? principles[pid].gist : ""
      });
    }
    byPrinciple.sort(function (a, b) {
      return (b.good - b.bad) - (a.good - a.bad);
    });

    // per-choice feedback
    var choiceFeedback = [];
    var seen = {};
    for (var i = 0; i < G.state.choicesMade.length; i++) {
      var cid = G.state.choicesMade[i];
      if (seen[cid]) continue;
      seen[cid] = true;
      var cn = choiceNotes[cid];
      if (cn) {
        choiceFeedback.push({
          id: cid,
          verdict: cn.verdict || "ok",
          title: cn.title || cid,
          why: cn.why || "",
          cost: cn.cost || null,
          alternative: cn.alternative || null
        });
      }
    }

    var avg = G.state.avgQuality();
    var archetype = pickArchetype(avg, learning.archetypes || []);

    var ideas = (learning.ideas || []).slice();
    var firstWeek = ideas.filter(function (x) { return x.firstWeek; });
    ideas.sort(function (a, b) { return (b.firstWeek ? 1 : 0) - (a.firstWeek ? 1 : 0); });

    return {
      avg: avg,
      trust: G.state.trust,
      notes: notes,
      byPrinciple: byPrinciple,
      choiceFeedback: choiceFeedback,
      archetype: archetype,
      ideas: ideas,
      firstWeek: firstWeek,
      difficulties: learning.difficulties || [],
      intel: G.state.intel.slice()
    };
  }

  function pickArchetype(avg, archetypes) {
    // highest minAvg that we satisfy, else lowest
    var best = null, bestScore = -Infinity;
    for (var i = 0; i < archetypes.length; i++) {
      var a = archetypes[i];
      var w = a.when || {};
      if (w.minAvg !== undefined && avg < w.minAvg) continue;
      if (w.maxAvg !== undefined && avg > w.maxAvg) continue;
      if (w.requiresIntel) {
        var ok = true;
        for (var k = 0; k < w.requiresIntel.length; k++) {
          if (!G.state.hasIntel(w.requiresIntel[k])) { ok = false; break; }
        }
        if (!ok) continue;
      }
      if (w.requiresFlags) {
        var ok2 = true;
        for (var m = 0; m < w.requiresFlags.length; m++) {
          if (!G.state.hasFlag(w.requiresFlags[m])) { ok2 = false; break; }
        }
        if (!ok2) continue;
      }
      var score = (w.minAvg !== undefined ? w.minAvg : 0);
      if (score > bestScore) { bestScore = score; best = a; }
    }
    return best || archetypes[0] || null;
  }

  function update(dt) {
    if (!visible) return;
    t += dt;

    // overview is dismissible; the final debrief is terminal
    if (mode === "overview") {
      if (G.input.wasPressed("escape") || G.input.wasPressed("tab")) {
        G.input.consume("escape"); G.input.consume("tab");
        hide();
        G.audio.tick();
        return;
      }
      if (closeRect && G.input.mouse.clicked &&
          G.util.pointInRect(G.input.mouse.x, G.input.mouse.y, closeRect)) {
        hide();
        G.audio.tick();
        return;
      }
    }

    if (G.input.wasPressed("arrowright")) {
      G.input.consume("arrowright");
      page = (page + 1) % PAGES.length; scroll = 0; G.audio.tick();
    }
    if (G.input.wasPressed("arrowleft")) {
      G.input.consume("arrowleft");
      page = (page - 1 + PAGES.length) % PAGES.length; scroll = 0; G.audio.tick();
    }
    if (G.input.wasPressed("arrowdown") || G.input.wasPressed("s")) {
      G.input.consume("arrowdown"); G.input.consume("s"); scroll += 1;
    }
    if (G.input.wasPressed("arrowup") || G.input.wasPressed("w")) {
      G.input.consume("arrowup"); G.input.consume("w"); scroll = Math.max(0, scroll - 1);
    }
    for (var i = 0; i < 4; i++) {
      var k = String(i + 1);
      if (G.input.wasPressed(k)) { G.input.consume(k); page = i; scroll = 0; }
    }
    for (var j = 0; j < tabRects.length; j++) {
      if (G.util.pointInRect(G.input.mouse.x, G.input.mouse.y, tabRects[j]) && G.input.mouse.clicked) {
        page = j; scroll = 0; G.audio.tick();
      }
    }
  }

  var tabRects = [];
  var closeRect = null;

  function draw(ctx) {
    if (!visible || !cached) return;
    var e = G.util.easeOut(G.util.clamp(t / 0.35, 0, 1));

    ctx.save();
    ctx.fillStyle = "rgba(52,44,36," + (0.93 * e) + ")";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = e;

    var pw = 840, ph = 540;
    var px = (W - pw) / 2, py = (H - ph) / 2 - (1 - e) * 20;

    G.render.panel(ctx, px, py, pw, ph, {
      fill: "rgba(72,61,49,.99)",
      stroke: "rgba(217,164,76,.55)",
      radius: 14,
      inner: true
    });

    // header — the title differs by mode, because the final debrief is a
    // verdict and the overview is a look back at what has been taught so far.
    var storyTitle = (G.data && G.data.story && G.data.story.title) || "Tahlil";
    ctx.save();
    ctx.font = "bold 26px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#f2dfae";
    ctx.fillText(mode === "final" ? "Birinchi kun — tahlil" : storyTitle + " — tahlil", px + 34, py + 48);
    ctx.font = "13px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.5)";
    ctx.fillText(mode === "final"
      ? "Unreasonable Hospitality tamoyillari bo'yicha"
      : "Hozirgacha o'rganilgan tamoyillar", px + 34, py + 70);
    ctx.restore();

    // score badge
    var goodCount = 0, badCount = 0;
    for (var i = 0; i < cached.notes.length; i++) {
      var v = cached.notes[i].verdict;
      if (v === "good") goodCount++;
      else if (v === "bad") badCount++;
    }
    ctx.save();
    ctx.textAlign = "right";
    ctx.font = "bold 15px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#7fb86b";
    ctx.fillText(goodCount + " kuchli", px + pw - 150, py + 42);
    ctx.fillStyle = "#c4553f";
    ctx.fillText(badCount + " zaif", px + pw - 34, py + 42);
    ctx.restore();

    // trust meter
    ctx.save();
    ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.55)";
    ctx.textAlign = "right";
    ctx.fillText("Timur ishonchi: " + G.state.trustLabel(), px + pw - 34, py + 62);
    ctx.restore();
    G.render.progressBar(ctx, px + pw - 200, py + 70, 166, 9, G.state.trust / 10,
      G.state.trust >= 7 ? "#7fb86b" : (G.state.trust >= 4 ? "#d9a44c" : "#c4553f"));

    // close affordance — overview only. The final debrief has no way out by
    // design, so this must never appear in "final" mode.
    closeRect = null;
    if (mode === "overview") {
      var cr = { x: px + pw - 46, y: py + 24, w: 22, h: 22 };
      closeRect = cr;
      ctx.save();
      G.util.roundRect(ctx, cr.x, cr.y, cr.w, cr.h, 6);
      ctx.fillStyle = "rgba(255,255,255,.05)";
      ctx.fill();
      ctx.strokeStyle = "rgba(244,236,224,.35)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.strokeStyle = "rgba(244,236,224,.75)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cr.x + 7, cr.y + 7);
      ctx.lineTo(cr.x + cr.w - 7, cr.y + cr.h - 7);
      ctx.moveTo(cr.x + cr.w - 7, cr.y + 7);
      ctx.lineTo(cr.x + 7, cr.y + cr.h - 7);
      ctx.stroke();
      ctx.restore();
    }

    // tabs
    tabRects = [];
    var tx = px + 34;
    for (var p = 0; p < PAGES.length; p++) {
      ctx.save();
      ctx.font = (p === page ? "bold " : "") + "13px 'Segoe UI', system-ui, sans-serif";
      var tw = ctx.measureText(PAGES[p]).width + 26;
      var r = { x: tx, y: py + 92, w: tw, h: 28 };
      tabRects.push(r);
      G.util.roundRect(ctx, r.x, r.y, r.w, r.h, 7);
      ctx.fillStyle = p === page ? "rgba(217,164,76,.22)" : "rgba(255,255,255,.03)";
      ctx.fill();
      if (p === page) {
        ctx.strokeStyle = "rgba(217,164,76,.65)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
      ctx.fillStyle = p === page ? "#f2dfae" : "rgba(244,236,224,.5)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(PAGES[p], r.x + r.w / 2, r.y + r.h / 2 + 1);
      ctx.restore();
      tx += tw + 8;
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(px + 26, py + 132, pw - 52, ph - 180);
    ctx.clip();
    if (page === 0) drawScore(ctx, px + 34, py + 140, pw - 68);
    else if (page === 1) drawChoices(ctx, px + 34, py + 140, pw - 68);
    else if (page === 2) drawIdeas(ctx, px + 34, py + 140, pw - 68);
    else drawDifficulties(ctx, px + 34, py + 140, pw - 68);
    ctx.restore();

    ctx.save();
    ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.4)";
    ctx.textAlign = "center";
    ctx.fillText("← → bo'limlar · ↑ ↓ aylantirish", px + pw / 2, py + ph - 16);
    ctx.restore();

    ctx.restore();
  }

  function drawScore(ctx, x, y, w) {
    var y0 = y;

    // archetype card — height adapts to the wrapped text so nothing is clipped
    if (cached.archetype) {
      var bodyFont = "12px 'Segoe UI', system-ui, sans-serif";
      var smallFont = "11px 'Segoe UI', system-ui, sans-serif";
      var bodyLines = wrap(ctx, cached.archetype.text || "", w - 32, bodyFont);
      bodyLines = bodyLines.slice(0, 2);
      var watchLines = [];
      if (cached.archetype.watchOut) {
        watchLines = wrap(ctx, "Ehtiyot: " + cached.archetype.watchOut, w - 32, smallFont).slice(0, 2);
      }
      var cardH = 62 + bodyLines.length * 15 + (watchLines.length ? 6 + watchLines.length * 14 : 0) + 12;

      G.render.panel(ctx, x, y, w, cardH, {
        fill: "rgba(104,90,74,.62)", stroke: "rgba(232,196,128,.45)", radius: 9
      });
      ctx.save();
      ctx.font = smallFont;
      ctx.fillStyle = "rgba(217,164,76,.8)";
      ctx.fillText("BUGUNGI USLUBINGIZ", x + 16, y + 20);
      ctx.font = "bold 17px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "#f2dfae";
      ctx.fillText(cached.archetype.title || "", x + 16, y + 42);
      ctx.font = bodyFont;
      ctx.fillStyle = "rgba(240,230,216,.8)";
      for (var i = 0; i < bodyLines.length; i++) {
        ctx.fillText(bodyLines[i], x + 16, y + 62 + i * 15);
      }
      if (watchLines.length) {
        ctx.font = smallFont;
        ctx.fillStyle = "rgba(217,164,76,.75)";
        var wy = y + 62 + bodyLines.length * 15 + 12;
        for (var j = 0; j < watchLines.length; j++) {
          ctx.fillText(watchLines[j], x + 16, wy + j * 14);
        }
      }
      ctx.restore();
      y += cardH + 12;
    }

    // principle bars
    ctx.save();
    ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.5)";
    ctx.fillText("Qaysi tamoyil ustida ishladingiz", x, y);
    ctx.restore();
    y += 20;

    for (var k = 0; k < cached.byPrinciple.length; k++) {
      var pr = cached.byPrinciple[k];
      if (y > y0 + 330) break;
      var total = pr.good + pr.bad;
      var ratio = total ? pr.good / total : 0;
      ctx.save();
      ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(240,230,216,.9)";
      ctx.fillText(pr.name, x, y + 12);
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(127,184,107,.9)";
      ctx.fillText("+" + pr.good, x + w - 40, y + 12);
      ctx.fillStyle = "rgba(196,85,63,.9)";
      ctx.fillText("-" + pr.bad, x + w - 10, y + 12);
      ctx.restore();
      G.render.progressBar(ctx, x, y + 18, w, 6, ratio, ratio >= 0.6 ? "#7fb86b" : "#d9a44c");
      y += 34;
    }

    // intel summary
    if (cached.intel.length) {
      ctx.save();
      ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(143,195,217,.8)";
      ctx.fillText("Yig'ilgan ma'lumot: " + cached.intel.length + " ta", x, y + 8);
      ctx.restore();
    }
  }

  function drawChoices(ctx, x, y, w) {
    ctx.save();
    ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.5)";
    ctx.fillText("Qilgan tanlovlaringiz va ular nima uchun muhim", x, y);
    ctx.restore();
    y += 22;

    var yy = y - scroll * 22;
    for (var i = 0; i < cached.choiceFeedback.length; i++) {
      var c = cached.choiceFeedback[i];
      var verdictColor = c.verdict === "good" ? "#7fb86b" :
        (c.verdict === "bad" ? "#c4553f" : (c.verdict === "weak" ? "#d9a44c" : "#9a9ab0"));

      var whyLines = wrap(ctx, c.why, w - 40, "12px 'Segoe UI', system-ui, sans-serif");
      var altLines = c.alternative ? wrap(ctx, "Boshqacha: " + c.alternative, w - 40, "11px 'Segoe UI', system-ui, sans-serif") : [];
      var boxH = 34 + whyLines.length * 15 + altLines.length * 14 + (c.cost ? 16 : 0);

      if (yy + boxH > y - 40 && yy < H - 130) {
        G.render.panel(ctx, x, yy, w, boxH, {
          fill: "rgba(94,80,66,.78)",
          stroke: G.util.alpha(verdictColor, 0.35),
          radius: 7
        });
        // verdict stripe
        ctx.save();
        ctx.fillStyle = verdictColor;
        ctx.fillRect(x, yy + 6, 3, boxH - 12);
        ctx.restore();

        ctx.save();
        ctx.font = "bold 12.5px 'Segoe UI', system-ui, sans-serif";
        ctx.fillStyle = "#f0e6d8";
        ctx.fillText(c.title, x + 14, yy + 18);
        ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
        ctx.fillStyle = "rgba(240,230,216,.72)";
        var ly = yy + 34;
        for (var j = 0; j < whyLines.length; j++) { ctx.fillText(whyLines[j], x + 14, ly); ly += 15; }
        if (c.cost) {
          ctx.fillStyle = "rgba(196,85,63,.8)";
          ctx.fillText("Narxi: " + c.cost, x + 14, ly); ly += 15;
        }
        if (altLines.length) {
          ctx.fillStyle = "rgba(143,195,217,.75)";
          ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
          for (var al = 0; al < altLines.length; al++) { ctx.fillText(altLines[al], x + 14, ly); ly += 14; }
        }
        ctx.restore();
      }
      yy += boxH + 8;
    }
  }

  function drawIdeas(ctx, x, y, w) {
    ctx.save();
    ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.5)";
    ctx.fillText("Dushanbadan boshlash mumkin bo'lgan aniq g'oyalar", x, y);
    ctx.restore();
    y += 22;

    var yy = y - scroll * 22;
    for (var i = 0; i < cached.ideas.length; i++) {
      var idea = cached.ideas[i];
      var whatLines = wrap(ctx, idea.what || "", w - 40, "12px 'Segoe UI', system-ui, sans-serif");
      // "how" holds the concrete variants — the different ways to actually do it
      var howLines = [];
      if (idea.how && idea.how.length) {
        for (var h = 0; h < idea.how.length; h++) {
          var hl = wrap(ctx, "› " + idea.how[h], w - 48, "11px 'Segoe UI', system-ui, sans-serif");
          for (var q = 0; q < hl.length; q++) howLines.push(hl[q]);
        }
      }
      var diffLines = idea.difficulty ? wrap(ctx, "Qiyinligi: " + idea.difficulty, w - 40, "11px 'Segoe UI', system-ui, sans-serif") : [];
      var boxH = 30 + whatLines.length * 15 + (howLines.length ? 6 + howLines.length * 14 : 0) + diffLines.length * 14 + 18;

      if (yy + boxH > y - 40 && yy < H - 130) {
        G.render.panel(ctx, x, yy, w, boxH, {
          fill: "rgba(86,92,78,.72)",
          stroke: idea.firstWeek ? "rgba(127,184,107,.5)" : "rgba(217,164,76,.2)",
          radius: 7
        });
        ctx.save();
        ctx.font = "bold 12.5px 'Segoe UI', system-ui, sans-serif";
        ctx.fillStyle = "#e8f0dc";
        ctx.fillText((idea.firstWeek ? "★ " : "") + (idea.title || ""), x + 14, yy + 17);
        ctx.font = "10px 'Segoe UI', system-ui, sans-serif";
        ctx.fillStyle = "rgba(244,236,224,.45)";
        ctx.textAlign = "right";
        ctx.fillText((idea.effort || "") + " · " + (idea.cost || ""), x + w - 14, yy + 17);
        ctx.textAlign = "left";
        ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
        ctx.fillStyle = "rgba(240,230,216,.78)";
        var ly = yy + 33;
        for (var j = 0; j < whatLines.length; j++) { ctx.fillText(whatLines[j], x + 14, ly); ly += 15; }
        if (howLines.length) {
          ly += 6;
          ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
          ctx.fillStyle = "rgba(167,196,214,.85)";
          for (var hh = 0; hh < howLines.length; hh++) { ctx.fillText(howLines[hh], x + 14, ly); ly += 14; }
        }
        if (diffLines.length) {
          ctx.fillStyle = "rgba(217,164,76,.7)";
          ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
          for (var d = 0; d < diffLines.length; d++) { ctx.fillText(diffLines[d], x + 14, ly); ly += 14; }
        }
        ctx.restore();
      }
      yy += boxH + 8;
    }
  }

  function drawDifficulties(ctx, x, y, w) {
    ctx.save();
    ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.5)";
    ctx.fillText("Buni amalda qilishda nimalar qiyin bo'ladi", x, y);
    ctx.restore();
    y += 22;

    var yy = y - scroll * 22;
    for (var i = 0; i < cached.difficulties.length; i++) {
      var d = cached.difficulties[i];
      var whyLines = wrap(ctx, d.why || "", w - 40, "12px 'Segoe UI', system-ui, sans-serif");
      var mitLines = d.mitigation ? wrap(ctx, "Yordam beradi: " + d.mitigation, w - 40, "11px 'Segoe UI', system-ui, sans-serif") : [];
      var boxH = 28 + whyLines.length * 15 + mitLines.length * 14 + 14;

      if (yy + boxH > y - 40 && yy < H - 130) {
        G.render.panel(ctx, x, yy, w, boxH, {
          fill: "rgba(100,82,76,.75)", stroke: "rgba(214,110,88,.38)", radius: 7
        });
        ctx.save();
        ctx.font = "bold 12.5px 'Segoe UI', system-ui, sans-serif";
        ctx.fillStyle = "#f0d8d0";
        ctx.fillText(d.title || "", x + 14, yy + 17);
        ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
        ctx.fillStyle = "rgba(240,230,216,.72)";
        var ly = yy + 33;
        for (var j = 0; j < whyLines.length; j++) { ctx.fillText(whyLines[j], x + 14, ly); ly += 15; }
        if (mitLines.length) {
          ctx.fillStyle = "rgba(127,184,107,.78)";
          ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
          for (var m = 0; m < mitLines.length; m++) { ctx.fillText(mitLines[m], x + 14, ly); ly += 14; }
        }
        ctx.restore();
      }
      yy += boxH + 8;
    }
  }

  function wrap(ctx, text, maxW, font) {
    if (!text) return [];
    ctx.save();
    if (font) ctx.font = font;
    var lines = G.util.wrapText(ctx, text, maxW);
    ctx.restore();
    return lines;
  }

  return {
    show: show,
    hide: hide,
    update: update,
    draw: draw,
    isVisible: isVisible,
    openOverview: openOverview,
    isOverview: isOverview,
    isFinal: isFinal,
    // test/introspection hooks
    getSummary: function () { return cached || buildSummary(); },
    getPage: function () { return page; },
    setPage: function (i) {
      page = Math.max(0, Math.min(PAGES.length - 1, i | 0));
      scroll = 0;
      return page;
    },
    pageNames: function () { return PAGES.slice(); }
  };
})();
