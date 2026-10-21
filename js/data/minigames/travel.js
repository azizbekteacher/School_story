/* travel.js — "Timurni uyiga kuzatib borish" (travelTalk).
   Five conversational moments, three topics each. A live trust meter starts at 3,
   stays in 0..10 and wins at >= 7. All five moments carry a "teacher / grade"
   trap and a follow-the-boy's-lead reward; two topics are unlocked by
   api.state.intel and fall back to normal topics when it is missing.

   choiceId: the defining choice of the run, in the documented scheme
   TRAVEL_<moment 1..5>_<a|b|c> — the last trap when you lose, the last lead when
   you win. The full trajectory is returned in result.summary.

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

  var W = 872, H = 478, ROAD = 160;
  var CREAM = "#f6efe3", GOLD = "#f2c469", SANS = "system-ui, sans-serif";
  var MUTED = "rgba(246,239,227,0.62)";

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
  function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  var MOMENTS = [
    { place: "Maktab darvozasi",
      lead: "Timur ryukzakini yelkasiga tashladi. «Siz ham shu yoqqa ketasizmi?» — deb so'radi, ovozini past qilib.",
      opts: [
        { k: "a", text: "«Avval bugungi darsni takrorlaymizmi?»", d: -2, kind: "trap",
          r: "Timur qadamini sekinlatdi: «Yana darsmi...» — U jim qoldi. Jimlik uzoq davom etdi." },
        { k: "b", text: "«Qaysi yo'l qulay? Men bu ko'chani bilmayman.»", d: 2, kind: "lead",
          r: "«Ana u yerda, soyada», — dedi u va yurishni tezlashtirdi. Siz uning ketidan yurdiz — birinchi marta." },
        { k: "c", text: "«Hovlida kim bilan o'ynaysan?»", d: 1, kind: "soft",
          r: "U yelka qisdi: «Hech kim. Ba'zida o'zim.» — Keyin jimgina qo'shildi: «Koptok bor.»" }] },
    { place: "Ko'cha burilishi",
      lead: "Dudlangan non hidi keldi. Timur peshtaxta yonida bir zum to'xtadi-yu, yana yurdi.",
      opts: [
        { k: "a", text: "«Nega o'sha do'konga qarading?»", d: 2, kind: "lead",
          r: "U kuldi: «Buvim shu yerda non olardi. Endi har kuni o'zim ham shu yerdan olaman.» — Birinchi marta u gap boshladi." },
        { k: "b", text: "«Partadagi baholaring pastroq. Nega?»", d: -2, kind: "trap",
          r: "Timur yuzini boshqa tomonga o'girdi: «Bilmadim.» — Bu «bilmadim» hamma narsani aytib qo'ydi." },
        { k: "c", text: "Daftardan: «Kasal bo'lgan kunlaring qiyin bo'ldimi?»", d: 1, kind: "intel", intel: "intel_sick",
          r: "U yelka qisdi: «Yarim sinf oldinga ketdi. Men quvib yetolmadim.» — Birinchi marta o'zi shikoyat qildi." }] },
    { place: "Piramidalar ko'chasi",
      lead: "Yon tomonda bolalar to'p o'ynayapti. Timur to'pni ko'z bilan kuzatib qo'ydi — keyin sizga qaradi.",
      opts: [
        { k: "a", text: "«Sen u yerda o'ynaydiganlarga qarab turding...»", d: 2, kind: "lead",
          r: "«Ular har kun. Men ham o'ynaganman», — dedi u, ovozi biroz balandroq. «Hozir ozgina jarohatim bor.»" },
        { k: "b", text: "«Mohirlik sinoviga tayyormisan? Keyingi hafta.»", d: -2, kind: "trap",
          r: "Timur yelkasini qisdi: «Yana sinov.» — To'p unga endi qiziq bo'lmay qoldi. U yo'lga qaradi." },
        { k: "c", text: "Daftardan: «O'yindan keyin nima qilasan?»", d: 1, kind: "intel", intel: "intel_football",
          r: "«Zalga boraman. To'pni devorga tepaman, o'zim tutaman», — dedi u. «Hech kim menga dars bermaydi.»" }] },
    { place: "Katta ko'cha, avtobus bekati",
      lead: "Avtobus to'xtadi-yu, yo'lga chiqmadi. Ichida odamlar. Timur bekatingizga qarab dedi: «Yana o'sha savollar bormi?»",
      opts: [
        { k: "a", text: "«Yo'q. Bugun faqat ketyapmiz.»", d: 2, kind: "lead",
          r: "U avtobus oynasiga qaradi: «Birinchi kuni hamma sizni g'alati deb o'yladi. Men esa yoqmadi deb o'yladim.» — Keyin: «Hozir yoqyapsiz.»" },
        { k: "b", text: "«Uyda qo'shnilarga maktab haqida nima deysan?»", d: 1, kind: "soft",
          r: "U kulimsirab javob berdi: «Aytmayman. Ular baribir bilishadi.»" },
        { k: "c", text: "«Sinfda eng past baho senda. Buni yaxshilashimiz kerak.»", d: -2, kind: "trap",
          r: "Timur derazaga qaradi, peshonasini oynaga yaqin qo'ydi: «Ha. Bilaman.» — Va boshqa gapirmadi." }] },
    { place: "Tagi qora ko'cha",
      lead: "Uyga yana o'n metr. Timur kalitini qo'lida burib, sizga qaradi: «Ertaga nima qilamiz?»",
      opts: [
        { k: "a", text: "«Ertaga hovlida ko'rishamiz. To'pni sen olib kel.»", d: 2, kind: "lead",
          r: "U bosh irg'adi. «Ha», — dedi, va bu sovuq «ha» emas edi. Darvoza ochilganda ortiga o'girilib qo'l silkitdi." },
        { k: "b", text: "«Uydagilarga bugungi darsni aytib ber.»", d: 0, kind: "soft",
          r: "U kuldi: «Ular dars emas, ovqat so'rashadi.» — Siz jim qoldiz." },
        { k: "c", text: "«Ertaga baholaring haqida gaplashamizmi?»", d: -2, kind: "trap",
          r: "Timur darvozani ochdi: «Bo'ldi.» — Eshik sizning yuzingizga yopilmadi, lekin siz shunday his qildingiz." }] }
  ];

  G.minigames.register("travelTalk", {
    title: "Timurni uyiga kuzatib qo'yamiz",
    subtitle: "Bugun dars emas — faqat yo'l",
    controls: "1-3 — javob berish · ENTER — davom etish · sichqoncha — bosish",
    principleIds: ["I-028", "I-043", "F-013"],

    create: function (api) {
      var t = 0, fade = 1, done = false, phase = "talk", m = 0, trust = 3, prior = 3;
      var reply = null, replyT = 0, picked = [], results = [], mood = 0;
      var camera = 0, busX = 1400, stride = 0, lockedFlash = 0;

      var intelList = (api.state && api.state.intel) || [];
      var flagMap = (api.state && api.state.flags) || {};
      function has(id) { return intelList.indexOf(id) >= 0 || intelList[id] === true; }
      function sfx(n, a) {
        try { if (api.sound && typeof api.sound[n] === "function") api.sound[n](a); } catch (e) { /* optional */ }
      }
      function finishOnce(r) { if (done) return; done = true; api.finish(r); }

      prior = clamp(typeof ((api && api.state) || {}).trust === "number" ? api.state.trust : 3, 0, 10);

      /* Whether the boy already trusts you from the morning changes how the last
         moment opens — the same words land differently on a warm walk. */
      function trustOpen() {
        return prior >= 6
          ? "Uyga yana o'n metr. Timur kalitini qo'lida burib, sizga qaradi: «Ertaga nima qilamiz?»"
          : "Uyga yana o'n metr. Timur kalitini qo'lida burib, jimgina: «Xo'p, yetib keldik.»";
      }

      function shift(d) {
        trust = clamp(trust + d, 0, 10);
        if (d >= 2) mood = 1; else if (d <= -1) mood = 2;
      }
      function choose(i) {
        if (phase !== "talk" || done) return;
        var opt = MOMENTS[m].opts[i];
        if (!opt) return;
        if (opt.intel && !has(opt.intel)) { sfx("bad"); lockedFlash = 1.6; return; }
        picked.push(opt.k);
        shift(opt.d);
        reply = opt; replyT = 0; phase = "reply";
        results.push({ moment: m + 1, key: opt.k, kind: opt.kind, delta: opt.d });
        sfx(opt.kind === "trap" ? "bad" : "good");
      }
      function advance() {
        if (phase !== "reply" || replyT < 0.35) return;
        if (m >= MOMENTS.length - 1) { wrapUp(); return; }
        m += 1; phase = "talk"; reply = null;
        if (m === 3) busX = 1100;
      }
      function definingChoice(won) {
        /* the defining choice of the run, in the documented TRAVEL_<n>_<a|b|c> scheme */
        var want = won ? "lead" : "trap";
        for (var i = results.length - 1; i >= 0; i--) {
          var res = results[i];
          if (res.kind === want) {
            if (res.key === "a") return "TRAVEL_" + res.moment + "_a";
            if (res.key === "b") return "TRAVEL_" + res.moment + "_b";
            return "TRAVEL_" + res.moment + "_c";
          }
        }
        var last = results[results.length - 1];
        if (!last) return "TRAVEL_1_a";
        if (last.key === "a") return "TRAVEL_" + last.moment + "_a";
        if (last.key === "b") return "TRAVEL_" + last.moment + "_b";
        return "TRAVEL_" + last.moment + "_c";
      }

      function wrapUp() {
        var won = trust >= 7, leads = 0, traps = 0;
        for (var i = 0; i < results.length; i++) {
          if (results[i].kind === "lead") leads++;
          if (results[i].kind === "trap") traps++;
        }
        var notes;
        if (won) notes = [
          { principle: "I-028", text: "Hozir bo'lish — javob berish emas, yonida jim tura olish. Besh daqiqa shuni ko'rsatdi." },
          { principle: "I-043", text: "Qimmat sovg'a emas, yo'lda berilgan bitta savol ishonchni ochdi." },
          { principle: "F-013", text: "Eshitdingiz, bittasini tanladingiz, davom etdingiz — bu yo'l esda qoldi." }];
        else notes = [
          { principle: "I-028", text: "Siz hozir bo'ldingiz, lekin hozir bo'lishning o'zi yetmaydi: uni eshitish kerak." },
          { principle: "I-001", text: "Suhbat yana xizmatga qaytdi: savol berdingiz, lekin javobni kutdingizmi?" }];
        if (leads >= 2) notes.push({ principle: "I-043", text: "Uning o'z yo'lidan yurish — kichik ish, lekin bolaga eng katta ishonch beradigan ish." });
        if (traps >= 2) notes.push({ principle: "I-028", text: "Ikki marta darsga qaytdingiz. Har safar u bir qadam uzoqlashdi." });
        if (prior >= 6 && won) notes.push({ principle: "I-001", text: "Ertalabdan yig'ilgan ishonch bugun meva berdi — bu bir kunda qurilmagan." });

        var effects = [{ intel: "intel_timur_street" }];
        if (won) effects.push({ trust: 2 }, { intel: "intel_timur_trust" }, { flag: "walked_home_well" });
        else if (trust >= 5) effects.push({ trust: 1 });
        else effects.push({ flag: "walked_home_awkward" });

        finishOnce({
          win: won,
          choiceId: definingChoice(won),
          detail: won
            ? "Yo'lda jim o'tirmadingiz, lekin dars ham o'qimadingiz. Timur uyiga yetib bordi va eshikdan oldin ortiga qaradi."
            : trust >= 5
              ? "Uyga yetib bordingiz. U sizni rad etmadi — lekin eshikni ochishdan oldin bir zum to'xtadi."
              : "Uyga yetib bordingiz. Timur eshikni ochdi — siz esa hali ham savol berishni o'ylayotgan edingiz.",
          notes: notes,
          effects: effects,
          summary: { trust: trust, picked: picked.slice(), leads: leads, traps: traps }
        });
      }

      function drawScene(ctx) {
        var sky = ctx.createLinearGradient(0, -20, 0, ROAD);
        sky.addColorStop(0, "#1b2743"); sky.addColorStop(0.42, "#3a4568");
        sky.addColorStop(0.74, "#8a6a63"); sky.addColorStop(1, "#d99a64");
        ctx.fillStyle = sky; ctx.fillRect(-10, -20, W + 20, ROAD + 22);
        var sun = ctx.createRadialGradient(668, 104, 4, 668, 104, 140);
        sun.addColorStop(0, "rgba(255,214,150,0.5)");
        sun.addColorStop(0.45, "rgba(255,170,110,0.16)");
        sun.addColorStop(1, "rgba(255,170,110,0)");
        ctx.fillStyle = sun; ctx.fillRect(510, 0, 360, 200);
        ctx.fillStyle = "rgba(255,240,208,0.92)";
        ctx.beginPath(); ctx.arc(668, 104, 18, 0, Math.PI * 2); ctx.fill();

        var off1 = (camera * 0.2) % 200;
        for (var i = -1; i < 6; i++) {
          var bx = i * 200 - off1, hh = 42 + hash(i + 3) * 54;
          ctx.fillStyle = "rgba(72,88,120,0.72)";
          ctx.fillRect(bx, ROAD - 18 - hh, 126, hh);
          ctx.fillRect(bx + 20, ROAD - 38 - hh, 36, 20);
        }
        ctx.fillStyle = "rgba(255,205,140,0.5)";
        for (var j = -1; j < 22; j++) ctx.fillRect(j * 40 - ((camera * 0.2) % 40), ROAD - 36 - (j % 3) * 11, 4, 6);

        var off2 = (camera * 0.5) % 176;
        for (var k = -1; k < 7; k++) {
          var x2 = k * 176 - off2, h2 = 76 + hash(k + 11) * 44;
          ctx.fillStyle = "rgba(58,74,104,0.9)";
          ctx.fillRect(x2, ROAD - 14 - h2, 96, h2);
          ctx.fillStyle = "rgba(242,196,105,0.28)";
          ctx.fillRect(x2 + 11, ROAD - 14 - h2 + 15, 10, 12);
          ctx.fillRect(x2 + 38, ROAD - 14 - h2 + 15, 10, 12);
          ctx.fillRect(x2 + 65, ROAD - 14 - h2 + 15, 10, 12);
        }
      }

      function drawRoad(ctx) {
        var g = ctx.createLinearGradient(0, ROAD, 0, H);
        g.addColorStop(0, "#554738"); g.addColorStop(0.4, "#3b322b"); g.addColorStop(1, "#241e1a");
        ctx.fillStyle = g; ctx.fillRect(-10, ROAD, W + 20, H - ROAD + 20);
        ctx.fillStyle = "rgba(255,236,200,0.10)"; ctx.fillRect(-10, ROAD, W + 20, 2);
        var off = (camera * 1.0) % 140;
        for (var i = -1; i < 8; i++) {
          ctx.fillStyle = "rgba(246,239,227,0.13)";
          ctx.fillRect(i * 140 - off, ROAD + 38, 74, 5);
        }
        var off2 = (camera * 1.3) % 230;
        for (var j = -1; j < 6; j++) {
          var tx = j * 230 - off2 + 30;
          ctx.fillStyle = "rgba(14,20,30,0.55)";
          ctx.fillRect(tx - 3, ROAD - 12, 5, 12);
          ctx.beginPath();
          ctx.arc(tx, ROAD - 20, 13, 0, Math.PI * 2);
          ctx.arc(tx - 10, ROAD - 12, 10, 0, Math.PI * 2);
          ctx.arc(tx + 10, ROAD - 12, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      function drawBus(ctx) {
        if (busX > 1080) return;
        ctx.save(); ctx.translate(busX, ROAD - 48);
        ctx.fillStyle = "rgba(0,0,0,0.32)"; rrect(ctx, -6, 20, 200, 40, 9); ctx.fill();
        ctx.fillStyle = "#2f6f6a"; rrect(ctx, 0, -30, 186, 68, 9); ctx.fill();
        ctx.fillStyle = "#418f88"; rrect(ctx, 0, -30, 186, 21, 7); ctx.fill();
        ctx.fillStyle = "rgba(255,226,170,0.78)";
        for (var i = 0; i < 4; i++) ctx.fillRect(12 + i * 43, -16, 32, 25);
        ctx.fillStyle = "#e8d9c0"; ctx.fillRect(150, -9, 24, 46);
        ctx.fillStyle = "#20242a";
        ctx.beginPath(); ctx.arc(40, 38, 14, 0, Math.PI * 2); ctx.arc(146, 38, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#9aa3ad";
        ctx.beginPath(); ctx.arc(40, 38, 5, 0, Math.PI * 2); ctx.arc(146, 38, 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      function figure(ctx, x, feet, s, boy) {
        var bob = Math.sin(stride + (boy ? 0 : 1.1)) * 1.5;
        ctx.save(); ctx.translate(x, feet + bob); ctx.scale(s, s);
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath(); ctx.ellipse(0, 0, boy ? 18 : 20, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = boy ? "#2b3f63" : "#2a2a33";
        ctx.fillRect(-10, -34, 7, 30); ctx.fillRect(3, -34, 7, 30);
        ctx.fillStyle = boy ? "#1b2536" : "#15151b";
        ctx.fillRect(-13, -5, 11, 5); ctx.fillRect(2, -5, 11, 5);
        ctx.fillStyle = boy ? "#8fb3d9" : "#4b5563";
        rrect(ctx, -14, boy ? -60 : -68, 28, boy ? 33 : 38, 7); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.fillRect(-2, boy ? -58 : -66, 4, 20);
        ctx.fillStyle = boy ? "#e8b98f" : "#d9a97e";
        ctx.fillRect(-17, boy ? -56 : -64, 5, boy ? 24 : 28);
        ctx.fillRect(12, boy ? -56 : -64, 5, boy ? 24 : 28);
        ctx.beginPath(); ctx.arc(0, boy ? -72 : -81, boy ? 12 : 13, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = boy ? "#2b1c12" : "#20160f";
        ctx.beginPath(); ctx.arc(0, boy ? -75 : -85, boy ? 12 : 13, Math.PI * 0.97, Math.PI * 2.03); ctx.fill();
        ctx.beginPath();
        ctx.arc(-4, boy ? -70 : -79, 1.7, 0, Math.PI * 2);
        ctx.arc(4, boy ? -70 : -79, 1.7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.6; ctx.beginPath();
        if (boy && mood === 1) ctx.arc(0, -68, 4.5, 0.15 * Math.PI, 0.85 * Math.PI);
        else if (boy && mood === 2) ctx.arc(0, -62, 4.5, 1.15 * Math.PI, 1.85 * Math.PI);
        else if (boy) { ctx.moveTo(-3.5, -65); ctx.lineTo(3.5, -65); }
        else { ctx.moveTo(-3.5, -73); ctx.lineTo(3.5, -73); }
        ctx.stroke();
        ctx.fillStyle = boy ? "#3b2c1e" : "#5c4632";
        rrect(ctx, -9, boy ? -50 : -62, 18, 18, 4); ctx.fill();
        ctx.restore();
        txt(ctx, boy ? "Timur" : "Siz", x, feet + 18, "600 10px " + SANS, "rgba(246,239,227,0.5)", "center");
      }

      function drawMeter(ctx) {
        var x = 636;
        ctx.fillStyle = "rgba(16,14,16,0.82)"; rrect(ctx, x - 12, 176, 236, 112, 10); ctx.fill();
        ctx.strokeStyle = "rgba(242,196,105,0.18)"; ctx.lineWidth = 1.2; ctx.stroke();
        txt(ctx, "ISHONCH", x, 194, "700 10px " + SANS, "rgba(246,239,227,0.5)");
        txt(ctx, "suhbat " + (m + 1) + "/5", x + 212, 194, "600 10px " + SANS, "rgba(246,239,227,0.4)", "right");
        ctx.fillStyle = "rgba(0,0,0,0.45)"; rrect(ctx, x, 206, 212, 14, 7); ctx.fill();
        var g = ctx.createLinearGradient(x, 0, x + 212, 0);
        g.addColorStop(0, "#e0724f"); g.addColorStop(0.6, "#f2c469"); g.addColorStop(1, "#7fd694");
        ctx.fillStyle = g; rrect(ctx, x, 206, Math.max(13, 212 * trust / 10), 14, 7); ctx.fill();
        ctx.strokeStyle = "rgba(246,239,227,0.6)"; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x + 148, 202); ctx.lineTo(x + 148, 224); ctx.stroke();
        ctx.setLineDash([]);
        txt(ctx, trust + "/10", x, 238, "700 14px " + SANS, CREAM);
        txt(ctx, "g'alaba: 7+", x + 212, 238, "500 10px " + SANS, "rgba(246,239,227,0.4)", "right");
        txt(ctx, trust >= 7 ? "Timur ochiq" : trust >= 5 ? "Timur ehtiyotkor" : "Timur yopiq", x, 262,
          "600 11px " + SANS, trust >= 7 ? "#8fe0a4" : trust >= 5 ? GOLD : "#ff9a86");
      }

      function drawPanel(ctx) {
        if (m === 4) MOMENTS[4].lead = trustOpen();
        ctx.fillStyle = "rgba(14,12,14,0.86)"; rrect(ctx, 12, 176, 610, 296, 12); ctx.fill();
        ctx.strokeStyle = "rgba(242,196,105,0.2)"; ctx.lineWidth = 1.5; ctx.stroke();
        var moment = MOMENTS[m];
        txt(ctx, moment.place.toUpperCase(), 32, 198, "700 10px " + SANS, "rgba(242,196,105,0.85)");
        txt(ctx, "o'qituvchi emas — yo'ldosh", 602, 198, "500 10px " + SANS, "rgba(246,239,227,0.35)", "right");
        ctx.font = "500 13px " + SANS;
        var lead = wrap(ctx, moment.lead, 570), yy = 220;
        for (var i = 0; i < lead.length && i < 2; i++) { txt(ctx, lead[i], 32, yy, "500 13px " + SANS, "rgba(246,239,227,0.9)"); yy += 18; }

        if (phase === "talk") {
          var mouse = api.mouse || { x: -1, y: -1 };
          for (var k = 0; k < moment.opts.length; k++) {
            var opt = moment.opts[k], y = 268 + k * 52;
            var locked = opt.intel && !has(opt.intel);
            var hov = !locked && mouse.x >= 28 && mouse.x <= 602 && mouse.y >= y && mouse.y <= y + 44;
            ctx.fillStyle = locked ? "rgba(22,20,22,0.7)" : hov ? "rgba(72,58,35,0.95)" : "rgba(30,27,30,0.9)";
            rrect(ctx, 28, y, 574, 44, 8); ctx.fill();
            ctx.strokeStyle = locked ? "rgba(246,239,227,0.07)" : hov ? GOLD : "rgba(246,239,227,0.14)";
            ctx.lineWidth = hov ? 2 : 1.2; ctx.stroke();
            ctx.fillStyle = locked ? "rgba(255,255,255,0.12)" : GOLD;
            ctx.beginPath(); ctx.arc(52, y + 22, 12, 0, Math.PI * 2); ctx.fill();
            txt(ctx, String(k + 1), 52, y + 23, "700 12px " + SANS, locked ? "rgba(255,255,255,0.3)" : "#241a10", "center");
            txt(ctx, locked ? opt.text + "  (daftarda yo'q)" : opt.text, 74, y + 22.5,
              "500 13px " + SANS, locked ? "rgba(246,239,227,0.3)" : "rgba(246,239,227,0.95)");
            if (opt.kind === "intel" && !locked) {
              txt(ctx, "daftardan", 588, y + 22, "600 10px " + SANS, "rgba(242,196,105,0.75)", "right");
            }
          }
        } else if (reply) {
          var col = reply.d > 0 ? "#8fe0a4" : reply.d < 0 ? "#ff8f7a" : "#d9cdbd";
          ctx.font = "500 14px " + SANS;
          var rl = wrap(ctx, reply.r, 560);
          for (var j = 0; j < rl.length && j < 4; j++) txt(ctx, rl[j], 32, 282 + j * 21, "500 14px " + SANS, col);
          txt(ctx, (reply.d > 0 ? "+" : "") + reply.d + " ishonch", 602, 366, "700 13px " + SANS, col, "right");
          if (replyT > 0.35) {
            var a = (0.45 + 0.3 * Math.sin(t * 4)).toFixed(2);
            txt(ctx, m >= MOMENTS.length - 1 ? "ENTER — yakunlash" : "ENTER — davom etish", 32, 402,
              "600 12px " + SANS, "rgba(246,239,227," + a + ")");
          }
        }
      }

      function drawChrome(ctx) {
        if (t < 4) {
          ctx.globalAlpha = t < 3 ? 0.92 : Math.max(0, 0.92 * (1 - (t - 3)));
          txt(ctx, "1-3 — javob berish · ENTER — davom etish · sichqoncha ham ishlaydi", 12, 468,
            "500 12px " + SANS, "rgba(246,239,227,0.9)");
          ctx.globalAlpha = 1;
        } else if (lockedFlash > 0) {
          txt(ctx, "bu javob daftarda yo'q — avval uni o'rganish kerak", 12, 468,
            "600 11px " + SANS, "rgba(255,143,122," + Math.min(1, lockedFlash).toFixed(2) + ")");
        } else if (phase === "talk") {
          var p = (0.38 + 0.22 * Math.sin(t * 2.2)).toFixed(2);
          txt(ctx, prior >= 7 ? "u bugun sizga ochiqroq" : "bittasini tanlang", 630, 468,
            "600 11px " + SANS, "rgba(242,196,105," + p + ")", "right");
        }
        if (fade > 0) {
          ctx.fillStyle = "rgba(8,8,12," + fade.toFixed(3) + ")";
          ctx.fillRect(-10, -20, W + 20, H + 40);
        }
      }

      return {
        update: function (dt) {
          var s = Math.min(dt || 0, 0.05);
          t += s; fade = Math.max(0, fade - s * 2.4);
          camera += s * 74; stride += s * 6.5;
          lockedFlash = Math.max(0, lockedFlash - s);
          if (busX > 620) busX -= s * 185;
          if (phase === "reply") replyT += s;
        },
        draw: function (ctx) {
          drawScene(ctx); drawRoad(ctx); drawBus(ctx);
          figure(ctx, 380, ROAD + 76, 0.98, true);
          figure(ctx, 268, ROAD + 80, 1.02, false);
          drawPanel(ctx); drawMeter(ctx); drawChrome(ctx);
        },
        onKey: function (key) {
          if (!key || done) return;
          var k = String(key).toLowerCase();
          if (phase === "reply") {
            if (k === "enter" || k === "space" || k === "1") advance();
            return;
          }
          if (k === "1") choose(0);
          else if (k === "2") choose(1);
          else if (k === "3") choose(2);
        },
        onPointer: function (x, y, type) {
          if (type !== "down" || done) return;
          if (phase === "reply") { if (replyT > 0.35) advance(); return; }
          for (var i = 0; i < MOMENTS[m].opts.length; i++) {
            var yy = 268 + i * 52;
            if (x >= 28 && x <= 602 && y >= yy && y <= yy + 44) { choose(i); return; }
          }
        },
        _peek: function () { return { trust: trust, moment: m, phase: phase, results: results.slice(), prior: prior }; }
      };
    }
  });
})();
