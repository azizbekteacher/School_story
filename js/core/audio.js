/* Tiny synthesized audio. No files. Falls back silently if blocked. */
window.G = window.G || {};

G.audio = (function () {
  var ctx = null;
  var enabled = true;
  var master = null;

  function ensure() {
    if (ctx) return ctx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { enabled = false; return null; }
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.18;
      master.connect(ctx.destination);
    } catch (e) {
      enabled = false;
      ctx = null;
    }
    return ctx;
  }

  function resume() {
    // browsers require a gesture; call on first input
    var c = ensure();
    if (c && c.state === "suspended") { try { c.resume(); } catch (e) {} }
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (!enabled) return;
    var c = ensure();
    if (!c) return;
    try {
      var o = c.createOscillator();
      var g = c.createGain();
      o.type = type || "sine";
      o.frequency.value = freq;
      if (slideTo) {
        o.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), c.currentTime + dur);
      }
      g.gain.value = 0.0001;
      g.gain.exponentialRampToValueAtTime(vol || 0.2, c.currentTime + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      o.connect(g); g.connect(master);
      o.start();
      o.stop(c.currentTime + dur + 0.02);
    } catch (e) { /* ignore */ }
  }

  function noise(dur, vol) {
    if (!enabled) return;
    var c = ensure();
    if (!c) return;
    try {
      var len = Math.floor(c.sampleRate * dur);
      var buf = c.createBuffer(1, len, c.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      }
      var src = c.createBufferSource();
      src.buffer = buf;
      var g = c.createGain();
      g.gain.value = vol || 0.12;
      src.connect(g); g.connect(master);
      src.start();
    } catch (e) { /* ignore */ }
  }

  return {
    resume: resume,
    setEnabled: function (v) { enabled = !!v; },
    blip: function (freq) { tone(freq || 620, 0.06, "square", 0.10); },
    tick: function () { tone(880, 0.03, "square", 0.05); },
    select: function () { tone(520, 0.08, "triangle", 0.14); },
    good: function () { tone(660, 0.10, "sine", 0.16); setTimeout(function () { tone(880, 0.14, "sine", 0.14); }, 90); },
    bad: function () { tone(240, 0.18, "sawtooth", 0.12, 150); },
    win: function () {
      tone(523, 0.12, "sine", 0.15);
      setTimeout(function () { tone(659, 0.12, "sine", 0.15); }, 110);
      setTimeout(function () { tone(784, 0.20, "sine", 0.15); }, 220);
    },
    thud: function () { noise(0.12, 0.16); },
    step: function () { noise(0.05, 0.045); },
    door: function () { tone(180, 0.22, "sine", 0.10, 120); noise(0.14, 0.07); }
  };
})();
