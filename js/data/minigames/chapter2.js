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
        { id: "greet", title: "Har birini ismi bilan kutib olish",
          line: "«Salom, Zarina. Salom, Dilnoza.» — har biriga alohida, eshikda.",
          warm: 3, order: 1, kind: "warm" },
        { id: "precorrect", title: "Oldindan aytish: nima bo'ladi",
          line: "«Yigirma soniyadan keyin boshlaymiz. Kim tayyor bo'lsa — qo'lini ko'taradi.»",
          warm: 0, order: 3, kind: "cold" },
        { id: "board", title: "Vazifa doskada allaqachon yozilgan",
          line: "Ular kirganda ish tayyor turadi. Hech kim ko'rsatma kutmaydi.",
          warm: 0, order: 3, kind: "cold" },
        { id: "quiet", title: "Kechagi kunga bir og'iz so'z",
          line: "Bitta bolaga, boshqalar eshitmaydigan ovozda: «Bugun osonroq bo'ladi.»",
          warm: 3, order: 0, kind: "warm" },
        { id: "praise", title: "Aniq maqtov — kimga va nimaga",
          line: "«Nafisa, daftarni birinchi bo'lib ochding. Ana shunday boshlanadi.»",
          warm: 2, order: 1, kind: "warm" },
        { id: "frame", title: "Xonaning qanday xona ekanini aytish",
          line: "«Bu xonada xato qilish mumkin. Xatoni yashirish — mumkin emas.»",
          warm: 1, order: 2, kind: "neutral" }
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
          detail: "issiqlik " + tw + " / tartib " + to,
          notes: w
            ? [{ principle: "C2-001", verdict: "good",
                 text: "Iliq va tartibli — ikkalasi birga. Bu tasodif emas: eshikda ismi bilan kutib olish, oldindan aytilgan jumla va doskada tayyor turgan ish birgalikda ishlaydi. Sinf sizni tanladi." }]
            : [{ principle: "C2-001", verdict: "weak",
                 text: "Bitta o'qni yo'qotdingiz: iliqliksiz tartib — sovuqlik, tartibsiz iliqlik — shovqin. Birinchi taassurotni qaytarish qirq daqiqa oladi." }]
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

  G.minigames.register("cardRun", {
    title: "O'n to'rt ism, olti karta",
    subtitle: "O'n to'rt kartani o'qishga vaqt yo'q. Oltitasini tanlang — keyin uchtasini ishlatasiz.",
    controls: "1-9 va strelkalar — karta tanlash · ENTER — o'qish / ishlatish · ESC — bekor qilish",
    principles: ["C2-003"],
    create: function (api) {
      var W = 852, H = 418;
      var MOUSE_X = 54, MOUSE_Y = 108;

      // 14 pupils. Six have real facts worth using; the rest are noise on purpose.
      // "use" is what the teacher could SAY to that pupil if he read the card.
      var PUPILS = [
        { name: "Zarina",  fact: "U boshqalarga tushuntirib beradi — hali o'zi ham ishonchi komil bo'lmasa ham.", use: "Sen tushuntirishni yaxshi ko'rasan. Bugun sen boshla." },
        { name: "Dilnoza", fact: "U hech kim so'ramagan savolni so'raydi.", use: "Sen savol berasan. Bugun bitta savolingni oxiriga qoldir." },
        { name: "Jasur",   fact: "Eng baland ovoz, lekin kulganlar unga qarab kuladi, u bilan emas.", use: "Sen sinfning ovozisan. Bugun men senga tayanaman." },
        { name: "Nafisa",  fact: "Kitobdagi hamma misolni yechib bo'lgan — shuning uchun jim.", use: "Sen hammasini bilasan. Senga qiyinroq savol beraman." },
        { name: "Bekzod",  fact: "Uch hafta oldin kelgan, daftari yo'q, bitta yirtilgan varaq.", use: "Sen yangi kelgansan. Men ham. Keling birga o'rganamiz." },
        { name: "Timur",   fact: "Har kuni erta keladi va oshxonada yakka non yeydi.", use: "Sen erta kelasan. Ertaga birga choy ichamiz." },
        { name: "Aziza",   fact: "Darsdan keyin ukasini kutadi.", use: "Ukangni kutasan — bugun tezroq chiqishing mumkin." },
        { name: "Sardor",  fact: "Futbol o'ynaydi, har tanaffusda.", use: "Sen futbolchisan. Hisobni tez yuritasan shekilli." },
        { name: "Kamola",  fact: "Daftarining chetiga gul chizadi.", use: "Chizishing chiroyli. Doskaga sen yoz." },
        { name: "Rustam",  fact: "Birinchi partada o'tiradi, hamma savolga qo'l ko'taradi.", use: "Sen birinchi bo'lib qo'l ko'tarasan. Bugun oxirgi bo'lib ko'r." },
        { name: "Gulnora", fact: "Ovqatlanmaydi — tanaffusda kutubxonada.", use: "Kutubxonada ko'p bo'lasan. Menga bitta kitob maslahat ber." },
        { name: "Umid",    fact: "Telefonga qarab o'tiradi, lekin hamma javobni biladi.", use: "Sen tez hisoblaysan. Ekranni yashir — o'zing ayt." },
        { name: "Sevara",  fact: "Doim ikkinchi qatorda, hech kim bilan gaplashmaydi.", use: "Sen jim o'tirasan. Bugun bir marta gapir — men kutaman." },
        { name: "Farrux",  fact: "Singlisi shu maktabda o'qiydi.", use: "Singling bu maktabda. U ham sen kabi jimmi?" }
      ];

      var READ_BUDGET = 6;
      var USE_TARGET = 3;

      var read = [];        // indices read
      var used = [];        // indices used
      var guessing = false; // once budget spent, remaining picks are guesses
      var phase = "read";   // read | use | done
      var sel = 0;
      var t = 0, doneT = 0, finished = false, flash = 0, flashGood = false;
      var feedback = "";    // last line shown
      var feedbackT = 0;

      function sfx(name, f) {
        if (api.sound && api.sound[name]) { try { api.sound[name](f); } catch (e) {} }
      }
      function wasRead(idx) { return read.indexOf(idx) >= 0; }
      function isUsed(idx) { return used.indexOf(idx) >= 0; }

      function layout() {
        var out = [];
        for (var i = 0; i < PUPILS.length; i++) {
          var col = i % 7, row = (i / 7) | 0;
          out.push({ x: 8 + col * 120, y: 96 + row * 96, w: 112, h: 88 });
        }
        return out;
      }

      function pick(idx) {
        if (finished) return;
        if (phase === "read") {
          if (wasRead(idx)) { feedback = "Bu kartani allaqachon o'qidingiz."; feedbackT = 1.6; sfx("select"); return; }
          if (read.length >= READ_BUDGET) {
            // budget spent — switch to use phase
            phase = "use";
            feedback = "Olti karta o'qildi. Endi uchtasini ishlating.";
            feedbackT = 2.2;
            sfx("tick", 300);
            return;
          }
          read.push(idx);
          sfx("blip", 380 + read.length * 40);
          if (read.length >= READ_BUDGET) {
            feedback = "Olti karta o'qildi. Endi uchtasini ishlating.";
            feedbackT = 2.2;
            phase = "use";
          } else {
            feedback = PUPILS[idx].name + " — o'qildi.";
            feedbackT = 1.4;
          }
          return;
        }
        // use phase
        if (isUsed(idx)) { feedback = "Uni allaqachon tanladingiz."; feedbackT = 1.4; return; }
        if (used.length >= USE_TARGET) return;
        used.push(idx);
        // A pick is "informed" if the player read that pupil's card.
        var informed = wasRead(idx);
        flash = 1; flashGood = informed;
        sfx(informed ? "good" : "bad", informed ? 560 : 190);
        feedback = informed
          ? PUPILS[idx].name + ": «" + PUPILS[idx].use + "» — siz buni bilardingiz."
          : PUPILS[idx].name + " — taxmin qildingiz. Siz bu kartani o'qimadingiz.";
        feedbackT = 2.6;
        if (used.length >= USE_TARGET) { phase = "done"; doneT = 0; sfx("select"); }
      }

      function informedCount() {
        var n = 0;
        for (var i = 0; i < used.length; i++) if (wasRead(used[i])) n++;
        return n;
      }
      function win() { return informedCount() >= 2; }

      function finishNow() {
        if (finished) return;
        finished = true;
        var n = informedCount(), w = win();
        sfx(w ? "win" : "bad");
        api.finish({
          win: w,
          choiceId: w ? "CH2_MG_NAMES_WIN" : "CH2_MG_NAMES_LOSE",
          detail: "o'qildi " + read.length + " / ishlatildi " + used.length + " / aniq " + n,
          notes: w
            ? [{ principle: "C2-003", verdict: "good",
                 text: "O'n to'rtdan oltitasini tanlab o'qidingiz va faqat bilinganlarini ishlatdingiz. Bu tarqoq diqqat emas — taqsimlangan diqqat. Kimdir ko'rilganini biladi, va bu sanalganidan qimmatroq." }]
            : [{ principle: "C2-004", verdict: "weak",
                 text: "Uchtadan " + n + " tasi aniq edi, qolgani taxmin. Bir o'lcham hammaga to'g'ri kelmaydi: noto'g'ri odamga aytilgan to'g'ri gap ham xato gap bo'lib eshitiladi." }]
        });
      }

      function gridClick(mx, my) {
        var L = layout();
        for (var i = 0; i < L.length; i++) {
          var r = L[i];
          if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) { pick(i); return true; }
        }
        return false;
      }

      return {
        update: function (dt) {
          t += dt;
          feedbackT = Math.max(0, feedbackT - dt);
          flash = Math.max(0, flash - dt * 2);
          if (phase === "done") {
            doneT += dt;
            if (doneT > 2.4) finishNow();
          }
        },

        onKey: function (key) {
          if (finished) return;
          if (phase === "done") { if (key === "enter" || key === "space") finishNow(); return; }
          if (key >= "1" && key <= "9") {
            // 1-9 map to the first nine cards; arrows cover the rest
            var idx = parseInt(key, 10) - 1;
            if (idx < PUPILS.length) { sel = idx; pick(idx); }
            return;
          }
          if (key === "arrowleft" || key === "a") { sel = (sel + PUPILS.length - 1) % PUPILS.length; sfx("tick", 260); return; }
          if (key === "arrowright" || key === "d") { sel = (sel + 1) % PUPILS.length; sfx("tick", 260); return; }
          if (key === "arrowup" || key === "w") { sel = (sel + PUPILS.length - 7) % PUPILS.length; sfx("tick", 260); return; }
          if (key === "arrowdown" || key === "s") { sel = (sel + 7) % PUPILS.length; sfx("tick", 260); return; }
          if (key === "enter" || key === "space") { pick(sel); return; }
        },

        onPointer: function (x, y) {
          if (finished) return;
          gridClick(x - MOUSE_X, y - MOUSE_Y);
        },

        draw: function (ctx) {
          ctx.textAlign = "left";
          ctx.textBaseline = "alphabetic";

          // header
          ctx.fillStyle = "rgba(255,255,255,.55)";
          ctx.font = "13px system-ui, sans-serif";
          ctx.fillText("O'qilgan: " + read.length + "/" + READ_BUDGET +
                       "   ·   Ishlatilgan: " + used.length + "/" + USE_TARGET, 8, 20);

          if (phase === "read") {
            ctx.fillStyle = "rgba(255,213,128,.95)";
            ctx.fillText("Kartalarni o'qing: " + (READ_BUDGET - read.length) + " ta qoldi", 8, 40);
          } else {
            ctx.fillStyle = "rgba(150,230,170,.95)";
            ctx.fillText("Endi faktlarni ishlating — kimga, nima deysiz?", 8, 40);
          }

          var L = layout();
          for (var i = 0; i < PUPILS.length; i++) {
            var r = L[i], p = PUPILS[i];
            var visited = wasRead(i);
            var spent = isUsed(i);

            // card background
            if (spent) ctx.fillStyle = wasRead(i) ? "rgba(90,150,110,.42)" : "rgba(160,80,80,.40)";
            else if (visited) ctx.fillStyle = "rgba(255,255,255,.16)";
            else ctx.fillStyle = "rgba(255,255,255,.07)";
            ctx.fillRect(r.x, r.y, r.w, r.h);

            // selection ring
            if (i === sel) {
              ctx.strokeStyle = "rgba(255,222,152,.95)";
              ctx.lineWidth = 2;
              ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
            } else {
              ctx.strokeStyle = "rgba(255,255,255,.14)";
              ctx.lineWidth = 1;
              ctx.strokeRect(r.x + .5, r.y + .5, r.w - 1, r.h - 1);
            }

            // name
            ctx.fillStyle = "rgba(255,255,255,.94)";
            ctx.font = "13px system-ui, sans-serif";
            ctx.fillText(p.name, r.x + 7, r.y + 19);

            // fact or blank
            if (visited) {
              ctx.fillStyle = "rgba(255,255,255,.72)";
              ctx.font = "10px system-ui, sans-serif";
              var lines = wrap(ctx, p.fact, r.w - 14);
              for (var k = 0; k < Math.min(3, lines.length); k++) {
                ctx.fillText(lines[k], r.x + 7, r.y + 34 + k * 12);
              }
            } else {
              ctx.fillStyle = "rgba(255,255,255,.20)";
              ctx.font = "11px system-ui, sans-serif";
              ctx.fillText("o'qilmagan", r.x + 7, r.y + 40);
            }

            // a tick for spent
            if (spent) {
              ctx.fillStyle = wasRead(i) ? "rgba(150,230,170,.95)" : "rgba(255,150,150,.95)";
              ctx.font = "13px system-ui, sans-serif";
              ctx.fillText(wasRead(i) ? "✓" : "?", r.x + r.w - 18, r.y + 19);
            }
          }

          // feedback line
          if (feedbackT > 0 && feedback) {
            ctx.fillStyle = flash > 0
              ? (flashGood ? "rgba(150,230,170,.98)" : "rgba(255,150,150,.98)")
              : "rgba(255,255,255,.86)";
            ctx.font = "12px system-ui, sans-serif";
            var fl = wrap(ctx, feedback, W - 16);
            for (var q = 0; q < Math.min(3, fl.length); q++) {
              ctx.fillText(fl[q], 8, 300 + q * 15);
            }
          }

          if (phase === "done") {
            ctx.fillStyle = "rgba(255,255,255,.94)";
            ctx.font = "15px system-ui, sans-serif";
            ctx.fillText(win() ? "Yaxshi: ko'pchiligi aniq edi." : "Ko'pi taxmin bo'ldi.", 8, 372);
          }
        }
      };
    }
  });

  var CMP_ROUNDS = [
    {
      name: "Dilnoza",
      seat: "birinchi qator · daftari to'la",
      skin: 2,
      intel: "Kecha darsdan keyin qoldi. O'zi xato yechgan misolni qaytadan yechdi.",
      options: [
        { kind: "false",
          text: "Sen sinfning eng aqllisisan — sen hech qachon xato qilmaysan.",
          fb: "U xato qiladi va buni o'zi biladi: kecha xatoni tuzatgan. Yolg'on maqtov ishonchni yo'qotadi." },
        { kind: "right",
          text: "Kecha o'sha misolni qaytadan yechganingni ko'rdim. Xatoni o'zing topib tuzatding — bu qiyin ish.",
          fb: "Bitta ism, bitta kechagi ish. Aynan shu gap ertaga ham esda qoladi." },
        { kind: "generic",
          text: "Barakalla, juda yaxshi. Sen zo'r o'quvchisan.",
          fb: "Bu gapni sinfdagi hamma bolaga aytish mumkin. Shuning uchun u hech kimga tegishli emas." },
        { kind: "backhanded",
          text: "Yaxshi, hech bo'lmasa bir marta urinib ko'rding.",
          fb: "«Hech bo'lmasa» — maqtov emas, tanbeh. U buni eshitadi." }
      ]
    },
    {
      name: "Jasur",
      seat: "orqa qator · maydon chizadi",
      skin: 3,
      intel: "Oxirgi masalani kitobdagidan boshqacha yechdi. Javob to'g'ri chiqdi.",
      options: [
        { kind: "generic",
          text: "Barakalla, juda yaxshi ishlading.",
          fb: "«Juda yaxshi» uning nima qilganini aytmaydi. U siz nimani ko'rganingizni bilmaydi." },
        { kind: "backhanded",
          text: "Nihoyat bitta masalani o'zing yechding.",
          fb: "«Nihoyat» so'zi maqtovni tanbehga aylantirdi — u o'sha gapni eslab qoladi." },
        { kind: "right",
          text: "Oxirgi masalani boshqacha yechding, javob esa to'g'ri. Usulingni menga ham ko'rsatasanmi?",
          fb: "Usulni nomladingiz va o'rganishga tayyorligingizni aytdingiz. Bu maqtov ham, taklif ham." },
        { kind: "false",
          text: "Sen eng tez hisoblaydigan o'quvchisan — sendan tez hech kim yechmaydi.",
          fb: "U tez emas, boshqacha hisoblaydi. Yolg'on maqtov uni himoyaga o'tkazadi." }
      ]
    },
    {
      name: "Bekzod",
      seat: "deraza yonida · uch hafta bo'ldi",
      skin: 5,
      intel: "Uch hafta oldin boshqa maktabdan keldi. Hali sinfda gapirmadi — lekin daftaridagi javoblar to'g'ri.",
      options: [
        { kind: "right",
          text: "Bekzod, uch haftada bir marta ham gapirmading, lekin daftaringdagi javoblar to'g'ri. Bugun darsda seni so'rayman — tayyor bo'l.",
          fb: "Jimlikni tan oldingiz va uni ayblamadingiz. Bu maqtov emas, taklif — va u aynan shuni kutgan." },
        { kind: "generic",
          text: "Barakalla, sen ham yaxshi o'quvchisan.",
          fb: "Umumiy gap yangi bola uchun bo'sh gap: u hali bu sinfda ko'rinmagan." },
        { kind: "false",
          text: "Sen sinfning eng faol o'quvchisisan — hamma seni juda yaxshi taniydi.",
          fb: "U yangi va hech kim uni tanimaydi. Yolg'on maqtov darhol seziladi." },
        { kind: "backhanded",
          text: "Yaxshi, jim o'tirsang — hech bo'lmasa darsni buzmayapsan.",
          fb: "Jimlikni «yaxshi» deb atadingiz — ya'ni u shunday qolishini xohlaysiz." }
      ]
    },
    {
      name: "Timur",
      seat: "orqa qator · ikki hafta kasal edi",
      skin: 0,
      intel: "Partadoshi misolni yecholmay o'tirganda, o'zi so'ramasdan yoniga o'tib tushuntirdi.",
      options: [
        { kind: "generic",
          text: "Barakalla, juda yaxshi.",
          fb: "Bu gap uning qilgan ishini aytmaydi. U o'zi bilmaydi siz nimani ko'rdingiz." },
        { kind: "false",
          text: "Sen eng kuchli matematiksan — hamma masalani birinchi bo'lib yechasan.",
          fb: "U ikki hafta kasal bo'lib orqada qolgan. Bu gap unga yana yuk bo'ladi." },
        { kind: "backhanded",
          text: "Yaxshi, o'z ishingni qo'yib, boshqaning ishiga aralashding.",
          fb: "Yordamni «aralashish» deb atadingiz. U keyingi safar yordam bermaydi." },
        { kind: "right",
          text: "Seni hech kim so'ramadi — o'zing borib tushuntirding. Bu sinfda eng qimmat narsa.",
          fb: "Aniq ish, aniq vaqt: so'ralmasdan qilingan yordam. Bu gap unga o'z qadrini ko'rsatadi." }
      ]
    }
  ];


  G.minigames.register("giftRun", {
    title: "Bir o'lcham hammaga to'g'ri kelmaydi",
    subtitle: "Bitta o'quvchi, bitta fakt — va bitta gap. Umumiy maqtov hech kimga tegishli emas.",
    controls: "1-4 — tanlash · ENTER — tasdiqlash · sichqoncha bilan ham bo'ladi",
    principles: ["C2-004"],

    create: function (api) {
      var ri = 0;                 // current round
      var sel = 0;                // highlighted option
      var phase = "ask";          // ask | feedback | verdict
      var picks = [];             // picks[round] = { idx, kind }
      var t = 0, vT = 0, finished = false;
      var lastCtx = null;

      function cur() { return CMP_ROUNDS[ri]; }

      function pick(i) {
        if (finished || phase !== "ask") return;
        var r = cur();
        if (i < 0 || i >= r.options.length) return;
        picks[ri] = { idx: i, kind: r.options[i].kind };
        sel = i;
        phase = "feedback";
        sfx(api, r.options[i].kind === "right" ? "good" : "bad");
      }

      function advance() {
        if (finished || phase !== "feedback") return;
        if (ri >= CMP_ROUNDS.length - 1) {
          phase = "verdict";
          vT = 0;
          if (tally().win) sfx(api, "win"); else sfx(api, "blip", 300);
          return;
        }
        ri++;
        sel = 0;
        phase = "ask";
        sfx(api, "blip", 540);
      }

      function tally() {
        var right = 0, generic = 0, flattery = 0, backhanded = 0;
        for (var i = 0; i < picks.length; i++) {
          var p = picks[i];
          if (!p) continue;
          if (p.kind === "right") right++;
          else if (p.kind === "generic") generic++;
          else if (p.kind === "false") flattery++;
          else backhanded++;
        }
        var win = right >= 3;
        var choiceId = !win ? "CH2_MG_GIFT_WRONG"
          : (generic > 0 ? "CH2_MG_GIFT_OK" : "CH2_MG_GIFT_BEST");
        return {
          right: right, generic: generic, flattery: flattery,
          backhanded: backhanded, win: win, choiceId: choiceId
        };
      }

      function detailLine(s) {
        if (!s.win) {
          return "Aniq maqtov " + s.right + "/4. Qolgan gaplar umumiy, yolg'on yoki kinoya bo'ldi.";
        }
        if (s.generic > 0) {
          return "Aniq maqtov " + s.right + "/4 — lekin orada bitta umumiy gap bor.";
        }
        return "Aniq maqtov " + s.right + "/4: har bir gap bitta haqiqiy ishga tayanadi.";
      }

      function closingLine(s) {
        if (!s.win) {
          return "Yolg'on maqtov tez unutiladi; aniq maqtov ertaga ham ishlaydi. Ertaga bittadan boshlang.";
        }
        if (s.generic > 0) {
          return "Bitta umumiy gap butun ishni bekor qilmaydi — lekin esda qoladigan gap shu bo'lib qolmasin.";
        }
        return "Ular ertaga sizni sinf emas, o'zini ko'rgan odam deb biladi.";
      }

      function finishNow() {
        if (finished) return;
        finished = true;
        var s = tally();
        var notes = [];
        if (s.win && s.generic === 0) {
          notes.push({
            principle: "C2-004", verdict: "good",
            text: "Har bir maqtovda ism va bitta haqiqiy ish bor edi: kechagi tuzatish, boshqa usul, uch haftalik jimlik, so'ralmagan yordam. Umumiy maqtov ertaga eslanmaydi; shu gaplar eslanadi."
          });
          notes.push({
            principle: "C2-005", verdict: "good",
            text: "Maqtov o'lchov emas, payqash edi: har biri o'sha bolaning o'z momentida, o'sha ish haqida aytildi."
          });
        } else if (s.win) {
          notes.push({
            principle: "C2-004", verdict: "ok",
            text: "Ko'p maqtov aniq edi, lekin orada bittasi umumiy bo'lib qoldi — hamma bolaga aytiladigan gap. Umumiy gap yaxshi niyatni ko'rsatadi, lekin hech kimga tegishli emas."
          });
          notes.push({
            principle: "C2-005", verdict: "ok",
            text: "Bitta umumiy gap butun ishni bekor qilmaydi. Lekin o'quvchi eslab qoladigan gap shu bo'lib qolsa, qolgan uchtasi unutiladi."
          });
        } else {
          notes.push({
            principle: "C2-004", verdict: "weak",
            text: "Ikki yoki undan kam maqtov aniq chiqdi. Qolganlari umumiy, yolg'on yoki kinoya edi — va o'quvchi qaysi biri ekanini biladi."
          });
          notes.push({
            principle: "C2-005", verdict: "weak",
            text: "Yolg'on maqtov bir zumda ishonchni yo'qotadi: o'quvchi siz maqtagan narsani qilmaganini o'zi biladi."
          });
        }
        api.finish({
          win: s.win,
          choiceId: s.choiceId,
          detail: detailLine(s),
          notes: notes,
          effects: s.win ? [{ intel: "intel_compliment" }] : []
        });
      }

      function layoutOptions() {
        var n = cur().options.length;
        var top = 32, bottom = 300, gap = 10;
        var h = Math.floor((bottom - top - gap * (n - 1)) / n);
        var out = [];
        for (var i = 0; i < n; i++) out.push({ x: 248, y: top + i * (h + gap), w: 590, h: h });
        return out;
      }

      return {
        update: function (dt) {
          t += dt;
          if (finished) return;
          if (phase === "verdict") {
            vT += dt;
            if (vT > 8) finishNow();
          }
        },

        onKey: function (key) {
          if (finished) return;
          if (phase === "verdict") {
            if (key === "enter" || key === "space" || key === "r") finishNow();
            return;
          }
          if (phase === "feedback") {
            if (key === "enter" || key === "space") advance();
            return;
          }
          var n = cur().options.length;
          if (key >= "1" && key <= String(n)) { pick(parseInt(key, 10) - 1); return; }
          if (key === "arrowleft" || key === "a" || key === "arrowup" || key === "w") {
            sel = (sel <= 0) ? n - 1 : sel - 1;
            sfx(api, "blip", 500);
          } else if (key === "arrowright" || key === "d" || key === "arrowdown" || key === "s") {
            sel = (sel + 1) % n;
            sfx(api, "blip", 520);
          } else if (key === "enter" || key === "space") {
            pick(sel);
          }
        },

        onPointer: function (x, y, kind) {
          if (finished || kind !== "down") return;
          var p = { x: x - MOUSE_X, y: y - MOUSE_Y };
          if (phase === "verdict") { finishNow(); return; }
          if (phase === "feedback") {
            // only the feedback panel advances: a mis-click just after choosing
            // must not skip the sentence the game is trying to teach.
            if (p.x >= 248 && p.x <= 838 && p.y >= 310 && p.y <= 412) advance();
            return;
          }
          var cs = layoutOptions();
          for (var i = 0; i < cs.length; i++) {
            if (inRect(p, cs[i].x, cs[i].y, cs[i].w, cs[i].h)) { pick(i); return; }
          }
        },

        draw: function (ctx) {
          lastCtx = ctx;
          if (phase === "verdict") { drawVerdict(ctx); return; }
          drawPupilCard(ctx);
          drawIntel(ctx);
          drawOptions(ctx);
          if (phase === "feedback") drawFeedback(ctx);
        },

        debugState: function () {
          return {
            round: ri, phase: phase, sel: sel, pickCount: picks.length,
            tally: tally(), finished: finished
          };
        },
        debugPick: function (i) { pick(i); return picks[ri] ? picks[ri].kind : null; },
        debugNext: function () { advance(); return phase; },
        // line counts for the overflow audit: intel + every option, wrapped at
        // the widths the draw code actually uses.
        debugLayout: function () {
          var c = lastCtx;
          if (!c) return null;
          var out = [];
          for (var i = 0; i < CMP_ROUNDS.length; i++) {
            var r = CMP_ROUNDS[i];
            c.font = "11px " + SANS;
            var intelLines = wrap(c, r.intel, 208).length;
            var optLines = [];
            for (var k = 0; k < r.options.length; k++) {
              c.font = "12.5px " + SANS;
              optLines.push(wrap(c, r.options[k].text, 590 - 62).length);
            }
            out.push({ name: r.name, intelLines: intelLines, optLines: optLines });
          }
          return out;
        }
      };

      /* ---------------------------------------------------------- drawing */

      function drawPupilCard(ctx) {
        var r = cur();
        rrect(ctx, 0, 0, 236, 252, 10);
        ctx.fillStyle = "rgba(20,17,14,.62)"; ctx.fill();
        ctx.strokeStyle = "rgba(246,239,227,.12)"; ctx.lineWidth = 1; ctx.stroke();

        ctx.save();
        ctx.translate(118, 152);
        ctx.scale(2.7, 2.7);
        drawPupil(ctx, 0, 0, 0.7, 0.92, t * 0.6 + 1.3, 2.1, SKINS[r.skin % SKINS.length]);
        ctx.restore();

        txt(ctx, r.name, 118, 214, "bold 16px " + SANS, CREAM, "center");
        txt(ctx, r.seat, 118, 234, "10px " + SANS, MUTED, "center");
      }

      function drawIntel(ctx) {
        var r = cur();
        rrect(ctx, 0, 264, 236, 98, 10);
        ctx.fillStyle = "rgba(242,196,105,.07)"; ctx.fill();
        ctx.strokeStyle = "rgba(242,196,105,.30)"; ctx.lineWidth = 1; ctx.stroke();
        txt(ctx, "BILGANIM", 14, 284, "bold 9.5px " + SANS, GOLD);
        ctx.font = "11px " + SANS;
        var lines = wrap(ctx, r.intel, 208);
        for (var i = 0; i < Math.min(4, lines.length); i++) {
          txt(ctx, lines[i], 14, 302 + i * 14, "11px " + SANS, CREAM);
        }
      }

      function drawOptions(ctx) {
        var r = cur(), cs = layoutOptions();
        txt(ctx, "Qaysi gapni aytasiz?", 248, 14, "bold 12px " + SANS, GOLD);
        for (var d = 0; d < CMP_ROUNDS.length; d++) {
          ctx.beginPath();
          ctx.arc(760 + d * 16, 14, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = d < ri ? "rgba(242,196,105,.55)" : (d === ri ? GOLD : "rgba(246,239,227,.16)");
          ctx.fill();
        }
        txt(ctx, String(ri + 1) + " / 4", 838, 14, "10px " + SANS, MUTED, "right");

        for (var i = 0; i < cs.length; i++) {
          var c = cs[i], o = r.options[i];
          var isSel = (phase === "ask" && sel === i);
          var isRight = (phase === "feedback" && o.kind === "right");
          var pickedWrong = (phase === "feedback" && picks[ri] && picks[ri].idx === i && o.kind !== "right");

          rrect(ctx, c.x, c.y, c.w, c.h, 8);
          ctx.fillStyle = isRight ? "rgba(143,224,143,.10)"
            : pickedWrong ? "rgba(217,117,92,.12)"
              : isSel ? "rgba(242,196,105,.11)" : "rgba(246,239,227,.045)";
          ctx.fill();
          ctx.strokeStyle = isRight ? "rgba(143,224,143,.75)"
            : pickedWrong ? "rgba(217,117,92,.75)"
              : isSel ? GOLD : "rgba(246,239,227,.14)";
          ctx.lineWidth = (isSel || isRight || pickedWrong) ? 1.6 : 1;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(c.x + 22, c.y + c.h / 2, 11, 0, Math.PI * 2);
          ctx.fillStyle = isSel ? "rgba(242,196,105,.22)" : "rgba(246,239,227,.07)";
          ctx.fill();
          txt(ctx, String(i + 1), c.x + 22, c.y + c.h / 2, "bold 11px " + SANS,
              isSel ? GOLD : MUTED, "center");

          ctx.font = "12.5px " + SANS;
          var lines = wrap(ctx, o.text, c.w - 62);
          var shown = Math.min(2, lines.length);
          var ty = c.y + c.h / 2 - (shown - 1) * 8;
          for (var k = 0; k < shown; k++) {
            txt(ctx, lines[k], c.x + 42, ty + k * 16, "12.5px " + SANS, CREAM);
          }
        }
      }

      function drawFeedback(ctx) {
        var r = cur(), p = picks[ri];
        var o = p ? r.options[p.idx] : null;
        var ok = !!(o && o.kind === "right");

        rrect(ctx, 248, 310, 590, 102, 9);
        ctx.fillStyle = "rgba(20,17,14,.80)"; ctx.fill();
        ctx.strokeStyle = ok ? "rgba(143,224,143,.55)" : "rgba(217,117,92,.55)";
        ctx.lineWidth = 1.2; ctx.stroke();

        txt(ctx, ok ? "To'g'ri gap." : "Bu gap emas.", 266, 330,
            "bold 12.5px " + SANS, ok ? GREEN : RED);
        txt(ctx, "ENTER", 822, 330, "9.5px " + SANS, DIM, "right");

        ctx.font = "11.5px " + SANS;
        var lines = wrap(ctx, o ? o.fb : "", 552);
        for (var i = 0; i < Math.min(3, lines.length); i++) {
          txt(ctx, lines[i], 266, 352 + i * 15, "11.5px " + SANS, CREAM);
        }
        if (!ok) {
          txt(ctx, "yashil gardish — to'g'ri gapi", 266, 400, "10px " + SANS, GREEN);
        }
      }

      function drawVerdict(ctx) {
        var s = tally();
        ctx.save();
        rrect(ctx, 0, 0, 852, 412, 12);
        ctx.fillStyle = "rgba(22,18,15,.965)"; ctx.fill();
        ctx.strokeStyle = "rgba(242,196,105,.28)"; ctx.lineWidth = 1; ctx.stroke();

        txt(ctx, s.win ? "Maqtov ishladi" : "Maqtov ishlamadi", 426, 40,
            "bold 19px " + SANS, s.win ? GREEN : RED, "center");
        txt(ctx, "aniq maqtov " + s.right + " / 4", 426, 68,
            "12px " + SANS, GOLD, "center");

        txt(ctx, "kimga", 250, 100, "9.5px " + SANS, DIM);
        txt(ctx, "qanday gap", 470, 100, "9.5px " + SANS, DIM);
        txt(ctx, "natija", 756, 100, "9.5px " + SANS, DIM);

        for (var i = 0; i < CMP_ROUNDS.length; i++) {
          var p = picks[i], rr = CMP_ROUNDS[i], y = 124 + i * 26;
          var kind = p ? rr.options[p.idx].kind : "generic";
          var label = kind === "right" ? "aniq va rost"
            : kind === "generic" ? "umumiy"
              : kind === "false" ? "yolg'on" : "kinoya";
          txt(ctx, rr.name, 250, y, "12px " + SANS, CREAM);
          txt(ctx, label, 470, y, "11.5px " + SANS, kind === "right" ? GREEN : MUTED);
          txt(ctx, kind === "right" ? "hisoblandi" : "hisoblanmadi", 756, y,
              "10.5px " + SANS, kind === "right" ? GREEN : DIM);
        }

        ctx.font = "12px " + SANS;
        var dl = wrap(ctx, detailLine(s), 600);
        for (var k = 0; k < Math.min(2, dl.length); k++) {
          txt(ctx, dl[k], 426, 240 + k * 18, "12px " + SANS, CREAM, "center");
        }
        ctx.font = "11.5px " + SANS;
        var cl = wrap(ctx, closingLine(s), 600);
        for (var m = 0; m < Math.min(2, cl.length); m++) {
          txt(ctx, cl[m], 426, 292 + m * 16, "11.5px " + SANS, MUTED, "center");
        }
        txt(ctx, "ENTER", 426, 384, "10px " + SANS, DIM, "center");
        ctx.restore();
      }
    }
  });
})();
