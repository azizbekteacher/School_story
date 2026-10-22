/* Quest system: HUD, interaction routing, zone triggers, objective tracking. */
window.G = window.G || {};

G.quest = (function () {
  var W = 960, H = 600;
  var promptNpc = null;
  var toast = null;        // { text, t, kind }
  var toastQueue = [];
  var zoneCooldown = 0;
  var lastZone = "";
  var pendingTriggerZone = null;
  var t = 0;
  var minimapT = 0;

  function reset() {
    promptNpc = null;
    toast = null;
    toastQueue = [];
    zoneCooldown = 1.2;
    lastZone = "";
    pendingTriggerZone = null;
  }

  function showToast(text, kind) {
    toastQueue.push({ text: text, kind: kind || "info", t: 0 });
  }

  function beat() { return G.state.beat; }

  function npcEntryScene(npc) {
    var e = npc.entry || {};
    var b = beat();
    if (e[b]) return e[b];
    if (e.default) return e.default;
    // fall back to first value
    var keys = Object.keys(e);
    return keys.length ? e[keys[0]] : null;
  }

  function findTrigger(zone) {
    var story = G.data && G.data.story;
    if (!story || !story.triggers) return null;
    for (var i = 0; i < story.triggers.length; i++) {
      var tr = story.triggers[i];
      if (tr.zone !== zone) continue;
      if (tr.beat && beat() !== tr.beat) continue;
      if (tr.once && G.state.hasFlag("__trig_" + i)) continue;
      return { tr: tr, index: i };
    }
    return null;
  }

  function update(dt) {
    t += dt;
    minimapT += dt;
    if (zoneCooldown > 0) zoneCooldown -= dt;

    // toast life
    if (toast) {
      toast.t += dt;
      if (toast.t > 3.4) toast = null;
    } else if (toastQueue.length) {
      toast = toastQueue.shift();
      toast.t = 0;
    }

    if (G.dialogue.isActive() || G.minigameHost.isActive() || G.notebook.isOpen()) {
      promptNpc = null;
      return;
    }

    var zone = G.world.playerZone();

    // zone triggers: remember a pending zone so a trigger that was blocked by the
    // cooldown still fires once the cooldown clears (instead of being lost).
    if (zone !== lastZone) {
      lastZone = zone;
      pendingTriggerZone = zone;
    }
    if (pendingTriggerZone && zoneCooldown <= 0 && pendingTriggerZone === zone) {
      var found = findTrigger(zone);
      pendingTriggerZone = null;
      if (found) {
        if (found.tr.once) G.state.setFlag("__trig_" + found.index, true);
        startScene(found.tr.scene);
        return;
      }
    }

    // nearest npc
    var near = G.world.nearestNpc(64);
    promptNpc = near;

    // interact
    if (near && (G.input.wasPressed("e") || G.input.wasPressed("space"))) {
      G.input.consume("e"); G.input.consume("space");
      interact(near);
    }
  }

  function startScene(key) {
    if (!key) return;
    G.dialogue.startScene(key, {
      onEnd: function () {
        zoneCooldown = 0.6;
        refreshHud();
      }
    });
  }

  function interact(npc) {
    var key = npcEntryScene(npc);
    if (!key) {
      G.world.say(npc.id, "Hozir gaplashadigan vaqt emas.");
      return;
    }
    G.audio.select();
    startScene(key);
  }

  function refreshHud() {
    // called when beat changes — nothing persistent needed; objective is read live
  }

  // ---- HUD ----

  function drawHud(ctx) {
    drawObjective(ctx);
    drawMinimap(ctx);
    drawTrust(ctx);
    drawPrompt(ctx);
    drawToast(ctx);
  }

  function drawObjective(ctx) {
    var obj = G.state.currentObjective();
    if (!obj) return;
    var story = G.data && G.data.story;
    var title = (story && story.title) || "Mission";

    ctx.save();
    var w = 320, h = 62;
    var x = 20, y = 18;
    G.render.panel(ctx, x, y, w, h, {
      fill: "rgba(68,58,47,.85)", stroke: "rgba(232,196,128,.45)", radius: 9
    });

    // textAlign must be set explicitly: it is not part of save()/restore() state
    // that we can assume, and whichever surface drew last may have left it
    // centered. Inheriting "center" here pushed the title half off the left edge.
    ctx.textAlign = "left";
    ctx.font = "10px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(217,164,76,.85)";
    ctx.textBaseline = "top";
    ctx.fillText(title.toUpperCase(), x + 14, y + 11);

    ctx.font = "bold 14px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#f4ece0";
    var lines = G.util.wrapText(ctx, obj, w - 46);
    ctx.fillText(lines[0] || "", x + 26, y + 28);

    // arrow bullet
    ctx.fillStyle = "#d9a44c";
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 31);
    ctx.lineTo(x + 21, y + 35);
    ctx.lineTo(x + 14, y + 39);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /* The minimap sits in the top-right corner, as tight to the edge as the
     drop shadow allows, so it covers as little of the world as possible. It
     also fades out when the hero walks underneath it, because a HUD that hides
     the player is worse than no HUD. */
  var MAP_W = 144, MAP_H = 113;
  var MAP_MARGIN = 8;

  function minimapRect() {
    return { x: W - MAP_W - MAP_MARGIN, y: MAP_MARGIN + 2, w: MAP_W, h: MAP_H };
  }

  function drawMinimap(ctx) {
    var map = G.map;
    var r = minimapRect();
    var mw = r.w, mh = r.h;
    var x = r.x, y = r.y;
    var scaleX = mw / (map.COLS * map.T);
    var scaleY = mh / (map.ROWS * map.T);

    // fade when the player is behind the panel
    var p0 = G.world.player;
    var s0 = G.world.toScreen(p0.x, p0.y);
    var behind = s0.x > x - 60 && s0.y < y + mh + 60;
    var vis = behind ? 0.42 : 1;

    ctx.save();
    ctx.globalAlpha = vis;
    G.render.panel(ctx, x, y, mw, mh, {
      fill: "rgba(68,58,47,.88)", stroke: "rgba(232,196,128,.45)", radius: 9
    });
    ctx.beginPath();
    ctx.rect(x + 4, y + 4, mw - 8, mh - 8);
    ctx.clip();

    // zone blobs
    for (var z = 0; z < map.ZONES.length; z++) {
      var Z = map.ZONES[z];
      ctx.fillStyle = "rgba(120,105,85,.28)";
      ctx.fillRect(x + Z.x * scaleX, y + Z.y * scaleY, Z.w * scaleX, Z.h * scaleY);
    }

    // NPC dots
    var npcs = G.data.story && G.data.story.npcs ? G.data.story.npcs : [];
    for (var i = 0; i < npcs.length; i++) {
      var n = G.world.npcById(npcs[i].id);
      if (!n || !G.world.npcVisible(n)) continue;
      ctx.fillStyle = "rgba(217,164,76,.9)";
      ctx.beginPath();
      ctx.arc(x + n.x * scaleX, y + n.y * scaleY, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // player
    var p = G.world.player;
    ctx.fillStyle = "#8fd0e0";
    ctx.beginPath();
    ctx.arc(x + p.x * scaleX, y + p.y * scaleY, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(143,208,224,.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x + p.x * scaleX, y + p.y * scaleY, 6 + Math.sin(t * 3) * 1.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // zone name, as a footer strip inside the panel so it never spills into
    // the play area below the minimap
    var names = {
      street: "Ko'cha", gate: "Darvaza", yard: "Hovli", shop: "Do'kon",
      corridor: "Koridor", staffroom: "O'qituvchilar xonasi", classroom: "5-B sinf"
    };
    var zoneName = names[G.world.playerZone()] || "";
    if (zoneName) {
      ctx.fillStyle = "rgba(38,32,26,.72)";
      ctx.fillRect(x + 4, y + mh - 19, mw - 8, 15);
      ctx.font = "10px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(244,236,224,.66)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(zoneName, x + mw / 2, y + mh - 11);
    }
    ctx.restore();
  }

  function drawTrust(ctx) {
    var tr = G.state.trust;
    var show = tr > 0 || G.state.notes.length > 0;
    if (!show) return;
    var x = 20, y = 92, w = 200;
    ctx.save();
    // Same inherited-textAlign trap as drawObjective: without this the label can
    // be centred on x+2 and hang off the left edge.
    ctx.textAlign = "left";
    ctx.font = "10px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(244,236,224,.5)";
    ctx.fillText("Timur: " + G.state.trustLabel(), x + 2, y - 4);
    ctx.restore();
    G.render.progressBar(ctx, x, y, w, 8, tr / 10,
      tr >= 7 ? "#7fb86b" : (tr >= 4 ? "#d9a44c" : "#c4553f"));
  }

  function drawPrompt(ctx) {
    if (!promptNpc || G.dialogue.isActive() || G.minigameHost.isActive()) return;
    var s = G.world.toScreen(promptNpc.x, promptNpc.y);
    if (s.x < -100 || s.x > W + 100 || s.y < -100 || s.y > H + 100) return;
    G.render.prompt(ctx, s.x, s.y, "E — gaplash", t);
  }

  function drawToast(ctx) {
    if (!toast) return;
    var a = Math.min(1, toast.t / 0.25) * (toast.t > 2.9 ? Math.max(0, (3.4 - toast.t) / 0.5) : 1);
    var rise = (1 - Math.min(1, toast.t / 0.3)) * 10;

    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = "bold 14px 'Segoe UI', system-ui, sans-serif";
    var w = Math.min(560, ctx.measureText(toast.text).width + 44);
    var x = (W - w) / 2, y = 108 + rise;

    var col = "#7fb86b";
    if (toast.kind === "bad") col = "#c4553f";
    else if (toast.kind === "intel") col = "#8fc3d9";
    else if (toast.kind === "warn") col = "#d9a44c";

    G.util.roundRect(ctx, x, y, w, 38, 9);
    ctx.fillStyle = "rgba(22,19,16,.95)";
    ctx.fill();
    ctx.strokeStyle = G.util.alpha(col, 0.7);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#f4ece0";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(toast.text, W / 2, y + 20);
    ctx.restore();
  }

  return {
    update: update,
    drawHud: drawHud,
    showToast: showToast,
    startScene: startScene,
    reset: reset,
    // test hook: the minimap panel rect, so a probe can assert it stays clear of
    // the playable centre without re-deriving the geometry
    minimapRect: minimapRect,
    getPromptNpc: function () { return promptNpc; },
    // test hook: clear the trigger cooldown so a teleport can fire a trigger immediately
    clearCooldown: function () { zoneCooldown = 0; }
  };
})();
