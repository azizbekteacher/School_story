/* gift.js — "Sardor akaning do'koni" (giftShop). Pick one present for Timur.
   What counts as a win depends on api.state.intel: the ball only lands with
   intel_football, the notebook only with intel_quiet, the boots always break the
   mother's "don't spend money" rule, and the empty box + ribbon wins strongest
   because it costs nothing and turns thoughtfulness into a personal moment.
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

  var CREAM = "#f6efe3", GOLD = "#f2c469", MUTED = "rgba(246,239,227,0.62)";
  var SANS = "system-ui, sans-serif";

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
  function ease(x) { var t = Math.max(0, Math.min(1, x)); return 1 - Math.pow(1 - t, 3); }

  var ITEMS = [
    { id: "GIFT_boots", title: "Futbol butsasi", price: "480 000 so'm", tag: "juda qimmat",
      accent: "#9ecbff", art: "boots",
      desc: "Chin teri, 42-o'lcham. Hatto eng zo'r o'yinchi uchun ham ortiqcha.",
      mutter: "«Bu — olti oylik maoshim turadi. O'ylab ko'ring, o'qituvchi.»" },
    { id: "GIFT_ball", title: "Koptok", price: "45 000 so'm", tag: "arzon",
      accent: "#8fe08f", art: "ball",
      desc: "Yumshoq, arzon koptok. Har kuni hovlida o'ynasa bo'ladi — yorilsa, yana olasiz.",
      mutter: "«Koptokmi? Har kuni ikkitasini sotaman. Biri hovlida qoladi.»" },
    { id: "GIFT_notebook", title: "Daftar", price: "18 000 so'm", tag: "oddiy",
      accent: "#f2c469", art: "notebook",
      desc: "48 varaqli daftar. Ichida hech narsa yo'q — hozircha. Chetlariga yozsa bo'ladi.",
      mutter: "«Daftar sovg'a emas, ehtiyoj. Lekin ba'zan ehtiyoj sovg'a bo'ladi.»" },
    { id: "GIFT_box", title: "Bo'sh quti", price: "0 so'm", tag: "bepul",
      accent: "#ffb3d0", art: "box",
      desc: "Karton quti, ichi bo'sh, ustida qizil lenta. Narxi nol. Ichini siz to'ldirasiz.",
      mutter: "«Bo'sh quti? Siz hazillashyapsizmi, o'qituvchi?»" }
  ];

  function drawArt(ctx, kind, cx, cy, accent) {
    if (kind === "boots") {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.12);
      for (var i = 0; i < 2; i++) {
        ctx.save(); ctx.translate(i * 13 - 15, i * -6); ctx.globalAlpha = i ? 0.62 : 1;
        ctx.fillStyle = accent; ctx.beginPath();
        ctx.moveTo(-15, -26); ctx.lineTo(2, -26); ctx.lineTo(2, 6); ctx.lineTo(22, 9);
        ctx.quadraticCurveTo(28, 21, 18, 23); ctx.lineTo(-15, 23); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "rgba(20,16,12,0.55)"; ctx.fillRect(-15, 19, 37, 5);
        ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.fillRect(-11, -21, 3, 16);
        ctx.restore();
      }
      ctx.restore();
    } else if (kind === "ball") {
      var g = ctx.createRadialGradient(cx - 8, cy - 10, 3, cx, cy, 26);
      g.addColorStop(0, "#ffffff"); g.addColorStop(1, accent);
      ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = "rgba(30,40,30,0.35)"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "rgba(30,40,30,0.72)";
      ctx.beginPath(); ctx.arc(cx, cy - 2, 6.5, 0, Math.PI * 2); ctx.fill();
      for (var k = 0; k < 5; k++) {
        var a = (k / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16, 3.6, 0, Math.PI * 2); ctx.fill();
      }
    } else if (kind === "notebook") {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(0.16);
      ctx.fillStyle = "rgba(0,0,0,0.3)"; rrect(ctx, -20, -27, 42, 57, 5); ctx.fill();
      ctx.fillStyle = accent; rrect(ctx, -25, -32, 45, 61, 5); ctx.fill();
      ctx.fillStyle = "rgba(40,28,12,0.45)"; ctx.fillRect(-25, -32, 9, 61);
      ctx.strokeStyle = "rgba(60,42,20,0.55)"; ctx.lineWidth = 2;
      for (var j = 0; j < 4; j++) {
        ctx.beginPath(); ctx.moveTo(-10, -18 + j * 10); ctx.lineTo(13, -18 + j * 10); ctx.stroke();
      }
      ctx.fillStyle = "#e05a5a"; ctx.fillRect(12, -32, 5, 26);
      ctx.restore();
    } else {
      ctx.fillStyle = "#d8b48a"; rrect(ctx, cx - 32, cy - 12, 64, 39, 4); ctx.fill();
      ctx.fillStyle = "#c49a6c"; ctx.fillRect(cx - 32, cy + 3, 64, 5);
      ctx.fillStyle = "#e6c8a2"; rrect(ctx, cx - 37, cy - 26, 74, 15, 3); ctx.fill();
      ctx.fillStyle = accent;
      ctx.fillRect(cx - 6, cy - 26, 12, 53); ctx.fillRect(cx - 35, cy - 12, 70, 6);
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy - 26); ctx.quadraticCurveTo(cx - 25, cy - 48, cx - 7, cy - 50);
      ctx.quadraticCurveTo(cx + 3, cy - 45, cx - 2, cy - 26);
      ctx.moveTo(cx + 2, cy - 26); ctx.quadraticCurveTo(cx + 25, cy - 48, cx + 7, cy - 50);
      ctx.quadraticCurveTo(cx - 3, cy - 45, cx + 2, cy - 26); ctx.fill();
    }
  }

  G.minigames.register("giftShop", {
    title: "Sardor akaning do'koni",
    subtitle: "Timur uchun kichik bir narsa tanlang",
    controls: "1-4 yoki sichqoncha — tanlash · ENTER — tasdiqlash",
    principleIds: ["I-043", "I-001"],

    create: function (api) {
      var sel = 0, t = 0, phase = "browse", reactT = 0, done = false, fade = 1;
      var pending = null, react = null, focus = [0, 0, 0, 0];
      var CARD_Y = 30, CARD_W = 158, CARD_H = 190;
      var SHELF_X = 14, SHELF_W = 688;
      function cardX(i) { return SHELF_X + 8 + i * 172; }
      var intelList = (api.state && api.state.intel) || [];
      var flagMap = (api.state && api.state.flags) || {};
      function has(id) { return intelList.indexOf(id) >= 0 || intelList[id] === true; }
      function flag(n) { return flagMap[n] === true; }
      function sfx(n, a) {
        try { if (api.sound && typeof api.sound[n] === "function") api.sound[n](a); } catch (e) { /* optional */ }
      }
      function finishOnce(r) { if (done) return; done = true; api.finish(r); }

      /* One branch per item. Every branch reads intel, so the same click wins or
         fails depending on what the player actually learned at the gate.
         cfg.budget is the cash in the hero's pocket; the boots exceed it. */
      function resolve(item) {
        var ballIntel = has("intel_football"), quietIntel = has("intel_quiet"), budget = has("intel_budget");
        var cash = typeof (api && api.cfg && api.cfg.budget) === "number" ? api.cfg.budget : null;
        if (item.id === "GIFT_boots") return {
          win: false, tone: "bad", verdict: "Juda qimmat", choiceId: "GIFT_boots",
          detail: "480 000 so'mlik butsa. Nodira opa «pul sarflamang» degan edi — bu sovg'a o'sha gapni eshitmagan.",
          notes: [
            { principle: "I-043", text: "Qimmat sovg'a g'amxo'rlikni isbotlamaydi: narx e'tiborni o'ziga tortadi, bolani ko'rinmas qiladi." },
            { principle: "I-001", text: "Bu xizmat, mehmondo'stlik emas: pul bilan masofani yopishga urinish." }],
          effects: [{ trust: -1 }],
          lines: [cash !== null
              ? "Sardor aka: «Cho'ntagingizda " + Math.round(cash / 1000) + " ming bor. Bu " + Math.round(480000 / cash) + " barobar qimmat.»"
              : "Sardor aka: «Bu butsani olsangiz, oyning oxirigacha non yeb yurasiz.»",
            budget ? "Nodira opaning «pul sarflamang» degan gapi hali ham qulog'ingizda." : "480 000 so'm — bir oylik maosh. Nega aynan shu?",
            "Timur butsani kiyib ko'rsa ham, siz u haqda hech narsa bilmaysiz."] };
        if (item.id === "GIFT_ball") return ballIntel ? {
          win: true, tone: "good", verdict: "Aniq tanlov", choiceId: "GIFT_ball",
          detail: "Arzon koptok — onasi pul sarflashni xohlamaydi, lekin bu uning dunyosiga tegadi.",
          notes: [
            { principle: "I-043", text: "Sovg'aning kuchi narxda emas, aniqlikda: koptok uning o'z olamidan olingan." },
            { principle: "I-001", text: "Xizmat — koptok sotib olish. Mehmondo'stlik — u bilan birga o'ynash." }],
          effects: [{ intel: "intel_ball_given" }, { trust: 2 }],
          lines: ["Sardor aka kulimsirab: «Buni bir oyda yeb qo'yadi, bilasizmi?»",
            "Siz bilasiz: Timur futbolni yaxshi ko'radi. Bu taxmin emas — onasi aytib bergan.",
            "45 000 so'm. Qolgan pul cho'ntagingizda qoladi."] } : {
          win: false, tone: "warn", verdict: "Tasodifiy", choiceId: "GIFT_ball",
          detail: "Koptok arzon va zarar qilmaydi, lekin nega koptok? Buni asoslay olmadingiz — bu tanlov emas, taxmin.",
          notes: [{ principle: "I-043", text: "Arzon sovg'a ham o'ylamasdan olinsa, shunchaki arzon narsa bo'lib qoladi." }],
          effects: [],
          lines: ["Sardor aka: «Nega koptok?» — deb so'radi. Sizda aniq javob yo'q.",
            "U yelka qisdi: «Baribir sovg'a. Lekin bolalar buni sezadi.»",
            "Koptok uning qo'lida qoladi. Suhbat esa sizda qolmadi."] };
        if (item.id === "GIFT_notebook") return quietIntel ? {
          win: true, tone: "good", verdict: "Mos tanlov", choiceId: "GIFT_notebook",
          detail: "Daftar — chetiga yozadigan bolaga mos. 18 000 so'm, lekin aniq o'ylangan sovg'a.",
          notes: [
            { principle: "I-043", text: "Kichik sovg'a ham katta bo'ladi, agar u bolaning o'z odatiga tegib tursa." },
            { principle: "I-028", text: "Siz uning jimligini ko'rgan edingiz — daftar o'sha kuzatuvning davomi." }],
          effects: [{ intel: "intel_notebook_given" }, { trust: 2 }],
          lines: ["Sardor aka: «Daftarmi?» — hayron bo'ldi.",
            "Siz: «U chetiga yozadi. O'chirmaydi.»",
            "«Unday bo'lsa, qalam ham qo'shib beraman», — dedi aka va qo'shib qo'ydi."] } : {
          win: true, tone: "ok", verdict: "Xavfsiz", choiceId: "GIFT_notebook",
          detail: "Daftar — foydali, xavfsiz tanlov. Lekin nega aynan daftar? Buni hali asoslay olmadingiz.",
          notes: [{ principle: "I-043", text: "Foydali sovg'a yaxshi, lekin o'ylangan sovg'a boshqacha: u bolani taniganini ko'rsatadi." }],
          effects: [{ trust: 1 }],
          lines: ["Sardor aka: «Daftar yaxshi. Hech bo'lmasa yirtilmaydi.»",
            "To'g'ri. Lekin bu daftarni nega aynan Timurga olayotganingizni o'zingiz ham bilmaysiz.",
            "Sovg'a qo'lingizda. Hikoya esa hali yo'q."] };
        var boxNote = "Ichiga solasiz: uning kechagi o'yini, uning jimligi, bugungi yo'l.";
        if (typeof (api.state && api.state.trust) === "number" && api.state.trust >= 6) {
          boxNote = "Ichiga solasiz: bugun yo'lda aytilgan gaplaringizni. Sizda allaqachon bir kunlik tarix bor.";
        }
        return {
          win: true, tone: "great", verdict: "Eng kuchli", choiceId: "GIFT_box",
          detail: "Bo'sh quti va lenta — 0 so'm. Ichiga solgan narsangiz muhim: uning o'yini, uning jimligi, birga bosgan yo'l.",
          notes: [
            { principle: "I-043", text: "Eng kuchli sovg'a qimmat emas: u vaqt, e'tibor va tasavvurni talab qiladi." },
            { principle: "I-001", text: "Mehmondo'stlik — qutini ochganda ichidan hikoya chiqishi. Xizmat — faqat qutini berish." },
            { principle: "F-013", text: "Tingla → bittasini tanla → bajar → hikoyani saqla: quti shu zanjirning oxiri." }],
          effects: [{ intel: "intel_box_given" }, { trust: 3 }],
          lines: ["Sardor aka qutini qo'liga oldi: «Bo'sh-ku?» — «Ha. Ichini biz to'ldiramiz.»",
            "U jim qoldi, keyin lentani mahkam bog'ladi: «Bunday sovg'ani birinchi marta ko'ryapman.»",
            budget ? "Nodira opa pul sarflamaslikni so'ragan edi. Siz bir so'm ham sarflamadingiz." : "Bir so'm ham sarflamadingiz. Sarflagan narsangiz — vaqt.",
            boxNote] };
      }
      function select(i) {
        if (phase !== "browse") return;
        var n = ITEMS.length, next = ((i % n) + n) % n;
        if (next === sel) return;
        sel = next; sfx("blip", 480 + sel * 60);
      }
      function confirmSelection() {
        if (phase !== "browse" || done) return;
        var r = resolve(ITEMS[sel]);
        pending = { win: r.win, choiceId: r.choiceId, detail: r.detail, notes: r.notes.slice(), effects: r.effects.slice() };
        react = r;
        phase = "react"; reactT = 0;
        if (r.win) sfx("good"); else sfx("bad");
      }
      function commitFinish() {
        if (phase !== "react" || done) return;
        if (pending.win) sfx("win");
        finishOnce(pending);
      }

      function drawRoom(ctx) {
        var g = ctx.createLinearGradient(0, 0, 0, 478);
        g.addColorStop(0, "#4a382a"); g.addColorStop(0.55, "#6b5138"); g.addColorStop(1, "#553f2c");
        ctx.fillStyle = g; ctx.fillRect(-14, -30, 900, 520);
        var lamp = ctx.createRadialGradient(130, 0, 20, 130, 0, 480);
        lamp.addColorStop(0, "rgba(255,206,140,0.24)"); lamp.addColorStop(1, "rgba(255,206,140,0)");
        ctx.fillStyle = lamp; ctx.fillRect(-14, -30, 900, 420);
        var glow = ctx.createLinearGradient(0, 18, 0, 244);
        glow.addColorStop(0, "rgba(255,214,150,0.13)"); glow.addColorStop(1, "rgba(255,214,150,0)");
        rrect(ctx, SHELF_X, 18, SHELF_W, 226, 10);
        ctx.fillStyle = "rgba(0,0,0,0.30)"; ctx.fill();
        ctx.fillStyle = glow; ctx.fill();
        ctx.strokeStyle = "rgba(242,196,105,0.18)"; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = "#4a3120"; ctx.fillRect(SHELF_X + 6, CARD_Y + CARD_H + 4, SHELF_W - 12, 9);
        ctx.fillStyle = "rgba(255,255,255,0.10)"; ctx.fillRect(SHELF_X + 6, CARD_Y + CARD_H + 4, SHELF_W - 12, 2);
        var fl = ctx.createLinearGradient(0, 400, 0, 478);
        fl.addColorStop(0, "#3a2718"); fl.addColorStop(1, "#1a110b");
        ctx.fillStyle = fl; ctx.fillRect(-14, 400, 900, 120);
      }

      function drawCard(ctx, i) {
        var item = ITEMS[i], x = cardX(i), f = focus[i];
        var matched = (item.id === "GIFT_ball" && has("intel_football")) ||
          (item.id === "GIFT_notebook" && has("intel_quiet"));
        var unsure = item.id === "GIFT_ball" && !has("intel_football");

        ctx.save();
        ctx.translate(x + CARD_W / 2, CARD_Y + CARD_H / 2 - 6 * f);
        var sc = 1 + 0.035 * f; ctx.scale(sc, sc);
        ctx.translate(-(x + CARD_W / 2), -(CARD_Y + CARD_H / 2));

        ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 7;
        ctx.fillStyle = i === sel ? "rgba(72,52,33,0.97)" : "rgba(58,41,28,0.94)";
        rrect(ctx, x, CARD_Y, CARD_W, CARD_H, 10); ctx.fill();
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        var sheen = ctx.createLinearGradient(0, CARD_Y, 0, CARD_Y + CARD_H);
        sheen.addColorStop(0, "rgba(255,255,255,0.08)");
        sheen.addColorStop(0.5, "rgba(255,255,255,0.01)");
        sheen.addColorStop(1, "rgba(0,0,0,0.18)");
        ctx.fillStyle = sheen; ctx.fill();
        ctx.strokeStyle = i === sel ? GOLD : "rgba(242,196,105,0.22)";
        ctx.lineWidth = i === sel ? 2.5 : 1.5; ctx.stroke();
        drawArt(ctx, item.art, x + CARD_W / 2, CARD_Y + 58, item.accent);
        txt(ctx, item.title, x + CARD_W / 2, CARD_Y + 112, "600 15px " + SANS, CREAM, "center");
        txt(ctx, item.price, x + CARD_W / 2, CARD_Y + 134, "700 14px " + SANS, GOLD, "center");
        ctx.strokeStyle = "rgba(255,255,255,0.09)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x + 20, CARD_Y + 150); ctx.lineTo(x + CARD_W - 20, CARD_Y + 150); ctx.stroke();
        txt(ctx, item.tag, x + CARD_W / 2, CARD_Y + 168, "500 12px " + SANS, MUTED, "center");

        ctx.beginPath(); ctx.arc(x + 15, CARD_Y + 15, 10, 0, Math.PI * 2);
        ctx.fillStyle = i === sel ? GOLD : "rgba(0,0,0,0.45)"; ctx.fill();
        txt(ctx, String(i + 1), x + 15, CARD_Y + 16, "700 11px " + SANS, i === sel ? "#241a10" : MUTED, "center");
        if (matched) txt(ctx, "★", x + CARD_W - 17, CARD_Y + 17, "700 17px " + SANS, GOLD, "center");
        else if (unsure) txt(ctx, "?", x + CARD_W - 17, CARD_Y + 17, "700 15px " + SANS, "rgba(246,239,227,0.3)", "center");
        if (item.id === "GIFT_boots") txt(ctx, "!", x + CARD_W - 17, CARD_Y + 17, "700 15px " + SANS, "#ff9a76", "center");
        ctx.restore();
      }

      function drawPanel(ctx) {
        var item = ITEMS[sel];
        ctx.fillStyle = "rgba(20,14,10,0.66)"; rrect(ctx, 14, 262, 688, 92, 8); ctx.fill();
        ctx.strokeStyle = "rgba(242,196,105,0.18)"; ctx.lineWidth = 1.5; ctx.stroke();
        if (phase === "browse") {
          txt(ctx, item.title + " — " + item.price, 32, 284, "700 16px " + SANS, CREAM);
          var lines = wrap(ctx, item.desc, 626);
          for (var i = 0; i < lines.length && i < 2; i++) txt(ctx, lines[i], 32, 310 + i * 20, "400 14px " + SANS, "rgba(246,239,227,0.8)");
          if (has("intel_budget")) txt(ctx, "onasi: pul sarflamang", 684, 284, "600 12px " + SANS, "rgba(242,196,105,0.85)", "right");
        } else if (react) {
          var col = react.tone === "bad" ? "#ff8f7a" : react.tone === "warn" ? "#ffcf7a" : "#8fe0a4";
          txt(ctx, react.verdict, 32, 284, "700 16px " + SANS, col);
          txt(ctx, item.title, 684, 284, "600 13px " + SANS, MUTED, "right");
          var dl = wrap(ctx, react.detail, 626);
          for (var j = 0; j < dl.length && j < 2; j++) txt(ctx, dl[j], 32, 310 + j * 19, "400 13px " + SANS, "rgba(246,239,227,0.82)");
          if (reactT > 0.8) {
            var p = (0.5 + 0.5 * Math.sin(t * 5)).toFixed(2);
            txt(ctx, "ENTER — do'kondan chiqish", 684, 340, "600 12px " + SANS, "rgba(242,196,105," + p + ")", "right");
          }
        }
      }

      function drawKeeper(ctx) {
        var cx = 776, bob = Math.sin(t * 2.1) * 2;
        var mood = react ? (react.win ? 1 : 2) : 0;
        var counter = ctx.createLinearGradient(0, 300, 0, 478);
        counter.addColorStop(0, "#8a5c31"); counter.addColorStop(1, "#33200f");
        ctx.fillStyle = counter; ctx.fillRect(710, 300, 200, 178);
        ctx.fillStyle = "#a06b3a"; rrect(ctx, 702, 286, 208, 22, 8); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.fillRect(702, 286, 208, 3);
        ctx.fillStyle = "#2f6f6a"; rrect(ctx, cx - 54, 74 + bob, 108, 118, 16); ctx.fill();
        ctx.fillStyle = "#3d8a83"; rrect(ctx, cx - 54, 74 + bob, 108, 36, 14); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.78)"; rrect(ctx, cx - 17, 78 + bob, 34, 54, 6); ctx.fill();
        ctx.fillStyle = "#e8b98f"; ctx.beginPath(); ctx.arc(cx, 44 + bob, 31, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#3b2617";
        ctx.beginPath(); ctx.arc(cx, 29 + bob, 31, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
        ctx.fillStyle = "#4a3120"; rrect(ctx, cx - 37, 20 + bob, 74, 11, 6); ctx.fill();
        ctx.fillStyle = "#2b1c12"; ctx.beginPath();
        ctx.arc(cx - 10, 40 + bob, 3.2, 0, Math.PI * 2);
        ctx.arc(cx + 10, 40 + bob, 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#2b1c12"; ctx.lineWidth = 3.6; ctx.beginPath();
        if (mood === 1) ctx.arc(cx, 46 + bob, 13, 0.25 * Math.PI, 0.75 * Math.PI);
        else if (mood === 2) ctx.arc(cx, 66 + bob, 13, 1.2 * Math.PI, 1.8 * Math.PI);
        else { ctx.moveTo(cx - 8, 57 + bob); ctx.lineTo(cx + 8, 57 + bob); }
        ctx.stroke();
        ctx.fillStyle = "#2b1c12"; rrect(ctx, cx - 14, 51 + bob, 28, 5, 2.5); ctx.fill();
        ctx.fillStyle = "#e8b98f";
        rrect(ctx, cx - 58, 190 + bob, 28, 24, 10); ctx.fill();
        rrect(ctx, cx + 30, 190 + bob, 28, 24, 10); ctx.fill();
      }

      function drawSpeech(ctx) {
        var lines = phase === "browse" ? [ITEMS[sel].mutter] : (react ? react.lines : []);
        var who = phase === "browse" ? "Sardor aka · do'kon egasi"
          : (react && react.win ? "Sardor aka · mamnun" : "Sardor aka · xavotirda");
        ctx.fillStyle = "rgba(246,239,227,0.95)"; rrect(ctx, 14, 360, 688, 104, 10); ctx.fill();
        ctx.beginPath(); ctx.moveTo(702, 400); ctx.lineTo(724, 412); ctx.lineTo(702, 424); ctx.closePath(); ctx.fill();
        txt(ctx, who.toUpperCase(), 32, 380, "700 10px " + SANS, "rgba(60,40,24,0.55)");
        var y = 402;
        var color = phase === "browse" ? "#3a2a1c" : (react && react.tone === "bad" ? "#8c3b2a" : "#2f4034");
        for (var i = 0; i < lines.length && y < 456; i++) {
          ctx.font = "500 13px " + SANS;
          var w = wrap(ctx, lines[i], 650);
          for (var k = 0; k < w.length && y < 456; k++) { txt(ctx, w[k], 32, y, "500 13px " + SANS, color); y += 18; }
        }
      }

      function drawNotes(ctx) {
        var chips = [];
        if (has("intel_football")) chips.push("Futbolni yaxshi ko'radi");
        if (has("intel_quiet")) chips.push("Daftar chetiga yozadi");
        if (has("intel_sick")) chips.push("Kasal bo'lib qolgan");
        if (has("intel_home")) chips.push("Uyda o'zgarish bor");
        if (has("intel_budget")) chips.push("Onasi: pul sarflamang");
        if (flag("met_oqil")) chips.push("Oqil: u umidsiz");
        if (!chips.length) chips.push("Hali hech narsa bilmaysiz");
        txt(ctx, "DAFTARINGIZDAN", 714, 40, "700 10px " + SANS, "rgba(246,239,227,0.42)");
        for (var i = 0; i < chips.length && i < 4; i++) {
          var y = 56 + i * 27;
          ctx.fillStyle = "rgba(20,14,10,0.6)"; rrect(ctx, 714, y, 158, 22, 6); ctx.fill();
          ctx.strokeStyle = "rgba(242,196,105,0.18)"; ctx.lineWidth = 1; ctx.stroke();
          txt(ctx, "•", 722, y + 11, "700 11px " + SANS, GOLD);
          txt(ctx, chips[i], 733, y + 11.5, "500 10px " + SANS, "rgba(246,239,227,0.8)");
        }
      }

      function drawChrome(ctx) {
        if (t < 4 && phase === "browse") {
          ctx.globalAlpha = t < 3 ? 0.9 : Math.max(0, 0.9 * (1 - (t - 3)));
          txt(ctx, "1-4 — tanlash · ENTER — tasdiqlash · sichqoncha ham ishlaydi", 14, 468, "500 12px " + SANS, "rgba(246,239,227,0.88)");
          ctx.globalAlpha = 1;
        } else if (phase === "browse") {
          var p = (0.45 + 0.25 * Math.sin(t * 2.6)).toFixed(2);
          txt(ctx, "ENTER — tasdiqlash", 702, 468, "600 12px " + SANS, "rgba(242,196,105," + p + ")", "right");
        }
        if (phase === "react" && reactT > 0.15) {
          ctx.globalAlpha = ease(reactT / 0.5);
          var bad = !react.win;
          var label = bad ? "Yo'q" : (react.tone === "great" ? "Zo'r" : "Yaxshi");
          var col = bad ? "#ff8f7a" : (react.tone === "great" ? GOLD : "#8fe0a4");
          ctx.fillStyle = "rgba(0,0,0,0.45)"; rrect(ctx, 566, 252, 136, 24, 12); ctx.fill();
          txt(ctx, label, 634, 265, "700 12px " + SANS, col, "center");
          ctx.globalAlpha = 1;
        }
        if (fade > 0) {
          ctx.fillStyle = "rgba(10,7,5," + fade.toFixed(3) + ")";
          ctx.fillRect(-14, -30, 900, 520);
        }
      }

      return {
        update: function (dt) {
          var s = Math.min(dt || 0, 0.05);
          t += s; fade = Math.max(0, fade - s * 2.2);
          for (var i = 0; i < ITEMS.length; i++) {
            focus[i] += ((i === sel ? 1 : 0) - focus[i]) * Math.min(1, s * 12);
          }
          if (phase === "browse") {
            var m = api.mouse || { x: -1, y: -1 };
            for (var j = 0; j < ITEMS.length; j++) {
              var x = cardX(j);
              if (m.x >= x && m.x <= x + CARD_W && m.y >= CARD_Y && m.y <= CARD_Y + CARD_H && j !== sel) {
                sel = j; sfx("blip", 480 + j * 60);
              }
            }
          } else if (phase === "react") { reactT += s; if (reactT > 6.5) commitFinish(); }
        },

        draw: function (ctx) {
          drawRoom(ctx);
          for (var i = 0; i < ITEMS.length; i++) drawCard(ctx, i);
          drawPanel(ctx); drawNotes(ctx); drawKeeper(ctx); drawSpeech(ctx); drawChrome(ctx);
        },

        onKey: function (key) {
          if (!key || done) return;
          var k = String(key).toLowerCase();
          if (phase === "react") {
            if ((k === "enter" || k === "space") && reactT > 0.8) commitFinish();
            return;
          }
          if (k >= "1" && k <= "4") select(parseInt(k, 10) - 1);
          else if (k === "arrowleft" || k === "a") select(sel - 1);
          else if (k === "arrowright" || k === "d") select(sel + 1);
          else if (k === "enter" || k === "space") confirmSelection();
        },

        onPointer: function (x, y, type) {
          if (type !== "down" || done || phase !== "browse") return;
          for (var i = 0; i < ITEMS.length; i++) {
            var cx = cardX(i);
            if (x >= cx && x <= cx + CARD_W && y >= CARD_Y && y <= CARD_Y + CARD_H) {
              if (i === sel) confirmSelection();
              else { sel = i; sfx("blip", 480 + i * 60); }
              return;
            }
          }
        }
      };
    }
  });
})();
