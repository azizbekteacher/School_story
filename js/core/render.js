/* Canvas drawing primitives: characters, text, panels, weather/light. */
window.G = window.G || {};

G.render = (function () {
  var W = 960, H = 600;

  var PALETTES = {
    hero:            { skin: "#e8b98f", hair: "#2b2118", shirt: "#3f6f8f", pants: "#2c2a33", accent: "#d9a44c" },
    adult_male:      { skin: "#e0b088", hair: "#241b14", shirt: "#6b5b45", pants: "#33302c", accent: "#a8845a" },
    adult_female:    { skin: "#ecc09a", hair: "#2a1d16", shirt: "#8c4a52", pants: "#3a3140", accent: "#c98f7a" },
    mother:          { skin: "#e8bb94", hair: "#3a2419", shirt: "#7a4a6b", pants: "#37303a", accent: "#b98aa0" },
    boy:             { skin: "#e5b78d", hair: "#2a1e15", shirt: "#5b7f4a", pants: "#3a4048", accent: "#c9d9a0" },
    shopkeeper:      { skin: "#dcae86", hair: "#4a4038", shirt: "#8a7248", pants: "#3b352e", accent: "#d9c08a" },
    teacher_female:  { skin: "#ecc39d", hair: "#241a15", shirt: "#4a6b7a", pants: "#33333d", accent: "#9fc3c9" },
    teacher_male:    { skin: "#dfb28a", hair: "#2b2118", shirt: "#5a5a6e", pants: "#2f2f38", accent: "#9a9ab0" }
  };

  function palette(name) { return PALETTES[name] || PALETTES.adult_male; }

  function outlinedText(ctx, text, x, y, opts) {
    opts = opts || {};
    ctx.save();
    ctx.font = opts.font || "16px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = opts.align || "left";
    ctx.textBaseline = opts.baseline || "alphabetic";
    if (opts.shadow !== false) {
      ctx.fillStyle = "rgba(0,0,0,.55)";
      ctx.fillText(text, x + (opts.shadowOff || 1.5), y + (opts.shadowOff || 1.5));
    }
    ctx.fillStyle = opts.color || "#f4ece0";
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function panel(ctx, x, y, w, h, opts) {
    opts = opts || {};
    ctx.save();
    var r = opts.radius === undefined ? 10 : opts.radius;
    G.util.roundRect(ctx, x, y, w, h, r);
    ctx.fillStyle = opts.fill || "rgba(62,53,44,.94)";
    ctx.fill();
    if (opts.stroke !== false) {
      ctx.lineWidth = opts.lineWidth || 2;
      ctx.strokeStyle = opts.stroke || "rgba(232,196,128,.55)";
      ctx.stroke();
    }
    if (opts.inner) {
      G.util.roundRect(ctx, x + 5, y + 5, w - 10, h - 10, Math.max(0, r - 4));
      ctx.strokeStyle = "rgba(232,196,128,.18)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }

  function shadow(ctx, x, y, rx, ry, a) {
    ctx.save();
    ctx.globalAlpha = a === undefined ? 0.3 : a;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* A side view, drawn facing LEFT. Right-facing is produced by mirroring this,
     which guarantees the two side views can never disagree about direction. */
  function drawProfile(ctx, p, bob, legSwing, armSwing) {
    var fw = Math.max(-2.2, Math.min(2.2, legSwing * 0.55));   // lead leg offset
    var bw = -fw;

    // legs — one forward, one back
    ctx.fillStyle = p.pants;
    ctx.fillRect(-4.2 + fw, -12, 3.7, 12);
    ctx.fillRect(1.0 + bw, -12, 3.7, 12);

    // shoes — the lead foot points the way the character looks (left)
    ctx.fillStyle = "#1d1a18";
    ctx.fillRect(-6.8 + fw, -2.3, 6.4, 2.7);
    ctx.fillRect(-0.6 + bw, -2.3, 5.7, 2.7);

    // body
    ctx.fillStyle = p.shirt;
    G.util.roundRect(ctx, -6, -25 + bob, 12, 14, 3);
    ctx.fill();
    // collar sits on the chest, i.e. the front (left) edge
    ctx.fillStyle = p.accent;
    ctx.fillRect(-5.6, -24.6 + bob, 3.2, 2.4);

    // near arm, swinging in profile
    ctx.fillStyle = p.shirt;
    ctx.fillRect(-2.7 + armSwing * 0.3, -23 + bob, 3.8, 9.6);
    ctx.fillStyle = p.skin;
    ctx.fillRect(-2.5 + armSwing * 0.3, -14.2 + bob, 3.6, 3.3);

    // head
    ctx.fillStyle = p.skin;
    ctx.beginPath();
    ctx.arc(0, -31 + bob, 6.4, 0, Math.PI * 2);
    ctx.fill();

    // nose — pokes out past the head on the face side. This is the single
    // strongest direction cue, so it is drawn deliberately oversized.
    ctx.beginPath();
    ctx.arc(-6.1, -30.3 + bob, 1.85, 0, Math.PI * 2);
    ctx.fill();

    // hair — covers the top and the BACK (the right side when facing left)
    ctx.fillStyle = p.hair;
    ctx.beginPath();
    ctx.arc(0, -31.4 + bob, 6.5, Math.PI * 1.22, Math.PI * 2.16);
    ctx.fill();

    // eye — clearly on the face side, left of centre
    ctx.fillStyle = "#2a2118";
    ctx.fillRect(-4.3, -31.9 + bob, 1.6, 2.0);
  }

  /* A small top-down person. Origin is at the feet. */
  function character(ctx, x, y, pal, facing, walkPhase, opts) {
    opts = opts || {};
    var p = typeof pal === "string" ? palette(pal) : pal;
    var s = opts.scale || 1;
    var phase = walkPhase || 0;
    var bob = Math.sin(phase * 2) * 1.2 * s;
    var legSwing = Math.sin(phase * 2) * 3 * s;
    var armSwing = Math.sin(phase * 2 + Math.PI) * 2.4 * s;
    var face = facing || "down";

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);

    // Side views: draw one left-facing profile, mirror it for right. Hand-drawing
    // both directions is exactly how a sprite ends up looking backwards.
    if (face === "left" || face === "right") {
      if (face === "right") ctx.scale(-1, 1);
      drawProfile(ctx, p, bob, legSwing, armSwing);
      ctx.restore();
      return;
    }

    // legs
    ctx.fillStyle = p.pants;
    ctx.fillRect(-5, -12, 4, 12 + Math.max(0, -legSwing) * 0.4);
    ctx.fillRect(1, -12, 4, 12 + Math.max(0, legSwing) * 0.4);
    // shoes
    ctx.fillStyle = "#1d1a18";
    ctx.fillRect(-5.5, -2, 5, 2.4);
    ctx.fillRect(0.5, -2, 5, 2.4);

    // body
    ctx.fillStyle = p.shirt;
    G.util.roundRect(ctx, -6, -25 + bob, 12, 14, 3);
    ctx.fill();
    // collar / accent
    ctx.fillStyle = p.accent;
    ctx.fillRect(-2.2, -25 + bob, 4.4, 2.6);

    // arms
    ctx.fillStyle = p.shirt;
    ctx.fillRect(-8.4, -23 + bob, 2.8, 10 + armSwing * 0.2);
    ctx.fillRect(5.6, -23 + bob, 2.8, 10 - armSwing * 0.2);
    // hands
    ctx.fillStyle = p.skin;
    ctx.fillRect(-8.6, -13.6 + bob, 3.2, 3.2);
    ctx.fillRect(5.4, -13.6 + bob, 3.2, 3.2);

    // head
    ctx.fillStyle = p.skin;
    ctx.beginPath();
    ctx.arc(0, -31 + bob, 6.4, 0, Math.PI * 2);
    ctx.fill();

    // hair
    ctx.fillStyle = p.hair;
    ctx.beginPath();
    if (face === "down") {
      ctx.arc(0, -32.5 + bob, 6.5, Math.PI * 1.05, Math.PI * 1.95);
    } else {
      ctx.arc(0, -31 + bob, 6.5, 0, Math.PI * 2);
    }
    ctx.fill();

    // face details
    if (face !== "up") {
      ctx.fillStyle = "#2a2118";
      ctx.fillRect(-2.8, -31.8 + bob, 1.4, 1.8);
      ctx.fillRect(1.4, -31.8 + bob, 1.4, 1.8);
    }
    ctx.restore();
  }

  /* Interaction prompt above an NPC. */
  function prompt(ctx, x, y, text, t) {
    var bob = Math.sin((t || 0) * 4) * 2;
    ctx.save();
    ctx.font = "bold 12px 'Segoe UI', system-ui, sans-serif";
    var w = ctx.measureText(text).width + 18;
    var bx = x - w / 2, by = y - 54 + bob;
    G.util.roundRect(ctx, bx, by, w, 20, 10);
    ctx.fillStyle = "rgba(20,17,15,.9)";
    ctx.fill();
    ctx.strokeStyle = "rgba(217,164,76,.7)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#f2dfae";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, by + 10.5);
    ctx.restore();
  }

  /* Speech bubble that pops in. */
  function bubble(ctx, x, y, text, progress) {
    var p = G.util.clamp(progress, 0, 1);
    var scale = 0.7 + 0.3 * G.util.easeOut(p);
    ctx.save();
    ctx.font = "13px 'Segoe UI', system-ui, sans-serif";
    var lines = G.util.wrapText(ctx, text, 190);
    var w = 0, i;
    for (i = 0; i < lines.length; i++) w = Math.max(w, ctx.measureText(lines[i]).width);
    w += 22;
    var h = lines.length * 17 + 16;
    ctx.translate(x, y - 46);
    ctx.scale(scale, scale);
    ctx.globalAlpha = p;
    G.util.roundRect(ctx, -w / 2, -h, w, h, 9);
    ctx.fillStyle = "rgba(244,236,224,.97)";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-6, -1);
    ctx.lineTo(0, 9);
    ctx.lineTo(6, -1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#231d18";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 0, -h + 9 + i * 17);
    }
    ctx.restore();
  }

  function hint(ctx, text, t) {
    ctx.save();
    ctx.globalAlpha = 0.55 + 0.25 * Math.sin((t || 0) * 2);
    ctx.font = "13px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#f4ece0";
    ctx.fillText(text, W / 2, H - 18);
    ctx.restore();
  }

  function vignette(ctx) {
    var g = ctx.createRadialGradient(W / 2, H / 2, H * 0.52, W / 2, H / 2, H * 1.05);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,.20)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function scanline(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.045;
    ctx.fillStyle = "#000";
    for (var y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
    ctx.restore();
  }

  function progressBar(ctx, x, y, w, h, pct, color, label) {
    ctx.save();
    G.util.roundRect(ctx, x, y, w, h, h / 2);
    ctx.fillStyle = "rgba(0,0,0,.5)";
    ctx.fill();
    var p = G.util.clamp(pct, 0, 1);
    if (p > 0) {
      G.util.roundRect(ctx, x + 1.5, y + 1.5, Math.max(0, (w - 3) * p), h - 3, (h - 3) / 2);
      ctx.fillStyle = color || "#7fb86b";
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(244,236,224,.22)";
    ctx.lineWidth = 1;
    G.util.roundRect(ctx, x, y, w, h, h / 2);
    ctx.stroke();
    if (label) {
      ctx.font = "10px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(244,236,224,.85)";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(label, x + w / 2, y + h / 2 + 0.5);
    }
    ctx.restore();
  }

  return {
    W: W, H: H,
    palette: palette,
    PALETTES: PALETTES,
    text: outlinedText,
    panel: panel,
    shadow: shadow,
    character: character,
    prompt: prompt,
    bubble: bubble,
    hint: hint,
    vignette: vignette,
    scanline: scanline,
    progressBar: progressBar
  };
})();
