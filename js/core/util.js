/* Small math/drawing helpers. No dependencies. */
window.G = window.G || {};

G.util = {
  clamp: function (v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); },
  lerp: function (a, b, t) { return a + (b - a) * t; },
  smooth: function (t) { return t * t * (3 - 2 * t); },
  easeOut: function (t) { return 1 - Math.pow(1 - t, 3); },
  easeIn: function (t) { return t * t * t; },

  dist: function (ax, ay, bx, by) {
    var dx = ax - bx, dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
  },

  sign: function (v) { return v < 0 ? -1 : (v > 0 ? 1 : 0); },

  // deterministic hash → [0,1), for stable scattered decoration
  hash: function (n) {
    var x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  },

  wrap: function (v, m) { return ((v % m) + m) % m; },

  rectsOverlap: function (a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  },

  pointInRect: function (px, py, r) {
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
  },

  // Wrap text to a pixel width. ctx must have its font set already.
  wrapText: function (ctx, text, maxWidth) {
    var words = String(text).split(/\s+/);
    var lines = [], line = "";
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  },

  roundRect: function (ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  },

  alpha: function (color, a) {
    // accepts "#rrggbb"
    var h = color.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var r = parseInt(h.substr(0, 2), 16);
    var g = parseInt(h.substr(2, 2), 16);
    var b = parseInt(h.substr(4, 2), 16);
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  },

  fmtSom: function (n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
  },

  // simple seeded rng for decorations
  rng: function (seed) {
    var s = seed || 1;
    return function () {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
  }
};
