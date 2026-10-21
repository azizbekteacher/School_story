/* World: camera, player movement, NPC instances, world drawing. */
window.G = window.G || {};

G.world = (function () {
  var T = 32;
  var map = null;
  var decor = null;

  var cam = { x: 0, y: 0, tx: 0, ty: 0, shake: 0 };
  var player = {
    x: 0, y: 0, vx: 0, vy: 0,
    speed: 132,
    facing: "down",
    walkPhase: 0,
    moving: false,
    frozen: false,
    radius: 7
  };
  var npcs = [];
  var W = 960, H = 600;
  var zone = "street";
  var lastStep = 0;
  var timeAcc = 0;
  var dustParticles = [];

  function init() {
    map = G.map;
    map.build();
    decor = map.decor();
    var ws = map.worldSize();
    var start = map.anchor("street", 0);
    player.x = start.x;
    player.y = start.y;
    cam.x = player.x - W / 2;
    cam.y = player.y - H / 2;
    clampCam();
    cam.tx = cam.x; cam.ty = cam.y;
  }

  function setNpcs(list) {
    npcs = (list || []).map(function (n) {
      var pos = map.anchor(n.zone || "yard", n.at || 0);
      return {
        id: n.id,
        name: n.name,
        role: n.role || "",
        palette: n.palette || "adult_male",
        facing: n.facing || "down",
        x: pos.x,
        y: pos.y,
        walkPhase: 0,
        activeWhen: n.activeWhen || null,
        entry: n.entry || {},
        bubble: null,
        bubbleT: 0,
        def: n
      };
    });
  }

  function npcById(id) {
    for (var i = 0; i < npcs.length; i++) if (npcs[i].id === id) return npcs[i];
    return null;
  }

  function clampCam() {
    var ws = map.worldSize();
    cam.x = G.util.clamp(cam.x, 0, Math.max(0, ws.w - W));
    cam.y = G.util.clamp(cam.y, 0, Math.max(0, ws.h - H));
  }

  function moveDir() {
    var ix = 0, iy = 0;
    if (G.input.isDown("a") || G.input.isDown("arrowleft")) ix -= 1;
    if (G.input.isDown("d") || G.input.isDown("arrowright")) ix += 1;
    if (G.input.isDown("w") || G.input.isDown("arrowup")) iy -= 1;
    if (G.input.isDown("s") || G.input.isDown("arrowdown")) iy += 1;
    if (ix && iy) { var inv = 1 / Math.sqrt(2); ix *= inv; iy *= inv; }
    return { x: ix, y: iy };
  }

  function updatePlayer(dt) {
    if (player.frozen) {
      player.moving = false;
      player.walkPhase += dt * 2;
      return;
    }
    var d = moveDir();
    var sp = player.speed;
    var nx = player.x + d.x * sp * dt;
    var ny = player.y + d.y * sp * dt;

    // axis-separated collision so we slide along walls
    if (map.canStand(nx, player.y, player.radius)) player.x = nx;
    if (map.canStand(player.x, ny, player.radius)) player.y = ny;

    player.moving = (d.x !== 0 || d.y !== 0);

    if (player.moving) {
      player.walkPhase += dt * 9;
      if (Math.abs(d.x) > Math.abs(d.y)) {
        player.facing = d.x > 0 ? "right" : "left";
      } else if (d.y !== 0) {
        player.facing = d.y > 0 ? "down" : "up";
      }
      // footstep audio + dust
      if (player.walkPhase - lastStep > 2.1) {
        lastStep = player.walkPhase;
        G.audio.step();
        dustParticles.push({
          x: player.x + (Math.random() - 0.5) * 6,
          y: player.y,
          life: 0.5, max: 0.5,
          vx: (Math.random() - 0.5) * 14,
          vy: -8 - Math.random() * 6
        });
      }
    } else {
      player.walkPhase += dt * 1.6;
    }

    zone = map.zoneLogical(player.x, player.y);
  }

  function updateCamera(dt) {
    var ws = map.worldSize();
    cam.tx = player.x - W / 2;
    cam.ty = player.y - H / 2;
    cam.tx = G.util.clamp(cam.tx, 0, Math.max(0, ws.w - W));
    cam.ty = G.util.clamp(cam.ty, 0, Math.max(0, ws.h - H));
    var k = 1 - Math.pow(0.0015, dt);
    cam.x = G.util.lerp(cam.x, cam.tx, k);
    cam.y = G.util.lerp(cam.y, cam.ty, k);
    if (cam.shake > 0) cam.shake = Math.max(0, cam.shake - dt * 2.4);
  }

  function updateParticles(dt) {
    for (var i = dustParticles.length - 1; i >= 0; i--) {
      var p = dustParticles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 22 * dt;
      if (p.life <= 0) dustParticles.splice(i, 1);
    }
  }

  function updateNpcs(dt) {
    for (var i = 0; i < npcs.length; i++) {
      var n = npcs[i];
      n.walkPhase += dt * 1.4;
      if (n.bubble) {
        n.bubbleT += dt;
        if (n.bubbleT > 4.2) { n.bubble = null; n.bubbleT = 0; }
      }
      // face the player when close
      var d = G.util.dist(n.x, n.y, player.x, player.y);
      if (d < 70 && d > 1) {
        var dx = player.x - n.x, dy = player.y - n.y;
        n.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
      }
    }
  }

  function tick(dt) {
    timeAcc += dt;
    updatePlayer(dt);
    updateCamera(dt);
    updateNpcs(dt);
    updateParticles(dt);
  }

  function nearestNpc(maxDist) {
    var best = null, bestD = maxDist || 58;
    for (var i = 0; i < npcs.length; i++) {
      var n = npcs[i];
      if (!npcVisible(n)) continue;
      var d = G.util.dist(n.x, n.y, player.x, player.y);
      if (d < bestD) { bestD = d; best = n; }
    }
    return best;
  }

  function npcVisible(n) {
    if (!n.activeWhen) return true;
    var aw = n.activeWhen;
    var st = G.state;
    if (aw.beat && st.beat !== aw.beat) return false;
    if (aw.notBeat && st.beat === aw.notBeat) return false;
    if (aw.beatIn && aw.beatIn.indexOf(st.beat) === -1) return false;
    if (aw.flag && !st.flags[aw.flag]) return false;
    if (aw.notFlag && st.flags[aw.notFlag]) return false;
    return true;
  }

  // ---- drawing ----

  /* Daylight palette. The first version ran at ~25% luminance and read as dusk;
     these are lifted ~40% so the school day actually looks like daytime while
     keeping the Bukhara brick/dust hue. */
  function tileColor(tile, cx, cy) {
    var n = G.util.hash(cx * 7.3 + cy * 13.7);
    switch (tile) {
      case 0: return n > 0.5 ? "#a08a70" : "#9a8469";   // packed dust / brick
      case 1: return n > 0.5 ? "#7d9a5c" : "#769154";   // grass
      case 2: return n > 0.5 ? "#b6a086" : "#ae987d";   // path
      case 3: return n > 0.5 ? "#b3a08c" : "#ab9883";   // indoor floor
      case 4: return n > 0.5 ? "#8a7660" : "#827056";   // wall
      case 5: return "#6fa3b8";                          // water
      case 6: return "#6d8a4e";                          // tree
      case 7: return "#bd9660";                          // bench
      case 8: return "#a37d55";                          // shelf
      case 9: return "#bd9560";                          // desk
      case 10: return "#c9a06b";                         // door
      case 11: return n > 0.5 ? "#9d8375" : "#967c6e";  // carpet
      default: return "#a08a70";
    }
  }

  function drawTiles(ctx, cx0, cy0, cx1, cy1) {
    for (var cy = cy0; cy <= cy1; cy++) {
      for (var cx = cx0; cx <= cx1; cx++) {
        var tile = map.get(cx, cy);
        ctx.fillStyle = tileColor(tile, cx, cy);
        ctx.fillRect(cx * T, cy * T, T, T);

        // subtle tile grain
        if (tile === 0 || tile === 1 || tile === 3 || tile === 2) {
          ctx.fillStyle = "rgba(0,0,0,.06)";
          var n = G.util.hash(cx * 3.1 + cy * 5.7);
          ctx.fillRect(cx * T + n * 20, cy * T + n * 13, 3, 2);
        }
        // walls get a lit top edge
        if (tile === 4) {
          if (map.get(cx, cy - 1) !== 4) {
            ctx.fillStyle = "rgba(217,164,76,.10)";
            ctx.fillRect(cx * T, cy * T, T, 4);
          }
          ctx.fillStyle = "rgba(0,0,0,.22)";
          ctx.fillRect(cx * T, cy * T + T - 5, T, 5);
        }
        if (tile === 5) {
          var w = Math.sin(timeAcc * 1.6 + cx * 0.7 + cy * 0.4);
          ctx.fillStyle = "rgba(140,200,220," + (0.05 + 0.035 * w) + ")";
          ctx.fillRect(cx * T, cy * T + 6, T, T - 12);
        }
        if (tile === 6) {
          // trees drawn as decor-ish blobs on top of the tile
          ctx.fillStyle = "rgba(0,0,0,.28)";
          ctx.beginPath();
          ctx.ellipse(cx * T + T / 2, cy * T + T - 4, 13, 5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#2c3a24";
          ctx.beginPath();
          ctx.arc(cx * T + T / 2, cy * T + T / 2 - 3, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#3c4f30";
          ctx.beginPath();
          ctx.arc(cx * T + T / 2 - 4, cy * T + T / 2 - 7, 8, 0, Math.PI * 2);
          ctx.fill();
        }
        if (tile === 10) {
          ctx.fillStyle = "rgba(217,164,76,.20)";
          ctx.fillRect(cx * T + 2, cy * T + 2, T - 4, T - 4);
        }
        if (tile === 9 || tile === 8 || tile === 7) {
          ctx.fillStyle = "rgba(0,0,0,.25)";
          ctx.fillRect(cx * T, cy * T + T - 6, T, 6);
          ctx.fillStyle = "rgba(255,255,255,.05)";
          ctx.fillRect(cx * T, cy * T, T, 3);
        }
      }
    }
  }

  function drawDecor(ctx) {
    for (var i = 0; i < decor.length; i++) {
      var d = decor[i];
      switch (d.type) {
        case "rug":
          ctx.save();
          ctx.globalAlpha = 0.55;
          ctx.fillStyle = d.color || "#5a3a2e";
          G.util.roundRect(ctx, d.x, d.y, d.w, d.h, 6);
          ctx.fill();
          ctx.globalAlpha = 0.25;
          ctx.strokeStyle = "#d9a44c";
          ctx.lineWidth = 2;
          G.util.roundRect(ctx, d.x + 6, d.y + 6, d.w - 12, d.h - 12, 4);
          ctx.stroke();
          ctx.restore();
          break;
        case "lamp":
          ctx.save();
          var flick = 0.75 + Math.sin(timeAcc * 6 + d.x) * 0.06;
          var g = ctx.createRadialGradient(d.x, d.y, 4, d.x, d.y, 90);
          g.addColorStop(0, "rgba(255,214,140," + (0.22 * flick) + ")");
          g.addColorStop(1, "rgba(255,214,140,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(d.x, d.y, 90, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffe0a0";
          ctx.beginPath();
          ctx.arc(d.x, d.y, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        case "sign":
          ctx.save();
          ctx.font = "bold 12px 'Segoe UI', system-ui, sans-serif";
          ctx.textAlign = "center";
          var tw = ctx.measureText(d.text).width;
          G.util.roundRect(ctx, d.x - tw / 2 - 10, d.y - 14, tw + 20, 20, 5);
          ctx.fillStyle = "rgba(28,22,18,.92)";
          ctx.fill();
          ctx.strokeStyle = "rgba(217,164,76,.5)";
          ctx.stroke();
          ctx.fillStyle = "#e8cf9a";
          ctx.textBaseline = "middle";
          ctx.fillText(d.text, d.x, d.y - 3);
          ctx.restore();
          break;
        case "board":
        case "blackboard":
          ctx.save();
          ctx.fillStyle = d.type === "blackboard" ? "#26362e" : "#2f3d36";
          ctx.fillRect(d.x, d.y, d.w, d.h);
          ctx.strokeStyle = "rgba(217,164,76,.35)";
          ctx.lineWidth = 2;
          ctx.strokeRect(d.x, d.y, d.w, d.h);
          if (d.text) {
            ctx.font = "bold 9px 'Segoe UI', system-ui, sans-serif";
            ctx.fillStyle = "rgba(240,235,220,.5)";
            ctx.textAlign = "center";
            ctx.fillText(d.text, d.x + d.w / 2, d.y + d.h / 2 + 3);
          }
          ctx.restore();
          break;
        case "poster":
          ctx.save();
          ctx.fillStyle = "rgba(232,207,154,.14)";
          ctx.fillRect(d.x, d.y, 26, 32);
          ctx.strokeStyle = "rgba(217,164,76,.4)";
          ctx.strokeRect(d.x, d.y, 26, 32);
          ctx.font = "bold 9px 'Segoe UI', system-ui, sans-serif";
          ctx.fillStyle = "rgba(240,235,220,.7)";
          ctx.textAlign = "center";
          ctx.fillText(d.text, d.x + 13, d.y + 20);
          ctx.restore();
          break;
        case "wallPoster":
          ctx.save();
          ctx.fillStyle = "rgba(232,207,154,.10)";
          ctx.fillRect(d.x, d.y, 22, 28);
          ctx.strokeStyle = "rgba(217,164,76,.25)";
          ctx.strokeRect(d.x, d.y, 22, 28);
          ctx.font = "bold 7px 'Segoe UI', system-ui, sans-serif";
          ctx.fillStyle = "rgba(240,235,220,.5)";
          ctx.textAlign = "center";
          var ws = d.text.split(" ");
          for (var wi = 0; wi < ws.length; wi++) {
            ctx.fillText(ws[wi], d.x + 11, d.y + 12 + wi * 9);
          }
          ctx.restore();
          break;
        case "plant":
          ctx.save();
          ctx.fillStyle = "#8a6a4a";
          ctx.fillRect(d.x - 5, d.y - 2, 10, 8);
          ctx.fillStyle = "#3f5a34";
          ctx.beginPath();
          ctx.arc(d.x, d.y - 8, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#4d6b3f";
          ctx.beginPath();
          ctx.arc(d.x - 3, d.y - 11, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        case "fountain":
          ctx.save();
          ctx.fillStyle = "rgba(140,200,220,.18)";
          ctx.beginPath();
          ctx.arc(d.x, d.y, 26, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(180,220,235,.30)";
          ctx.beginPath();
          ctx.arc(d.x, d.y, 12 + Math.sin(timeAcc * 2) * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        case "goal":
          ctx.save();
          ctx.strokeStyle = "rgba(230,225,210,.55)";
          ctx.lineWidth = 2;
          ctx.strokeRect(d.x, d.y, 46, 20);
          ctx.restore();
          break;
        case "balllines":
          ctx.save();
          ctx.strokeStyle = "rgba(230,225,210,.18)";
          ctx.lineWidth = 2;
          ctx.strokeRect(d.x, d.y, d.w, d.h);
          ctx.beginPath();
          ctx.moveTo(d.x + d.w / 2, d.y);
          ctx.lineTo(d.x + d.w / 2, d.y + d.h);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(d.x + d.w / 2, d.y + d.h / 2, 16, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          break;
        case "gatearch":
          ctx.save();
          ctx.fillStyle = "rgba(40,32,26,.9)";
          ctx.fillRect(d.x - 10, d.y - 66, 12, 66);
          ctx.fillRect(d.x + 60, d.y - 66, 12, 66);
          ctx.fillRect(d.x - 14, d.y - 76, 90, 14);
          ctx.fillStyle = "rgba(217,164,76,.55)";
          ctx.font = "bold 10px 'Segoe UI', system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("SULTON SCHOOL", d.x + 31, d.y - 66);
          ctx.restore();
          break;
        case "lamppost":
          ctx.save();
          ctx.fillStyle = "rgba(40,34,28,.9)";
          ctx.fillRect(d.x - 2, d.y - 58, 4, 58);
          var lg = ctx.createRadialGradient(d.x, d.y - 60, 2, d.x, d.y - 60, 70);
          lg.addColorStop(0, "rgba(255,214,140,.20)");
          lg.addColorStop(1, "rgba(255,214,140,0)");
          ctx.fillStyle = lg;
          ctx.beginPath();
          ctx.arc(d.x, d.y - 60, 70, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffe0a0";
          ctx.beginPath();
          ctx.arc(d.x, d.y - 60, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        case "bench_street":
          ctx.save();
          ctx.fillStyle = "#6b5335";
          ctx.fillRect(d.x, d.y, 40, 8);
          ctx.fillStyle = "#4a3a26";
          ctx.fillRect(d.x + 3, d.y + 8, 4, 8);
          ctx.fillRect(d.x + 33, d.y + 8, 4, 8);
          ctx.restore();
          break;
        case "car":
          ctx.save();
          ctx.fillStyle = "rgba(0,0,0,.3)";
          G.util.roundRect(ctx, d.x, d.y + 40, 78, 14, 7);
          ctx.fill();
          ctx.fillStyle = d.color;
          G.util.roundRect(ctx, d.x, d.y, 78, 42, 9);
          ctx.fill();
          ctx.fillStyle = "rgba(180,220,235,.22)";
          G.util.roundRect(ctx, d.x + 12, d.y + 6, 54, 14, 4);
          ctx.fill();
          ctx.fillStyle = "#1c1a18";
          ctx.fillRect(d.x + 8, d.y + 34, 14, 8);
          ctx.fillRect(d.x + 56, d.y + 34, 14, 8);
          ctx.restore();
          break;
      }
    }
  }

  function drawShadowAndChars(ctx) {
    // draw all characters sorted by y so nearer ones overlap
    var list = [];
    for (var i = 0; i < npcs.length; i++) {
      var n = npcs[i];
      if (!npcVisible(n)) continue;
      list.push({ y: n.y, kind: "npc", obj: n });
    }
    list.push({ y: player.y, kind: "player", obj: player });
    list.sort(function (a, b) { return a.y - b.y; });

    for (var k = 0; k < list.length; k++) {
      var it = list[k];
      var o = it.obj;
      G.render.shadow(ctx, o.x, o.y - 1, 9, 4);
      if (it.kind === "player") {
        G.render.character(ctx, o.x, o.y, "hero", o.facing, o.walkPhase);
      } else {
        G.render.character(ctx, o.x, o.y, o.palette, o.facing, o.walkPhase);
        // name tag
        ctx.save();
        ctx.font = "10px 'Segoe UI', system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(0,0,0,.5)";
        var nw = ctx.measureText(o.name).width;
        G.util.roundRect(ctx, o.x - nw / 2 - 5, o.y - 52, nw + 10, 14, 7);
        ctx.fill();
        ctx.fillStyle = "rgba(244,236,224,.85)";
        ctx.fillText(o.name, o.x, o.y - 42);
        ctx.restore();
      }
    }

    // bubbles and prompts on top
    for (var j = 0; j < npcs.length; j++) {
      var nn = npcs[j];
      if (!npcVisible(nn)) continue;
      if (nn.bubble) {
        G.render.bubble(ctx, nn.x, nn.y, nn.bubble, nn.bubbleT / 0.18);
      }
    }
  }

  function drawDust(ctx) {
    for (var i = 0; i < dustParticles.length; i++) {
      var p = dustParticles[i];
      var a = (p.life / p.max) * 0.30;
      ctx.fillStyle = "rgba(200,180,150," + a + ")";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2 * (1 - p.life / p.max) + 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw(ctx) {
    var sx = cam.shake ? (Math.random() - 0.5) * cam.shake * 6 : 0;
    var sy = cam.shake ? (Math.random() - 0.5) * cam.shake * 6 : 0;

    ctx.save();
    ctx.translate(-Math.round(cam.x) + sx, -Math.round(cam.y) + sy);

    var cx0 = Math.floor(cam.x / T) - 1;
    var cy0 = Math.floor(cam.y / T) - 1;
    var cx1 = Math.ceil((cam.x + W) / T) + 1;
    var cy1 = Math.ceil((cam.y + H) / T) + 1;
    cx0 = Math.max(0, cx0); cy0 = Math.max(0, cy0);
    cx1 = Math.min(map.COLS - 1, cx1); cy1 = Math.min(map.ROWS - 1, cy1);

    drawTiles(ctx, cx0, cy0, cx1, cy1);

    // indoor vignette-ish floor shadow: darken inside school? keep simple
    drawDecor(ctx);
    drawDust(ctx);
    drawShadowAndChars(ctx);

    ctx.restore();
  }

  // world → screen
  function toScreen(wx, wy) {
    return { x: wx - cam.x, y: wy - cam.y };
  }

  function shake(amount) { cam.shake = Math.max(cam.shake, amount); }

  function playerZone() { return map.zoneLogical(player.x, player.y); }

  function setPlayerPos(x, y) { player.x = x; player.y = y; }

  function freeze(v) { player.frozen = !!v; }

  function say(npcId, text) {
    var n = npcById(npcId);
    if (n) { n.bubble = text; n.bubbleT = 0; }
  }

  function reset() {
    init();
  }

  return {
    init: init,
    tick: tick,
    draw: draw,
    setNpcs: setNpcs,
    npcById: npcById,
    nearestNpc: nearestNpc,
    npcVisible: npcVisible,
    toScreen: toScreen,
    player: player,
    cam: cam,
    shake: shake,
    playerZone: playerZone,
    setPlayerPos: setPlayerPos,
    freeze: freeze,
    say: say,
    reset: reset,
    getZone: function () { return zone; }
  };
})();
