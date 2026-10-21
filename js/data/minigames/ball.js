/* ball.js — "Hovlida bir pas" (ballPlay).
   Five kicks. A marker sweeps a bar; press SPACE when it sits in the green zone.
   Three or more clean hits wins. The yard, the boy and the ball's arc are drawn
   straight onto the canvas: no assets, no libraries.

   api.state nudges the feel, not the rules: intel_football slows the marker for
   the first two kicks (you know his game), a warm trust widens the green zones,
   and the notes name what the player learned earlier. choiceId: BALL_win / BALL_lose.

   The host draws the title, subtitle and controls line and clips us to 872x478
   logical pixels, so every coordinate below lives in that inset area. */

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

  var W = 872, H = 478, GROUND = 268;
  var CREAM = "#f6efe3", GOLD = "#f2c469", SANS = "system-ui, sans-serif";
  var MUTED = "rgba(246,239,227,0.62)";
  var BAR_X = 226, BAR_Y = 380, BAR_W = 420, BAR_H = 22;

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
    var w = String(s).split(" "), out = [], line = "";
    for (var i = 0; i < w.length; i++) {
      var p = line ? line + " " + w[i] : w[i];
      if (line && ctx.measureText(p).width > maxW) { out.push(line); line = w[i]; } else line = p;
    }
    if (line) out.push(line);
    return out;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function easeOut(x) { return 1 - Math.pow(1 - clamp(x, 0, 1), 3); }

  G.minigames.register("ballPlay", {
    title: "Hovlida bir pas",
    subtitle: "To'pni havoda ushlab tur — besh marta",
    controls: "SPACE — to'pga tegish · 5 urinish · 3 ta aniq tegish — g'alaba",
    principleIds: ["I-043", "I-028"],

    create: function (api) {
      var t = 0, fade = 1, done = false, phase = "ready", round = 0, hits = 0;
      var streak = 0, bestStreak = 0, results = [], marker = 0, dir = 1;
      var speed = 0.6, zoneStart = 0.42, zoneW = 0.25, resultT = 0, lastHit = null;
      var ball = { x: 430, y: GROUND - 13, vx: 0, vy: 0, spin: 0 };
      var trail = [], boyLean = 0, flash = 0;

      var intelList = (api.state && api.state.intel) || [];
      var flagMap = (api.state && api.state.flags) || {};
      function has(id) { return intelList.indexOf(id) >= 0 || intelList[id] === true; }
      function flag(n) { return flagMap[n] === true; }
      function sfx(n, a) {
        try { if (api.sound && typeof api.sound[n] === "function") api.sound[n](a); } catch (e) { /* optional */ }
      }
      function finishOnce(r) { if (done) return; done = true; api.finish(r); }

      var football = has("intel_football");
      var warm = typeof (api.state && api.state.trust) === "number" ? api.state.trust >= 7 : false;

      function newRound() {
        zoneW = (football ? 0.28 : 0.25) + Math.max(0, 0.05 - round * 0.012);
        if (warm) zoneW += 0.03;
        zoneStart = 0.12 + Math.random() * (0.76 - zoneW);
        speed = 0.5 + round * 0.06;
        if (football && round < 2) speed *= 0.88;
        marker = round % 2 === 0 ? 0 : 1;
        dir = round % 2 === 0 ? 1 : -1;
        phase = "live";
      }

      function strike() {
        if (phase !== "live" || done) return;
        var inside = marker >= zoneStart && marker <= zoneStart + zoneW;
        var perfect = marker >= zoneStart + zoneW * 0.36 && marker <= zoneStart + zoneW * 0.64;
        round += 1;
        ball.x = 430; ball.y = GROUND - 13; trail.length = 0;
        if (inside) {
          hits += 1; streak += 1; bestStreak = Math.max(bestStreak, streak);
          lastHit = perfect ? "perfect" : "good";
          if (perfect) flash = 1;
          sfx(perfect ? "win" : "good");
          ball.vx = 140 + Math.random() * 50;
          ball.vy = -(300 + 80 * (perfect ? 1.05 : 0.86));
          boyLean = 1;
        } else {
          lastHit = Math.abs(marker - (zoneStart + zoneW / 2)) > 0.28 ? "miss" : "near";
          streak = 0; sfx("bad");
          ball.vx = 210 + Math.random() * 70; ball.vy = -110;
          boyLean = 0.4;
        }
        results.push({ round: round, hit: inside, perfect: inside ? perfect : false });
        phase = "result"; resultT = 0;
      }

      function advance() {
        if (phase === "result" && resultT > 0.55) {
          if (round >= 5) wrapUp(); else newRound();
        }
      }

      function wrapUp() {
        var won = hits >= 3;
        var notes = [{ principle: "I-043",
          text: "O'yin sovg'a emas. To'pni qaytarish — «seni eshitdim» deyishning eng qisqa yo'li." }];
        if (won) {
          notes.push({ principle: "I-028",
            text: "Besh daqiqa davomida boshqa hech narsa yo'q edi: na daftar, na baho, na reja. U buni sezdi." });
          if (bestStreak >= 3) notes.push({ principle: "F-013",
            text: "Uch marta ketma-ket: o'yin ham suhbat kabi ritm talab qiladi — bir marta bo'shashsangiz, u qaytadan boshlanadi." });
        } else {
          notes.push({ principle: "I-001",
            text: "Yaxshi niyat yetmadi: siz o'ynashga urindingiz, lekin u o'zingizni ko'rsatishga o'xshadi. Bolalar buni tez sezadi." });
          notes.push({ principle: "I-028",
            text: "Uch marta o'tkazib yubordingiz. Muhimi — yiqilish emas, to'pni yana ko'tarib berish." });
        }
        if (football) notes.push({ principle: "I-043",
          text: "Uni futbol orqali taniganingiz bugun ishladi: o'yin tilini bilgan odam bilan o'ynash boshqacha." });
        if (warm) notes.push({ principle: "I-001",
          text: "Yo'lda yig'ilgan ishonch hovlida ko'rindi: u sizga to'pni birinchi bo'lib tashladi." });
        if (flag("met_oqil")) notes.push({ principle: "I-028",
          text: "Oqil «u umidsiz» degan edi. Bugun hovlida bu gapning narxi ko'rindi." });

        var effects = [{ intel: "intel_played_ball" }];
        if (won) effects.push({ trust: 2 }, { flag: "played_ball_well" });
        else if (hits >= 2) effects.push({ trust: 1 });
        else effects.push({ flag: "played_ball_awkward" });
        if (warm) effects.push({ trust: 1 });

        finishOnce({
          win: won,
          choiceId: won ? "BALL_win" : "BALL_lose",
          detail: won            ? "Beshta urinish, " + hits + " aniq tegish. Timur to'pni sizga qaytarib berdi — va keyin yana so'radi."
            : "Beshta urinish, " + hits + " aniq tegish. Timur to'pni olib ketdi, lekin darvozadan oldin ortiga qaradi.",
          notes: notes,
          effects: effects,
          summary: { hits: hits, bestStreak: bestStreak, results: results.slice() }
        });
      }

      function drawYard(ctx) {
        var sky = ctx.createLinearGradient(0, -20, 0, 210);
        sky.addColorStop(0, "#5d7fa8"); sky.addColorStop(0.55, "#93a9b8"); sky.addColorStop(1, "#d9c9a8");
        ctx.fillStyle = sky; ctx.fillRect(-10, -30, W + 20, 240);
        var glow = ctx.createRadialGradient(660, 40, 8, 660, 40, 210);
        glow.addColorStop(0, "rgba(255,238,190,0.55)"); glow.addColorStop(1, "rgba(255,238,190,0)");
        ctx.fillStyle = glow; ctx.fillRect(420, -30, 460, 240);

        for (var i = 0; i < 7; i++) {
          var h = 34 + (i % 3) * 14;
          ctx.fillStyle = "rgba(98,116,142,0.75)";
          ctx.fillRect(i * 136 - 20, 172 - h, 118, h);
        }
        ctx.fillStyle = "rgba(255,214,150,0.5)";
        for (var j = 0; j < 5; j++) ctx.fillRect(74 + j * 136, 168, 13, 14);

        ctx.fillStyle = "#b9a488"; ctx.fillRect(-10, 190, W + 20, 28);
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        for (var k = 0; k < 24; k++) ctx.fillRect(k * 40, 190, 2, 28);
        ctx.fillStyle = "#7d6a52"; ctx.fillRect(600, 160, 196, 58);
        ctx.fillStyle = "#2f3a33"; ctx.fillRect(612, 168, 72, 50); ctx.fillRect(712, 168, 72, 50);
        ctx.fillStyle = "rgba(255,255,255,0.10)";
        for (var g = 0; g < 8; g++) ctx.fillRect(618 + g * 9, 168, 2, 50);

        ctx.fillStyle = "#3f5a35";
        ctx.beginPath();
        ctx.arc(104, 148, 54, 0, Math.PI * 2);
        ctx.arc(74, 176, 34, 0, Math.PI * 2);
        ctx.arc(136, 176, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#33502c"; ctx.beginPath(); ctx.arc(104, 162, 38, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#4a3626"; ctx.fillRect(97, 190, 14, 34);

        var gr = ctx.createLinearGradient(0, GROUND - 20, 0, H);
        gr.addColorStop(0, "#8f7c5c"); gr.addColorStop(0.35, "#7a6a4e"); gr.addColorStop(1, "#55492f");
        ctx.fillStyle = gr; ctx.fillRect(-10, GROUND - 20, W + 20, H - GROUND + 40);
        ctx.fillStyle = "rgba(255,240,200,0.18)"; ctx.fillRect(-10, GROUND - 20, W + 20, 2);
        ctx.strokeStyle = "rgba(255,255,255,0.16)"; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(52, GROUND + 34); ctx.lineTo(820, GROUND + 34);
        ctx.lineTo(802, H - 12); ctx.lineTo(70, H - 12); ctx.closePath(); ctx.stroke();
        ctx.fillStyle = "rgba(0,0,0,0.10)";
        for (var d = 0; d < 24; d++) {
          ctx.beginPath();
          ctx.ellipse((d * 131) % 860, GROUND + 16 + ((d * 67) % 120), 17, 4, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      function drawGoal(ctx) {
        ctx.save(); ctx.translate(700, GROUND - 6);
        ctx.strokeStyle = "rgba(240,240,235,0.55)"; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(-58, 0); ctx.lineTo(-58, -94); ctx.lineTo(58, -94); ctx.lineTo(58, 0); ctx.stroke();
        ctx.lineWidth = 1.4; ctx.strokeStyle = "rgba(240,240,235,0.30)";
        for (var i = 1; i < 7; i++) {
          ctx.beginPath(); ctx.moveTo(-58 + i * 19, -94); ctx.lineTo(-58 + i * 19, 0); ctx.stroke();
        }
        for (var j = 1; j < 5; j++) {
          ctx.beginPath(); ctx.moveTo(-58, -94 + j * 19); ctx.lineTo(58, -94 + j * 19); ctx.stroke();
        }
        ctx.restore();
      }

      function drawBoy(ctx) {
        var lean = easeOut(boyLean), x = 566, feet = GROUND + 30;
        ctx.save(); ctx.translate(x - lean * 6, feet + Math.sin(t * 2.4) * 1.6);
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        ctx.beginPath(); ctx.ellipse(0, 0, 24, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#2b3f63"; ctx.fillRect(-11, -38, 8, 34); ctx.fillRect(4, -38, 8, 34);
        ctx.fillStyle = "#1b2536"; ctx.fillRect(-15, -7, 12, 7); ctx.fillRect(3, -7, 12, 7);
        ctx.fillStyle = "#8fb3d9"; rrect(ctx, -16, -78, 32, 42, 8); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.fillRect(-3, -76, 5, 24);
        ctx.save(); ctx.translate(-14, -72); ctx.rotate(-0.5 - lean * 0.7);
        ctx.fillStyle = "#e8b98f"; ctx.fillRect(-4, 0, 7, 31); ctx.restore();
        ctx.fillStyle = "#e8b98f"; ctx.fillRect(13, -72, 6, 27);
        ctx.beginPath(); ctx.arc(0, -92, 15, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#2b1c12";
        ctx.beginPath(); ctx.arc(0, -96, 15, Math.PI * 0.98, Math.PI * 2.02); ctx.fill();
        ctx.fillRect(-15, -99, 30, 7);
        ctx.beginPath(); ctx.arc(-5, -90, 1.9, 0, Math.PI * 2); ctx.arc(5, -90, 1.9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#2b1c12"; ctx.lineWidth = 1.7; ctx.beginPath();
        if (lastHit === "perfect" || hits >= 3) ctx.arc(0, -87, 5.5, 0.15 * Math.PI, 0.85 * Math.PI);
        else if (lastHit) { ctx.moveTo(-4.5, -84); ctx.lineTo(4.5, -84); }
        else ctx.arc(0, -87, 4.5, 0.25 * Math.PI, 0.75 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = "#c9b48c"; rrect(ctx, 11, -50, 15, 13, 4); ctx.fill();
        ctx.restore();
        txt(ctx, "Timur", x, feet + 19, "600 10px " + SANS, "rgba(246,239,227,0.55)", "center");
      }

      function drawHero(ctx) {
        var x = 344, feet = GROUND + 42;
        ctx.save(); ctx.translate(x, feet + Math.sin(t * 2.1 + 1) * 1.4);
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath(); ctx.ellipse(0, 0, 24, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#2a2a33"; ctx.fillRect(-12, -44, 9, 40); ctx.fillRect(3, -44, 9, 40);
        ctx.fillStyle = "#15151b"; ctx.fillRect(-17, -7, 13, 7); ctx.fillRect(2, -7, 13, 7);
        ctx.fillStyle = "#4b5563"; rrect(ctx, -18, -88, 36, 46, 9); ctx.fill();
        ctx.fillStyle = "#3a424e"; rrect(ctx, -18, -88, 36, 11, 7); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.fillRect(-3, -84, 7, 26);
        ctx.fillStyle = "#d9a97e"; ctx.fillRect(-24, -82, 6, 35); ctx.fillRect(18, -82, 6, 35);
        ctx.beginPath(); ctx.arc(0, -102, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#20160f";
        ctx.beginPath(); ctx.arc(0, -106, 16, Math.PI * 0.96, Math.PI * 2.04); ctx.fill();
        ctx.beginPath(); ctx.arc(-5, -100, 2, 0, Math.PI * 2); ctx.arc(5, -100, 2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#20160f"; ctx.lineWidth = 1.7;
        ctx.beginPath(); ctx.moveTo(-4, -94); ctx.lineTo(4, -94); ctx.stroke();
        ctx.fillStyle = "#5c4632"; rrect(ctx, -12, -80, 24, 20, 5); ctx.fill();
        ctx.restore();
        txt(ctx, "Siz", x, feet + 19, "600 10px " + SANS, "rgba(246,239,227,0.55)", "center");
      }

      function drawBall(ctx) {
        trail.push({ x: ball.x, y: ball.y, a: 1 });
        if (trail.length > 12) trail.shift();
        for (var i = 0; i < trail.length; i++) {
          var tr = trail[i];
          tr.a *= 0.92;
          ctx.globalAlpha = tr.a * 0.3;
          ctx.fillStyle = "#f4ead6";
          ctx.beginPath(); ctx.arc(tr.x - i * 1.4, tr.y, 4.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.beginPath(); ctx.ellipse(ball.x, GROUND + 24, 13, 4, 0, 0, Math.PI * 2); ctx.fill();
        var g = ctx.createRadialGradient(ball.x - 4, ball.y - 5, 2, ball.x, ball.y, 13);
        g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#cdb894");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(ball.x, ball.y, 13, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(40,32,22,0.35)"; ctx.lineWidth = 1.3; ctx.stroke();
        ctx.save(); ctx.translate(ball.x, ball.y); ctx.rotate(ball.spin);
        ctx.fillStyle = "rgba(40,32,22,0.7)";
        ctx.beginPath(); ctx.arc(0, 0, 3.8, 0, Math.PI * 2); ctx.fill();
        for (var k = 0; k < 4; k++) {
          var a = (k / 4) * Math.PI * 2;
          ctx.beginPath(); ctx.arc(Math.cos(a) * 7.6, Math.sin(a) * 7.6, 2.1, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }

      function drawBar(ctx) {
        ctx.fillStyle = "rgba(20,16,12,0.74)"; rrect(ctx, BAR_X - 22, BAR_Y - 40, BAR_W + 44, 92, 12); ctx.fill();
        ctx.strokeStyle = "rgba(242,196,105,0.20)"; ctx.lineWidth = 1.4; ctx.stroke();
        txt(ctx, "5 urinish · " + hits + " aniq", BAR_X - 10, BAR_Y - 24, "600 11px " + SANS, "rgba(246,239,227,0.64)");
        txt(ctx, "urinish " + Math.min(round + 1, 5) + "/5", BAR_X + BAR_W + 10, BAR_Y - 24, "700 11px " + SANS, GOLD, "right");
        ctx.fillStyle = "rgba(0,0,0,0.5)"; rrect(ctx, BAR_X, BAR_Y, BAR_W, BAR_H, 8); ctx.fill();

        var zx = BAR_X + zoneStart * BAR_W, zw = zoneW * BAR_W;
        var zg = ctx.createLinearGradient(zx, 0, zx + zw, 0);
        zg.addColorStop(0, "rgba(127,214,148,0.35)");
        zg.addColorStop(0.5, "rgba(127,214,148,0.95)");
        zg.addColorStop(1, "rgba(127,214,148,0.35)");
        ctx.fillStyle = zg; rrect(ctx, zx, BAR_Y + 2, zw, BAR_H - 4, 6); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fillRect(zx + zw * 0.36, BAR_Y + 2, 2, BAR_H - 4);
        ctx.fillRect(zx + zw * 0.64, BAR_Y + 2, 2, BAR_H - 4);

        ctx.strokeStyle = "rgba(255,255,255,0.09)"; ctx.lineWidth = 1;
        for (var i = 1; i < 10; i++) {
          ctx.beginPath(); ctx.moveTo(BAR_X + (i / 10) * BAR_W, BAR_Y + 4);
          ctx.lineTo(BAR_X + (i / 10) * BAR_W, BAR_Y + BAR_H - 4); ctx.stroke();
        }
        var mx = BAR_X + marker * BAR_W;
        ctx.save(); ctx.shadowColor = "rgba(242,196,105,0.9)"; ctx.shadowBlur = 12;
        ctx.fillStyle = "#fff6e2"; rrect(ctx, mx - 4, BAR_Y - 7, 8, BAR_H + 14, 4); ctx.fill();
        ctx.restore();

        for (var p = 0; p < 5; p++) {
          var px = BAR_X + p * (BAR_W / 5) + BAR_W / 10, py = BAR_Y + 42, res = results[p];
          ctx.beginPath(); ctx.arc(px, py, 6.5, 0, Math.PI * 2);
          ctx.fillStyle = res ? (res.hit ? (res.perfect ? GOLD : "#7fd694") : "#c4553f") : "rgba(255,255,255,0.13)";
          ctx.fill();
          if (p === round && phase === "live") {
            ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 2; ctx.stroke();
          }
        }
      }

      function drawHint(ctx) {
        var msg = "", col = CREAM;
        if (phase === "live") { msg = "Tayyor tur..."; col = "rgba(246,239,227,0.6)"; }
        else if (phase === "result") {
          if (lastHit === "perfect") { msg = "Aynan! To'p silliq uchdi."; col = GOLD; }
          else if (lastHit === "good") { msg = "Yaxshi tegdi. U kuldi."; col = "#8fe0a4"; }
          else if (lastHit === "near") { msg = "Biroz oldin — to'p chetga ketdi."; col = "#ffcf7a"; }
          else { msg = "O'tib ketdi. To'p yerga tushdi."; col = "#ff8f7a"; }
        } else { msg = "To'p havoda. Marker yashil zonaga kelganda SPACE bos."; col = "rgba(246,239,227,0.85)"; }

        ctx.font = "600 14px " + SANS;
        var lines = wrap(ctx, msg, 600);
        for (var i = 0; i < lines.length; i++) txt(ctx, lines[i], W / 2, 446 + i * 19, "600 14px " + SANS, col, "center");

        if (phase === "result" && resultT > 0.55) {
          var a = (0.4 + 0.3 * Math.sin(t * 4.4)).toFixed(2);
          txt(ctx, round >= 5 ? "ENTER — yakun" : "ENTER — keyingi urinish", W / 2, 474,
            "600 11px " + SANS, "rgba(242,196,105," + a + ")", "center");
        }
      }

      function drawChrome(ctx) {
        txt(ctx, "HISOB", 848, 30, "700 10px " + SANS, "rgba(246,239,227,0.45)", "right");
        txt(ctx, hits + " / 5", 848, 56, "700 21px " + SANS, hits >= 3 ? "#8fe0a4" : GOLD, "right");
        txt(ctx, hits >= 3 ? "chegara o'tildi" : "g'alaba uchun 3 ta", 848, 74,
          "500 10px " + SANS, "rgba(246,239,227,0.45)", "right");
        txt(ctx, football ? "futbolni bilasiz — marker sekinroq" : "uni o'yinda ko'ring", 12, 30,
          "600 11px " + SANS, football ? "rgba(143,224,164,0.9)" : "rgba(246,239,227,0.45)");

        if (t < 4) {
          ctx.globalAlpha = t < 3 ? 0.92 : Math.max(0, 0.92 * (1 - (t - 3)));
          txt(ctx, "SPACE — to'pga tegish · sichqoncha ham ishlaydi · 3 ta aniq tegish — g'alaba", 12, 468,
            "500 12px " + SANS, "rgba(246,239,227,0.9)");
          ctx.globalAlpha = 1;
        }
        if (flash > 0) {
          ctx.fillStyle = "rgba(255,240,200," + (flash * 0.16).toFixed(3) + ")";
          ctx.fillRect(-10, -30, W + 20, H + 60);
        }
        if (fade > 0) {
          ctx.fillStyle = "rgba(8,10,12," + fade.toFixed(3) + ")";
          ctx.fillRect(-10, -30, W + 20, H + 60);
        }
      }

      return {
        update: function (dt) {
          var s = Math.min(dt || 0, 0.05);
          t += s; fade = Math.max(0, fade - s * 2.2); flash = Math.max(0, flash - s * 2.4);
          boyLean = Math.max(0, boyLean - s * 1.6);
          if (phase === "live") {
            marker += dir * speed * s;
            if (marker >= 1) { marker = 1; dir = -1; }
            if (marker <= 0) { marker = 0; dir = 1; }
          } else if (phase === "result") resultT += s;
          else if (phase === "ready") {
            resultT += s;
            if (resultT > 0.55) { resultT = 0; newRound(); }
          }
          ball.vy += 820 * s;
          ball.x += ball.vx * s; ball.y += ball.vy * s;
          ball.spin += ball.vx * 0.0016;
          if (ball.y > GROUND - 13) {
            ball.y = GROUND - 13;
            if (ball.vy > 60) ball.vy *= -0.42;
            else { ball.vy = 0; ball.vx *= 0.86; }
          }
          if (ball.x > 660) { ball.x = 660; ball.vx *= -0.5; }
          if (ball.x < 170) { ball.x = 170; ball.vx *= -0.5; }
        },
        draw: function (ctx) {
          drawYard(ctx); drawGoal(ctx); drawHero(ctx); drawBoy(ctx);
          drawBall(ctx); drawBar(ctx); drawHint(ctx); drawChrome(ctx);
        },
        onKey: function (key) {
          if (!key || done) return;
          var k = String(key).toLowerCase();
          if (phase === "live" && (k === "space" || k === "enter")) strike();
          else if (phase === "result" && (k === "enter" || k === "space")) advance();
          else if (phase === "ready" && (k === "space" || k === "enter")) resultT = 0.6;
        },
        onPointer: function (x, y, type) {
          if (type !== "down" || done) return;
          if (phase === "live") strike();
          else if (phase === "result") advance();
        }
      };
    }
  });
})();
