/* chapter2.js — two activities for "Birinchi dars: 5-B".

   1) firstNinety  — "Birinchi to'qson soniya".
      You get three moves out of six, in order. The FIRST move sets the frame
      the other two are read through: open as a person and both doors stay
      open; open as an authority and warmth costs double; open as entertainment
      and order costs double. Two meters (issiqlik / tartib) and fourteen
      pupils who visibly lean in, settle, or turn away. You cannot max both —
      which is the point of ninety seconds.

   2) registerRun — "Jurnal: o'n to'rt ism".
      Fourteen desks, one register, seventy seconds of the class's patience.
      Naming a pupil costs time; noticing one true thing about them costs more
      time; a wrong name costs time AND trust. You cannot learn fourteen names
      in one minute, so you must choose who you actually see — and at the end
      the game names the children you never reached.

   The host clips us to 852 x 418 logical pixels and draws its own title,
   subtitle and controls footer, so every coordinate below lives in 0..852 x
   0..418. Colours follow gift.js: warm brown, cream #f6efe3, gold #f2c469. */

(function () {
  "use strict";

  window.G = window.G || {};
  var G = window.G;
  G.minigames = G.minigames || {};
  G.minigames.list = G.minigames.list || {};
  G.minigames.order = G.minigames.order || [];
  if (typeof G.minigames.register !== "function") {
    G.minigames.register = function (id, def) {
      if (!id || !def) return;
      this.list[id] = def;
      if (this.order.indexOf(id) < 0) this.order.push(id);
    };
  }

  var CREAM = "#f6efe3", GOLD = "#f2c469", MUTED = "rgba(246,239,227,0.62)";
  var DIM = "rgba(246,239,227,0.34)", GREEN = "#8fe08f", RED = "#d9755c";
  var BLUE = "#8fc3d9", WARM = "#e8a35c", SANS = "system-ui, sans-serif";

  var W = 852, H = 418;
  // content area is translated by the host; mouse coords arrive un-translated
  var MOUSE_X = 54, MOUSE_Y = 108;

  function txt(ctx, s, x, y, font, fill, align) {
    ctx.font = font; ctx.fillStyle = fill;
    ctx.textAlign = align || "left"; ctx.textBaseline = "middle";
    ctx.fillText(s, x, y);
  }
  function rrect(ctx, x, y, w, h, r) {
    var a = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath(); ctx.moveTo(x + a, y); ctx.lineTo(x + w - a, y);
    ctx.arcTo(x + w, y, x + w, y + h, a); ctx.lineTo(x + w, y + h - a);
    ctx.arcTo(x + w, y + h, x, y + h, a); ctx.lineTo(x + a, y + h);
    ctx.arcTo(x, y + h, x, y + h - a, a); ctx.lineTo(x, y + a);
    ctx.arcTo(x, y, x + a, y, a); ctx.closePath();
  }
  function wrap(ctx, s, maxW) {
    var words = String(s).split(" "), out = [], line = "";
    for (var i = 0; i < words.length; i++) {
      var p = line ? line + " " + words[i] : words[i];
      if (line && ctx.measureText(p).width > maxW) { out.push(line); line = words[i]; }
      else line = p;
    }
    if (line) out.push(line);
    return out;
  }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function ease(x) { var t = clamp(x, 0, 1); return 1 - Math.pow(1 - t, 3); }
  function sfx(api, name, arg) {
    try {
      if (api && api.sound && api.sound[name]) api.sound[name](arg);
    } catch (e) { /* audio is allowed to fail */ }
  }
  function contentPoint(api) {
    var m = (api && api.mouse) || { x: 0, y: 0 };
    return { x: m.x - MOUSE_X, y: m.y - MOUSE_Y };
  }
  function inRect(p, x, y, w, h) {
    return p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h;
  }
  function pill(ctx, x, y, w, h, fill, stroke) {
    rrect(ctx, x, y, w, h, h / 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  }

  /* ---------------------------------------------------------------- people */
  /* A 28px pupil. mood 0..1 = warm (leans in, mouth up), settled 0..1 = facing
     front and still. Deliberately tiny: the point is the row, not the portrait. */
  function drawPupil(ctx, x, y, mood, settled, t, seed, palette) {
    var sk = palette || { skin: "#e5b78d", hair: "#2a1e15", shirt: "#5b7f4a", accent: "#c9d9a0" };
    var wob = Math.sin(t * 1.6 + seed * 1.7) * (1 - settled) * 1.6;
    var lean = mood * 2.4;

    ctx.save();
    ctx.translate(x + wob * 0.4, y + 8);
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.ellipse(0, 0, 9, 3.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(x + wob * 0.4, y + lean);
    ctx.rotate((1 - settled) * 0.06 * Math.sin(seed * 3.1));
    // body
    ctx.fillStyle = sk.shirt;
    rrect(ctx, -7, -18, 14, 18, 4); ctx.fill();
    // arms: crossed when the room is cold, resting when warm
    ctx.fillStyle = sk.shirt;
    if (mood < 0.45) {
      rrect(ctx, -7.6, -11, 15.2, 3.4, 1.6); ctx.fill();
    } else {
      ctx.fillRect(-9.2, -15, 2.6, 8);
      ctx.fillRect(6.6, -15, 2.6, 8);
    }
    ctx.fillStyle = sk.accent;
    ctx.fillRect(-2.4, -18, 4.8, 2.2);
    // head (slightly turned away when the room is unsettled)
    var hx = (1 - settled) * 3.2 * Math.sin(seed * 2.3);
    ctx.fillStyle = sk.skin;
    ctx.beginPath(); ctx.arc(hx, -24, 6.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = sk.hair;
    ctx.beginPath(); ctx.arc(hx, -25.2, 6.3, Math.PI * 1.04, Math.PI * 1.96); ctx.fill();
    // face
    if (settled > 0.25) {
      ctx.fillStyle = "#2a2118";
      ctx.fillRect(hx - 2.6, -24.6, 1.3, 1.7);
      ctx.fillRect(hx + 1.3, -24.6, 1.3, 1.7);
      ctx.strokeStyle = "#2a2118"; ctx.lineWidth = 0.9;
      ctx.beginPath();
      if (mood > 0.6) ctx.arc(hx, -21.4, 1.9, 0.15 * Math.PI, 0.85 * Math.PI);
      else if (mood > 0.3) ctx.moveTo(hx - 1.7, -20.6), ctx.lineTo(hx + 1.7, -20.6);
      else ctx.arc(hx, -19.2, 1.9, 1.15 * Math.PI, 1.85 * Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  }

  var SKINS = [
    { skin: "#e5b78d", hair: "#2a1e15", shirt: "#5b7f4a", accent: "#c9d9a0" },
    { skin: "#ecc39d", hair: "#241a15", shirt: "#4a6b7a", accent: "#9fc3c9" },
    { skin: "#e8bb94", hair: "#3a2419", shirt: "#7a4a6b", accent: "#d3a4bb" },
    { skin: "#dfb28a", hair: "#2b2118", shirt: "#8c4a52", accent: "#d3a08f" },
    { skin: "#e0b088", hair: "#241b14", shirt: "#6b5b45", accent: "#c3a97f" },
    { skin: "#e9c09b", hair: "#33241a", shirt: "#5a5a6e", accent: "#a9a9c4" },
    { skin: "#e3b98f", hair: "#2f2118", shirt: "#7a6a3f", accent: "#d6c48d" }
  ];

  /* ======================================================================
     1. BIRINCHI TO'QSON SONIYA
     ====================================================================== */
  G.minigames.register("firstNinety", {
    title: "Birinchi to'qson soniya",
    subtitle: "Uchta harakat. Birinchisi qolgan ikkitasining narxini belgilaydi.",
    controls: "1-6 karta tanlash · ENTER joylash · ESC bekor qilish · sichqoncha bilan ham bo'ladi",
    principles: ["C2-001"],
    create: function (api) {
      var MOVES = [
        { id: "self", title: "O'zingizni tanishtirish",
          line: "«Men Azizbek. Bu yil matematikadan men o'qitaman.»",
          warm: 2, order: 0, kind: "neutral" },
        { id: "ask", title: "Ularga savol berish",
          line: "«Kim bu yerda eng katta sonni biladi?»",
          warm: 2, order: -1, kind: "neutral" },
        { id: "joke", title: "O'zingiz ustidan hazil",
          line: "«Men bu misolni kecha yecholmadim. Kim menga o'rgatadi?»",
          warm: 2, order: -1, kind: "warm" },
        { id: "rule", title: "Bitta qoida aytish",
          line: "«Xato qilish mumkin. Xatoni yashirish — mumkin emas.»",
          warm: 0, order: 3, kind: "cold" },
        { id: "silence", title: "Jim turib, sinfni kutish",
          line: "Gapirmaysiz. Sinf o'zi jim bo'lguncha kutasiz.",
          warm: -1, order: 3, kind: "cold" },
        { id: "board", title: "Doskaga mavzuni yozish",
          line: "Orqangizni burib, mavzuni yozasiz. Ular kutadi.",
          warm: -1, order: 2, kind: "cold" }
      ];

      var FRAMES = {
        neutral: { name: "UCHRASHUV", note: "ular sizni hali tanlamadi — ikkala eshik ochiq", warmMul: 1, orderMul: 1 },
        warm: { name: "SAHNA", note: "kulgi boshladingiz — endi tartib ikki barobar qimmat", warmMul: 1, orderMul: 0.5 },
        cold: { name: "TARTIB", note: "hokimiyatdan boshladingiz — endi iliqlik ikki barobar qimmat", warmMul: 0.5, orderMul: 1 }
      };

      var slots = [];           // indices into MOVES, in play order
      var frame = null;
      var sel = 0;
      var phase = "pick";       // pick | resolve | done
      var warm = 3, order = 3, tw = 3, to = 3;
      var animT = 0, t = 0, doneT = 0, finished = false;
      var flash = 0;

      function moveById(id) {
        for (var i = 0; i < MOVES.length; i++) if (MOVES[i].id === id) return MOVES[i];
        return null;
      }
      function used(i) { return slots.indexOf(i) >= 0; }

      // delta of a move at a given position, after the frame multiplier
      function delta(m, pos) {
        if (pos === 0 || !frame) return { w: m.warm, o: m.order };
        var f = FRAMES[frame];
        var w = m.warm > 0 ? Math.round(m.warm * f.warmMul) : m.warm;
        var o = m.order > 0 ? Math.round(m.order * f.orderMul) : m.order;
        return { w: w, o: o };
      }

      function recompute() {
        var w = 3, o = 3;
        for (var i = 0; i < slots.length; i++) {
          var d = delta(MOVES[slots[i]], i);
          w += d.w; o += d.o;
        }
        tw = clamp(w, 0, 10); to = clamp(o, 0, 10);
      }

      function frameForFirst() {
        if (!slots.length) return null;
        return MOVES[slots[0]].kind;
      }

      function place(i) {
        if (finished || phase !== "pick") return;
        if (i < 0 || i >= MOVES.length || used(i) || slots.length >= 3) return;
        slots.push(i);
        sel = -1;
        frame = frameForFirst();
        recompute();
        flash = 1;
        sfx(api, "tick");
        if (slots.length === 3) { phase = "resolve"; animT = 0; sfx(api, "select"); }
        else {
          // preselect the next unused card
          for (var k = 0; k < MOVES.length; k++) {
            if (!used(k)) { sel = k; break; }
          }
        }
      }

      function undo() {
        if (finished || phase !== "pick" || !slots.length) return;
        slots.pop();
        frame = frameForFirst();
        recompute();
        sel = slots.length ? slots[slots.length - 1] : 0;
        sfx(api, "blip", 420);
      }

      function win() { return tw >= 7 && to >= 4; }

      function finishNow() {
        if (finished) return;
        finished = true;
        var w = win();
        sfx(api, w ? "win" : "bad");
        api.finish({
          win: w,
          choiceId: w ? "CH2_MG_NINETY_WIN" : "CH2_MG_NINETY_LOSE",
          detail: "issiqlik " + tw + " / tartib " + to + " (ramka: " + (frame ? FRAMES[frame].name : "—") + ")"
        });
      }

      function layoutCards() {
        var out = [];
        for (var i = 0; i < MOVES.length; i++) {
          var col = i % 3, row = (i / 3) | 0;
          out.push({ x: 10 + col * 280, y: 266 + row * 74, w: 272, h: 66 });
        }
        return out;
      }

      return {
        update: function (dt) {
          t += dt;
          flash = Math.max(0, flash - dt * 3);
          var k = Math.min(1, dt * 3.4);
          warm += (tw - warm) * k;
          order += (to - order) * k;
          if (phase === "resolve") {
            animT += dt;
            if (animT > 0.9) { phase = "done"; doneT = 0; }
          } else if (phase === "done") {
            doneT += dt;
            if (doneT > 2.6) finishNow();
          }
        },

        onKey: function (key) {
          if (finished) return;
          if (phase === "done") {
            if (key === "enter" || key === "space" || key === "r") finishNow();
            return;
          }
          if (phase === "resolve") return;
          if (key >= "1" && key <= "6") { place(parseInt(key, 10) - 1); return; }
          if (key === "escape") { undo(); return; }
          if (key === "arrowleft" || key === "a") {
            sel = (sel <= 0) ? MOVES.length - 1 : sel - 1;
            sfx(api, "blip", 500);
          } else if (key === "arrowright" || key === "d") {
            sel = (sel + 1) % MOVES.length;
            sfx(api, "blip", 520);
          } else if (key === "arrowup" || key === "w") {
            sel = (sel + 3) % MOVES.length;
            sfx(api, "blip", 540);
          } else if (key === "arrowdown" || key === "s") {
            sel = (sel + 3) % MOVES.length;
            sfx(api, "blip", 460);
          } else if (key === "enter" || key === "space") {
            if (sel >= 0 && !used(sel)) place(sel);
          }
        },

        onPointer: function (x, y, kind) {
          if (finished || kind !== "down") return;
          var p = { x: x - MOUSE_X, y: y - MOUSE_Y };
          if (phase === "done") { finishNow(); return; }
          if (phase !== "pick") return;
          var cs = layoutCards();
          for (var i = 0; i < cs.length; i++) {
            if (inRect(p, cs[i].x, cs[i].y, cs[i].w, cs[i].h)) {
              if (used(i)) { sfx(api, "bad"); return; }
              if (sel === i) place(i);
              else { sel = i; sfx(api, "blip", 500 + i * 30); }
              return;
            }
          }
          // clicking a filled slot undoes it
          if (p.y >= 202 && p.y <= 258 && p.x >= 174 && p.x <= 678) undo();
        },

        draw: function (ctx) {
          drawRoom(ctx, warm / 10, order / 10, t, MOVES, slots, delta, flash);
          drawMeters(ctx, warm, order, tw, to);
          drawClock(ctx, slots.length);
          drawSlots(ctx, MOVES, slots, phase, frame ? FRAMES[frame] : null, t);
          drawCards(ctx, MOVES, slots, sel, frame, delta);
          if (phase === "done" || phase === "resolve") {
            drawVerdict(ctx, warm, order, phase === "done" ? Math.min(1, doneT / 0.4) : 0, win());
          }
        },

        // test hook, also handy when the host force-finishes us
        debugState: function () {
          return { slots: slots.slice(), frame: frame, warm: tw, order: to, phase: phase };
        },
        debugMove: function (id) {
          if (!id) return false;
          var m = moveById(id);
          if (!m) return false;
          var i = MOVES.indexOf(m);
          place(i);
          return true;
        }
      };

      /* ---------------------------------------------------------- drawing */

      function drawRoom(ctx, warmth, settled, tt, moves, sl, dl, fl) {
        var g = ctx.createLinearGradient(0, 0, 0, 200);
        g.addColorStop(0, "#2a241d");
        g.addColorStop(1, "#1e1a15");
        ctx.fillStyle = g;
        rrect(ctx, 0, 0, W, 200, 10); ctx.fill();
        ctx.strokeStyle = "rgba(217,164,76,.22)";
        ctx.lineWidth = 1; ctx.stroke();

        // blackboard
        rrect(ctx, 300, 12, 252, 54, 6);
        ctx.fillStyle = "#26382d"; ctx.fill();
        ctx.strokeStyle = "rgba(217,164,76,.28)"; ctx.stroke();
        ctx.save();
        ctx.globalAlpha = 0.55;
        txt(ctx, "5-B", 318, 32, "bold 15px " + SANS, "rgba(246,239,227,.5)");
        txt(ctx, "kafel: 8 m × 6 m", 318, 52, "11px " + SANS, "rgba(246,239,227,.42)");
        ctx.restore();

        // fourteen pupils, two rows of seven
        for (var i = 0; i < 14; i++) {
          var row = i < 7 ? 0 : 1;
          var col = i % 7;
          var px = 246 + col * 62;
          var py = row === 0 ? 116 : 164;
          var seed = i * 1.37;
          var mood = clamp(warmth + Math.sin(seed) * 0.12, 0, 1);
          dp(ctx, px, py, mood, settled, tt, seed, SKINS[i % SKINS.length]);
        }

        // the teacher: you, at the front left, facing them
        ctx.save();
        ctx.translate(150, 168);
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = "rgba(0,0,0,.25)";
        ctx.beginPath(); ctx.ellipse(0, 10, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#3f6f8f";
        rrect(ctx, -10, -26, 20, 30, 6); ctx.fill();
        ctx.fillStyle = "#e8b98f";
        ctx.beginPath(); ctx.arc(0, -34, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#2b2118";
        ctx.beginPath(); ctx.arc(0, -36, 9, Math.PI * 1.04, Math.PI * 1.96); ctx.fill();
        ctx.fillStyle = "#2a2118";
        ctx.fillRect(-3.6, -35.4, 1.9, 2.4);
        ctx.fillRect(1.7, -35.4, 1.9, 2.4);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = 0.5;
        txt(ctx, "siz", 150, 190, "10px " + SANS, MUTED, "center");
        ctx.restore();
      }

      // local alias so drawRoom stays readable
      function dp(ctx, x, y, mood, settled, tt, seed, pal) {
        drawPupil(ctx, x, y, mood, settled, tt, seed, pal);
      }

      function drawMeters(ctx, warm, order, tw, to) {
        var x = 686, w = 128;
        // warmth
        txt(ctx, "ISSIQLIK", x, 26, "bold 10px " + SANS, WARM);
        rrect(ctx, x, 34, w, 9, 4.5); ctx.fillStyle = "rgba(0,0,0,.4)"; ctx.fill();
        rrect(ctx, x, 34, w * clamp(warm / 10, 0, 1), 9, 4.5);
        ctx.fillStyle = WARM; ctx.fill();
        txt(ctx, String(Math.round(warm * 10) / 10), x + w + 8, 39, "10px " + SANS, MUTED);
        // order
        txt(ctx, "TARTIB", x, 66, "bold 10px " + SANS, BLUE);
        rrect(ctx, x, 74, w, 9, 4.5); ctx.fillStyle = "rgba(0,0,0,.4)"; ctx.fill();
        rrect(ctx, x, 74, w * clamp(order / 10, 0, 1), 9, 4.5);
        ctx.fillStyle = BLUE; ctx.fill();
        txt(ctx, String(Math.round(order * 10) / 10), x + w + 8, 79, "10px " + SANS, MUTED);
        // threshold hint
        var okWarm = tw >= 7, okOrder = to >= 4;
        ctx.save();
        ctx.globalAlpha = 0.85;
        txt(ctx, (okWarm ? "✓" : "·") + " iliqlik 7+", x, 100, "10px " + SANS, okWarm ? GREEN : DIM);
        txt(ctx, (okOrder ? "✓" : "·") + " tartib 4+", x + 70, 100, "10px " + SANS, okOrder ? GREEN : DIM);
        ctx.restore();
      }

      function drawClock(ctx, placed) {
        var left = 90 - placed * 30;
        txt(ctx, "0:" + (left < 10 ? "0" + left : left), 22, 30, "bold 22px " + SANS, GOLD);
        txt(ctx, "birinchi to'qson soniya", 22, 50, "10px " + SANS, MUTED);
        // three pips = the three moves you have
        for (var i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(26 + i * 14, 66, 4, 0, Math.PI * 2);
          ctx.fillStyle = i < placed ? GOLD : "rgba(246,239,227,.18)";
          ctx.fill();
        }
      }

      function drawSlots(ctx, moves, sl, phase, fr, tt) {
        var x0 = 174, w = 160, gap = 12;
        for (var i = 0; i < 3; i++) {
          var x = x0 + i * (w + gap), y = 206;
          var filled = i < sl.length;
          rrect(ctx, x, y, w, 50, 8);
          ctx.fillStyle = filled ? "rgba(242,196,105,.14)" : "rgba(246,239,227,.045)";
          ctx.fill();
          ctx.strokeStyle = filled ? "rgba(242,196,105,.7)" : "rgba(246,239,227,.16)";
          ctx.lineWidth = 1.2; ctx.stroke();
          txt(ctx, String(i + 1), x + 12, y + 16, "bold 10px " + SANS, filled ? GOLD : DIM);
          if (filled) {
            var m = moves[sl[i]];
            ctx.save();
            ctx.beginPath(); ctx.rect(x + 4, y + 4, w - 8, 42); ctx.clip();
            txt(ctx, m.title, x + 12, y + 32, "bold 11px " + SANS, CREAM);
            ctx.restore();
          } else {
            txt(ctx, i === sl.length ? "keyingi harakat" : "—", x + 12, y + 32, "10px " + SANS, DIM);
          }
        }
        if (fr) {
          txt(ctx, "RAMKA", 690, 218, "bold 9px " + SANS, GOLD);
          txt(ctx, fr.name, 690, 232, "bold 12px " + SANS, GOLD);
          var lines = wrap(ctx, fr.note, 152);
          ctx.font = "9.5px " + SANS;
          for (var k = 0; k < Math.min(2, lines.length); k++) {
            txt(ctx, lines[k], 690, 246 + k * 11, "9.5px " + SANS, MUTED);
          }
        }
      }

      function drawCards(ctx, moves, sl, sel, fr, dl) {
        var cs = layoutCards();
        for (var i = 0; i < moves.length; i++) {
          var c = cs[i], m = moves[i], isUsed = sl.indexOf(i) >= 0;
          var isSel = sel === i && !isUsed && phase !== "done";
          rrect(ctx, c.x, c.y, c.w, c.h, 7);
          ctx.fillStyle = isUsed ? "rgba(246,239,227,.03)" : (isSel ? "rgba(242,196,105,.13)" : "rgba(246,239,227,.055)");
          ctx.fill();
          ctx.strokeStyle = isUsed ? "rgba(246,239,227,.10)" : (isSel ? GOLD : "rgba(246,239,227,.16)");
          ctx.lineWidth = isSel ? 1.8 : 1; ctx.stroke();

          ctx.save();
          if (isUsed) ctx.globalAlpha = 0.35;
          txt(ctx, String(i + 1), c.x + 10, c.y + 14, "bold 10px " + SANS, isSel ? GOLD : DIM);
          txt(ctx, m.title, c.x + 24, c.y + 14, "bold 12px " + SANS, CREAM);
          var lines = wrap(ctx, m.line, c.w - 34);
          ctx.font = "10px " + SANS;
          for (var k = 0; k < Math.min(2, lines.length); k++) {
            txt(ctx, lines[k], c.x + 24, c.y + 31 + k * 12, "10px " + SANS, MUTED);
          }
          // projected effect for the next slot
          var pos = sl.length;
          var d = dl(m, pos);
          var eff = (d.w >= 0 ? "+" : "−") + Math.abs(d.w) + " issiq   " +
                    (d.o >= 0 ? "+" : "−") + Math.abs(d.o) + " tartib";
          var effCol = (d.w + d.o > 1) ? GREEN : (d.w + d.o < 0 ? RED : MUTED);
          if (fr && pos > 0) eff += "  (ramka)";
          txt(ctx, eff, c.x + 24, c.y + c.h - 11, "10px " + SANS, isUsed ? DIM : effCol);
          ctx.restore();
        }
      }

      function drawVerdict(ctx, warm, order, a, won) {
        ctx.save();
        ctx.globalAlpha = clamp(a, 0, 1);
        rrect(ctx, 216, 96, 420, 120, 10);
        ctx.fillStyle = "rgba(20,17,14,.94)"; ctx.fill();
        ctx.strokeStyle = won ? "rgba(143,224,143,.7)" : "rgba(217,117,92,.7)";
        ctx.lineWidth = 1.4; ctx.stroke();
        txt(ctx, won ? "Xona sizni tanidi" : "Xona hukm qildi", 426, 124,
            "bold 16px " + SANS, won ? GREEN : RED, "center");
        txt(ctx, "issiqlik " + Math.round(warm * 10) / 10 + " / 10   ·   tartib " + Math.round(order * 10) / 10 + " / 10",
            426, 150, "11.5px " + SANS, MUTED, "center");
        var line = won
          ? "Ular ilek ham, o'rin ham topdi. Ertaga bu eshikdan kirish osonroq."
          : (order < 4
              ? "Iliq, lekin o'rin yo'q: sinf sizni yaxshi ko'rdi va boshqara olmadi."
              : "Tartibli, lekin sovuq: hech kim siz bilan uchrashmadi.");
        var lines = wrap(ctx, line, 380);
        ctx.font = "11px " + SANS;
        for (var i = 0; i < Math.min(3, lines.length); i++) {
          txt(ctx, lines[i], 426, 176 + i * 15, "11px " + SANS, CREAM, "center");
        }
        txt(ctx, "ENTER", 426, 206, "9.5px " + SANS, DIM, "center");
        ctx.restore();
      }
    }
  });

  /* ======================================================================
     2. JURNAL: O'N TO'RT ISM
     ====================================================================== */

  var PUPILS = [
    { name: "Timur", cue: "derazaga qarab, chetga chizadi",
      details: ["krossovkasi yangi", "daftar chetida chizma", "qo'lida telefon"], truth: 1 },
    { name: "Zarina", cue: "qo'llari bog'langan, kuzatadi",
      details: ["boshqalarga tushuntiradi", "eng oldingi qatorda", "doim kuladi"], truth: 0 },
    { name: "Dilnoza", cue: "daftari to'la, qalami tayyor",
      details: ["hamma beti yozilgan", "hech qachon qo'l ko'tarmaydi", "deraza yonida"], truth: 0 },
    { name: "Jasur", cue: "orqaga burilib gapiradi",
      details: ["partasida maydon chizilgan", "jim o'tiradi", "daftari yo'q"], truth: 0 },
    { name: "Nafisa", cue: "labi qimirlaydi, ovozi chiqmaydi",
      details: ["javobni biladi", "qo'lini baland ko'taradi", "eng orqada o'tiradi"], truth: 0 },
    { name: "Bekzod", cue: "yirtilgan varaqqa yozadi",
      details: ["uch hafta oldin kelgan", "daftari to'la", "hech kim bilan gaplashmaydi"], truth: 0 },
    { name: "Aziza", cue: "sochini to'g'rilab turadi",
      details: ["yozuvlari chiroyli", "partadoshi bilan gaplashadi", "krossovkasi yangi"], truth: 0 },
    { name: "Shahzoda", cue: "partadoshiga egilib shivirlaydi",
      details: ["ikkitasini birga yechadi", "doim yolg'iz", "daftari yo'q"], truth: 0 },
    { name: "Oybek", cue: "qo'lini baland ko'targan",
      details: ["birinchi bo'lib qo'l ko'taradi", "javobni bilmaydi", "uxlab qolgan"], truth: 0 },
    { name: "Ulug'bek", cue: "kulib o'tiradi",
      details: ["hazil qilishni yaxshi ko'radi", "hech qachon gapirmaydi", "eng oldingi qatorda"], truth: 0 },
    { name: "Madina", cue: "daftarini yopib qo'ygan",
      details: ["misolni yechib bo'lgan", "qalami yo'q", "derazaga qaraydi"], truth: 0 },
    { name: "Sanjar", cue: "deraza tomonga burilgan",
      details: ["hovlini kuzatadi", "qo'l ko'targan", "daftari to'la"], truth: 0 },
    { name: "Kamola", cue: "qalamini tishlab o'ylaydi",
      details: ["sekin hisoblaydi", "javobni baland aytadi", "yozmaydi"], truth: 0 },
    { name: "Rustam", cue: "partasiga boshini qo'ygan",
      details: ["uxlab qolgan", "birinchi qatorda", "hamma savolga javob beradi"], truth: 0 }
  ];

  G.minigames.register("registerRun", {
    title: "Jurnal: o'n to'rt ism",
    subtitle: "Ism aytish vaqt oladi. Bitta haqiqiy narsani ko'rish undan ham ko'p vaqt oladi.",
    controls: " strelkalar — parta tanlash · ENTER — ism aytish · 1-5 — ism · 1-3 — batafsil · SPACE — darsni boshlash",
    principles: ["C2-003"],

    create: function (api) {
      var cfg = api.cfg || {};
      var forgiving = !!cfg.forgiving;
      var total = typeof cfg.seconds === "number" ? cfg.seconds : 70;

      var named = [], seen = [];
      var names = 0, details = 0, wrong = 0;
      var trust = forgiving ? 4 : 3;
      var maxTrust = forgiving ? 4 : 3;
      // the first ninety seconds already happened; a cold room costs you trust
      if (api.state && api.state.flags && api.state.flags.c2_room_cold) {
        trust = Math.max(1, trust - 1);
      }

      var phase = "browse";      // browse | name | detail | summary | done
      var sel = 0;
      var cand = [];
      var detailChips = [];
      var clock = total;
      var t = 0, sumT = 0, finished = false, msg = "", msgT = 0;
      var pendingPupil = -1;

      // intel from before the bell: three names you already had
      var pre = [];
      var intel = (api.state && api.state.intel) || [];
      function has(i) { return intel.indexOf(i) >= 0; }
      if (has("intel_zarina")) pre.push("Zarina");
      if (has("intel_bekzod")) pre.push("Bekzod");
      if (has("intel_jasur")) pre.push("Jasur");
      for (var p0 = 0; p0 < PUPILS.length; p0++) {
        if (pre.indexOf(PUPILS[p0].name) >= 0) {
          named[p0] = true;
          names++;
        }
      }

      function clockLeft() { return Math.max(0, clock); }
      function bump(text, kind) { msg = text; msgT = 2.2; lastKind = kind || ""; }
      var lastKind = "";

      function openPupil(i) {
        if (finished || phase !== "browse") return;
        if (named[i]) { bump(PUPILS[i].name + " — allaqachon bilaman", ""); sfx(api, "blip", 520); return; }
        pendingPupil = i;
        sel = i;
        // candidate names: the true one + up to four others not yet learned
        var others = [];
        for (var k = 0; k < PUPILS.length; k++) {
          if (k === i || named[k]) continue;
          others.push(PUPILS[k].name);
        }
        var pick = [PUPILS[i].name];
        for (var m = 0; m < others.length && pick.length < 5; m++) {
          if (m % 2 === 0) pick.push(others[m]);
        }
        for (var n = 0; n < others.length && pick.length < 5; n++) {
          if (pick.indexOf(others[n]) < 0) pick.push(others[n]);
        }
        // deterministic rotate so the right name is not always chip 1
        var rot = i % pick.length;
        cand = pick.slice(rot).concat(pick.slice(0, rot));
        phase = "name";
        sfx(api, "blip", 600);
      }

      function chooseName(idx) {
        if (phase !== "name" || idx < 0 || idx >= cand.length) return;
        var i = pendingPupil;
        var guess = cand[idx];
        clock -= 3;
        if (guess === PUPILS[i].name) {
          named[i] = true; names++;
          sfx(api, "good");
          bump(PUPILS[i].name + " — to'g'ri", "good");
          openDetails(i);
        } else {
          wrong++;
          trust = Math.max(0, trust - 1);
          clock -= forgiving ? 2 : 5;
          named[i] = true; names++;
          sfx(api, "bad");
          bump("«Men " + guess + " emasman. Men " + PUPILS[i].name + "man.»", "bad");
          openDetails(i);
        }
      }

      function openDetails(i) {
        var d = PUPILS[i].details;
        detailChips = d.slice();
        pendingPupil = i;
        phase = "detail";
        if (clockLeft() <= 0) endNow();
      }

      function chooseDetail(idx) {
        if (phase !== "detail" || idx < 0 || idx >= detailChips.length) return;
        var i = pendingPupil;
        clock -= 4;
        if (idx === PUPILS[i].truth) {
          details++; seen[i] = true;
          sfx(api, "good");
          bump("Ko'rdingiz: " + detailChips[idx], "good");
        } else {
          sfx(api, "blip", 380);
          bump("Bu boshqa bolaga tegishli edi", "bad");
        }
        phase = "browse";
        pendingPupil = -1;
        checkEnd();
      }

      function skipDetail() {
        if (phase !== "detail") return;
        phase = "browse";
        pendingPupil = -1;
        checkEnd();
      }

      function checkEnd() {
        if (finished) return;
        if (names >= PUPILS.length) { endNow(); return; }
        if (clockLeft() <= 0) endNow();
      }

      function endNow() {
        if (finished) return;
        if (phase === "summary" || phase === "done") return;
        phase = "summary";
        sumT = 0;
        sfx(api, win() ? "win" : "blip", 300);
      }

      function win() {
        return names >= 5 && details >= 2 && wrong <= 2 && trust >= 2;
      }

      function finishNow() {
        if (finished) return;
        finished = true;
        var w = win();
        api.finish({
          win: w,
          choiceId: w ? "CH2_MG_NAMES_WIN" : "CH2_MG_NAMES_LOSE",
          detail: "ismlar " + names + "/14, ko'rilgan " + details + ", xato " + wrong + ", ishonch " + trust + "/" + maxTrust
        });
      }

      function gridRect(i) {
        var col = i % 7, row = (i / 7) | 0;
        return { x: 8 + col * 120, y: 36 + row * 122, w: 116, h: 118 };
      }
      function chipRect(i) {
        return { x: 19 + i * 164, y: 352, w: 158, h: 42 };
      }
      function detailRect(i) {
        return { x: 23 + i * 272, y: 352, w: 262, h: 42 };
      }

      return {
        update: function (dt) {
          t += dt;
          msgT = Math.max(0, msgT - dt);
          if (finished) return;
          if (phase === "summary") {
            sumT += dt;
            if (sumT > 3.4) finishNow();
            return;
          }
          if (phase === "done") return;
          clock -= dt;
          if (clock <= 0) { clock = 0; endNow(); }
        },

        onKey: function (key) {
          if (finished) return;
          if (phase === "summary") {
            if (key === "enter" || key === "space" || key === "r") finishNow();
            return;
          }
          if (phase === "name") {
            if (key >= "1" && key <= "5") chooseName(parseInt(key, 10) - 1);
            else if (key === "escape") { phase = "browse"; pendingPupil = -1; }
            return;
          }
          if (phase === "detail") {
            if (key >= "1" && key <= "3") chooseDetail(parseInt(key, 10) - 1);
            else if (key === "space" || key === "escape" || key === "enter") skipDetail();
            return;
          }
          // browse
          if (key === "space") { endNow(); return; }
          if (key === "arrowleft" || key === "a") { sel = (sel % 7 === 0) ? sel + 6 : sel - 1; sfx(api, "blip", 480); }
          else if (key === "arrowright" || key === "d") { sel = (sel % 7 === 6) ? sel - 6 : sel + 1; sfx(api, "blip", 500); }
          else if (key === "arrowup" || key === "w") { sel = (sel + 7) % 14; sfx(api, "blip", 520); }
          else if (key === "arrowdown" || key === "s") { sel = (sel + 7) % 14; sfx(api, "blip", 460); }
          else if (key === "enter") { openPupil(sel); }
        },

        onPointer: function (x, y, kind) {
          if (finished || kind !== "down") return;
          var p = { x: x - MOUSE_X, y: y - MOUSE_Y };
          if (phase === "summary") { finishNow(); return; }
          if (phase === "name") {
            for (var c = 0; c < cand.length; c++) {
              if (inRect(p, chipRect(c).x, chipRect(c).y, 158, 42)) { chooseName(c); return; }
            }
            return;
          }
          if (phase === "detail") {
            for (var d = 0; d < detailChips.length; d++) {
              var r = detailRect(d);
              if (inRect(p, r.x, r.y, r.w, r.h)) { chooseDetail(d); return; }
            }
            return;
          }
          for (var i = 0; i < 14; i++) {
            var g = gridRect(i);
            if (inRect(p, g.x, g.y, g.w, g.h)) {
              if (sel === i) openPupil(i);
              else { sel = i; sfx(api, "blip", 520); }
              return;
            }
          }
        },

        draw: function (ctx) {
          drawTopBar(ctx, clock, total, names, details, trust, maxTrust);
          if (phase === "summary") { drawSummary(ctx); return; }
          drawGrid(ctx);
          drawPanel(ctx);
        },

        debugState: function () {
          return { phase: phase, names: names, details: details, wrong: wrong, trust: trust, clock: clock };
        },
        debugName: function (i) { sel = i; openPupil(i); return cand.slice(); },
        debugPick: function (i) { if (phase === "name") chooseName(i); else if (phase === "detail") chooseDetail(i); }
      };

      /* ---------------------------------------------------------- drawing */

      function drawTopBar(ctx, clk, tot, n, det, tr, mtr) {
        rrect(ctx, 0, 0, W, 28, 6);
        ctx.fillStyle = "rgba(246,239,227,.05)"; ctx.fill();
        var left = Math.ceil(clk);
        txt(ctx, "0:" + (left < 10 ? "0" + left : left), 14, 14, "bold 14px " + SANS, clk < 12 ? RED : GOLD);
        txt(ctx, "jurnal ochiq", 62, 14, "10px " + SANS, MUTED);
        txt(ctx, "ismlar " + n + "/14", 300, 14, "bold 11px " + SANS, n >= 5 ? GREEN : CREAM);
        txt(ctx, "ko'rilgan " + det, 420, 14, "11px " + SANS, det >= 2 ? GREEN : MUTED);
        txt(ctx, "ishonch", 590, 14, "10px " + SANS, MUTED);
        for (var i = 0; i < mtr; i++) {
          ctx.beginPath();
          ctx.arc(642 + i * 15, 14, 5, 0, Math.PI * 2);
          ctx.fillStyle = i < tr ? (tr >= mtr ? GREEN : GOLD) : "rgba(246,239,227,.16)";
          ctx.fill();
        }
        txt(ctx, "SPACE — boshlash", 846, 14, "9.5px " + SANS, DIM, "right");
      }

      function drawGrid(ctx) {
        for (var i = 0; i < 14; i++) {
          var r = gridRect(i), p = PUPILS[i], isSel = sel === i && phase === "browse";
          var known = !!named[i];
          rrect(ctx, r.x, r.y, r.w, r.h, 7);
          ctx.fillStyle = known ? "rgba(143,224,143,.06)" : (isSel ? "rgba(242,196,105,.10)" : "rgba(246,239,227,.04)");
          ctx.fill();
          ctx.strokeStyle = isSel ? GOLD : (known ? "rgba(143,224,143,.34)" : "rgba(246,239,227,.10)");
          ctx.lineWidth = isSel ? 1.7 : 1; ctx.stroke();

          drawPupil(ctx, r.x + r.w / 2, r.y + 58, known ? 0.6 : 0.35, 0.8,
                    t + i, i * 1.7, SKINS[i % SKINS.length]);

          // posture cue
          var lines = wrap(ctx, p.cue, r.w - 14);
          ctx.font = "9.5px " + SANS;
          for (var k = 0; k < Math.min(2, lines.length); k++) {
            txt(ctx, lines[k], r.x + r.w / 2, r.y + 78 + k * 11, "9.5px " + SANS, MUTED, "center");
          }
          // learned detail mark
          if (seen[i]) {
            ctx.beginPath();
            ctx.arc(r.x + r.w - 12, r.y + 12, 4, 0, Math.PI * 2);
            ctx.fillStyle = GREEN; ctx.fill();
          }
          // name plate
          txt(ctx, known ? p.name : "?  ?  ?", r.x + r.w / 2, r.y + 104,
              "bold 12px " + SANS, known ? CREAM : DIM, "center");
        }
      }

      function drawPanel(ctx) {
        rrect(ctx, 8, 288, 836, 120, 9);
        ctx.fillStyle = "rgba(20,17,14,.72)"; ctx.fill();
        ctx.strokeStyle = "rgba(246,239,227,.10)"; ctx.lineWidth = 1; ctx.stroke();

        if (phase === "browse") {
          var p = PUPILS[sel];
          txt(ctx, "Tanlangan parta", 24, 308, "bold 10px " + SANS, GOLD);
          txt(ctx, p.cue, 24, 326, "12px " + SANS, CREAM);
          txt(ctx, "ENTER — ism aytish.  Ismni bilmasangiz ham ayting: xato qilish mumkin, jim turish — yo'q.",
              24, 344, "10px " + SANS, MUTED);
        } else if (phase === "name") {
          var pp = PUPILS[pendingPupil];
          txt(ctx, "Kim bu?  «" + pp.cue + "»", 24, 308, "bold 12px " + SANS, GOLD);
          txt(ctx, "Jurnaldan tanlang. Xato ism vaqt va ishonch oladi.", 24, 326, "10px " + SANS, MUTED);
          for (var c = 0; c < cand.length; c++) {
            var cr = chipRect(c);
            pill(ctx, cr.x, cr.y, cr.w, cr.h, "rgba(246,239,227,.07)", "rgba(246,239,227,.18)");
            txt(ctx, String(c + 1), cr.x + 12, cr.y + 21, "bold 10px " + SANS, GOLD);
            txt(ctx, cand[c], cr.x + 26, cr.y + 21, "13px " + SANS, CREAM);
          }
        } else if (phase === "detail") {
          var dp2 = PUPILS[pendingPupil];
          txt(ctx, dp2.name + " — bitta haqiqiy narsani ko'ring", 24, 308, "bold 12px " + SANS, GOLD);
          txt(ctx, "Uchtadan bittasi rost. To'g'ri ko'rgan narsa — ertaga sizning gapingiz.", 24, 326, "10px " + SANS, MUTED);
          for (var d = 0; d < detailChips.length; d++) {
            var dr = detailRect(d);
            pill(ctx, dr.x, dr.y, dr.w, dr.h, "rgba(246,239,227,.07)", "rgba(246,239,227,.18)");
            txt(ctx, String(d + 1), dr.x + 12, dr.y + 21, "bold 10px " + SANS, GOLD);
            txt(ctx, detailChips[d], dr.x + 26, dr.y + 21, "12px " + SANS, CREAM);
          }
        }

        if (msgT > 0 && msg) {
          ctx.save();
          ctx.globalAlpha = Math.min(1, msgT * 1.6);
          var col = lastKind === "good" ? GREEN : (lastKind === "bad" ? RED : MUTED);
          txt(ctx, msg, 430, 396, "11px " + SANS, col, "center");
          ctx.restore();
        }
      }

      function drawSummary(ctx) {
        ctx.save();
        ctx.fillStyle = "rgba(18,15,12,.97)";
        rrect(ctx, 0, 28, W, 390, 0); ctx.fill();

        var w = win();
        txt(ctx, w ? "Jurnal yopildi — siz bir necha bolani ko'rdingiz" : "Jurnal yopildi — ko'pchilikni ko'rmadingiz",
            426, 68, "bold 17px " + SANS, w ? GREEN : RED, "center");
        txt(ctx, "ismlar " + names + "/14   ·   ko'rilgan " + details + "   ·   xato " + wrong + "   ·   ishonch " + trust + "/" + maxTrust,
            426, 96, "11.5px " + SANS, MUTED, "center");

        var missed = [];
        for (var i = 0; i < PUPILS.length; i++) if (!named[i]) missed.push(PUPILS[i].name);
        txt(ctx, "Bugun ko'rmaganlaringiz:", 120, 132, "bold 11px " + SANS, GOLD);
        var line = missed.length ? missed.join(", ") : "hech kim — hammasini ko'rdingiz";
        var lines = wrap(ctx, line, 610);
        ctx.font = "12px " + SANS;
        for (var k = 0; k < Math.min(3, lines.length); k++) {
          txt(ctx, lines[k], 120, 154 + k * 17, "12px " + SANS, CREAM);
        }
        txt(ctx, "Ular sizni ko'rdi. Siz ularni ko'rmadingiz — va ertaga bu farq bilinadi.",
            426, 236, "11.5px " + SANS, MUTED, "center");
        txt(ctx, w ? "Ertaga beshtasini ism bilan chaqirasiz. Qolganini — juma." :
                     "Ertaga o'sha ismlarni to'g'ri ayting. Bu qarz.",
            426, 262, "11.5px " + SANS, w ? GREEN : GOLD, "center");
        txt(ctx, "ENTER", 426, 300, "10px " + SANS, DIM, "center");
        ctx.restore();
      }
    }
  });
})();
