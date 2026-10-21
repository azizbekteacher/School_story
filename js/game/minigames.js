/* Minigame host: owns the overlay, api object, input routing, result handling. */
window.G = window.G || {};

G.minigames = G.minigames || { list: {}, order: [] };
G.minigames.register = function (id, def) {
  this.list[id] = def;
  this.order.push(id);
};

G.minigameHost = (function () {
  var W = 960, H = 600;
  var active = null;      // { id, def, inst, api, t, done, result }
  var onFinish = null;
  var ctxRef = null;

  function start(gameId, config, callbacks) {
    var def = G.minigames.list[gameId];
    if (!def) {
      // never block the mission on a missing game
      if (callbacks && callbacks.onFinish) {
        callbacks.onFinish({ win: true, choiceId: null, detail: "Minigame topilmadi: " + gameId });
      }
      return false;
    }

    var api = {
      w: W, h: H,
      cfg: config || {},
      state: {
        flags: G.state.flags,
        intel: G.state.intel.slice(),
        trust: G.state.trust,
        beat: G.state.beat,
        scores: G.state.scores
      },
      mouse: { x: W / 2, y: H / 2 },
      sound: {
        blip: function (f) { G.audio.blip(f); },
        tick: function () { G.audio.tick(); },
        select: function () { G.audio.select(); },
        good: function () { G.audio.good(); },
        bad: function () { G.audio.bad(); },
        win: function () { G.audio.win(); }
      },
      finish: function (result) {
        if (!active || active.done) return;
        active.done = true;
        active.result = result || { win: true };
        active.finishHold = 0.35;   // small beat before handing back
      }
    };

    active = {
      id: gameId,
      def: def,
      inst: def.create(api),
      api: api,
      t: 0,
      done: false,
      result: null,
      finishHold: 0,
      controlFade: 4
    };
    onFinish = (callbacks && callbacks.onFinish) || null;

    G.audio.select();
    return true;
  }

  function isActive() { return !!active; }

  function update(dt) {
    if (!active) return;
    active.t += dt;
    active.controlFade = Math.max(0, active.controlFade - dt);

    if (!active.done) {
      if (active.inst && active.inst.update) {
        try { active.inst.update(dt); } catch (e) { console.error("minigame update", e); }
      }
      routeInput();
    } else {
      active.finishHold -= dt;
      if (active.finishHold <= 0) {
        var result = active.result || { win: true };
        var cb = onFinish;
        var id = active.id;
        var def = active.def;
        active = null;
        onFinish = null;

        if (def && def.principles && !result.principleIds) {
          result.principleIds = def.principles;
        }
        if (cb) {
          try { cb(result); } catch (e) { console.error("minigame finish handler", e); }
        }
      }
    }
  }

  function routeInput() {
    if (!active || !active.inst) return;
    active.api.mouse.x = G.input.mouse.x;
    active.api.mouse.y = G.input.mouse.y;

    var keys = [
      "1", "2", "3", "4", "5", "6", "7", "8", "9",
      "enter", "space", "escape", "arrowleft", "arrowright", "arrowup", "arrowdown", "tab",
      "a", "d", "w", "s", "r"
    ];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (G.input.wasPressed(k)) {
        G.input.consume(k);
        if (active.inst.onKey) {
          try { active.inst.onKey(k); } catch (e) { console.error("minigame key", e); }
        }
      }
    }
    if (G.input.mouse.clicked && active.inst.onPointer) {
      try { active.inst.onPointer(G.input.mouse.x, G.input.mouse.y, "down"); }
      catch (e) { console.error("minigame pointer", e); }
    }
  }

  function draw(ctx) {
    if (!active) return;
    ctxRef = ctx;

    ctx.save();
    // dim the world behind
    ctx.fillStyle = "rgba(42,36,30,.58)";
    ctx.fillRect(0, 0, W, H);

    // frame
    var px = 40, py = 30, pw = W - 80, ph = H - 60;
    G.render.panel(ctx, px, py, pw, ph, {
      fill: "rgba(74,63,51,.97)",
      stroke: "rgba(217,164,76,.55)",
      radius: 14,
      inner: true
    });

    // header
    var def = active.def;
    ctx.save();
    ctx.font = "bold 20px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#f2dfae";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(def.title || "", px + 26, py + 42);

    if (def.subtitle) {
      ctx.font = "13px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(244,236,224,.62)";
      ctx.fillText(def.subtitle, px + 26, py + 64);
    }
    ctx.restore();

    // clip game content to the inner area
    ctx.save();
    ctx.beginPath();
    ctx.rect(px + 14, py + 78, pw - 28, ph - 78 - 44);
    ctx.clip();
    ctx.translate(px + 14, py + 78);
    if (active.inst && active.inst.draw) {
      try { active.inst.draw(ctx); } catch (e) { console.error("minigame draw", e); }
    }
    ctx.restore();

    // controls footer, fading out
    if (def.controls) {
      var a = G.util.clamp(active.controlFade / 1.2, 0, 1) * 0.85;
      if (a > 0.01) {
        ctx.save();
        ctx.globalAlpha = a;
        ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
        ctx.fillStyle = "#cbb79a";
        ctx.textAlign = "center";
        ctx.fillText(def.controls, W / 2, py + ph - 18);
        ctx.restore();
      }
    }

    // finish flash
    if (active.done) {
      ctx.save();
      var f = G.util.clamp(1 - active.finishHold / 0.35, 0, 1);
      ctx.globalAlpha = f * 0.35;
      ctx.fillStyle = (active.result && active.result.win) ? "#7fb86b" : "#c4553f";
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    ctx.restore();
  }

  return {
    start: start,
    isActive: isActive,
    update: update,
    draw: draw,
    getActiveId: function () { return active ? active.id : null; },
    // test hook: force the running minigame to resolve without player input
    forceFinish: function (result) {
      if (!active || active.done) return false;
      active.done = true;
      active.result = result || { win: true };
      active.finishHold = 0.01;
      return true;
    }
  };
})();
