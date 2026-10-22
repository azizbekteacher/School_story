/* Keyboard + pointer input. Logical 960x600 coordinate mapping. */
window.G = window.G || {};

G.input = (function () {
  var down = {};
  var pressed = {};       // cleared each frame after consumption
  var mouse = { x: 0, y: 0, down: false, clicked: false };
  var canvas = null;
  var LOGICAL_W = 960, LOGICAL_H = 600;

  function keyName(e) {
    var k = e.key;
    if (!k) return "";
    if (k === " ") return "space";
    if (k === "Enter") return "enter";
    if (k === "Escape") return "escape";
    if (k === "Tab") return "tab";
    if (k === "Backspace") return "backspace";
    if (k === "ArrowUp") return "arrowup";
    if (k === "ArrowDown") return "arrowdown";
    if (k === "ArrowLeft") return "arrowleft";
    if (k === "ArrowRight") return "arrowright";
    return k.toLowerCase();
  }

  function init(cv) {
    canvas = cv;

    window.addEventListener("keydown", function (e) {
      // A real text field owns the keyboard. Without this guard, typing a note
      // walks the hero and presses buttons in the background.
      var t = e.target;
      if (t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.isContentEditable)) return;
      var k = keyName(e);
      if (!k) return;
      // stop page scroll / tab-focus jumps while playing
      if (["space", "tab", "arrowup", "arrowdown", "arrowleft", "arrowright"].indexOf(k) !== -1) {
        e.preventDefault();
      }
      if (!down[k]) pressed[k] = true;
      down[k] = true;
    });

    window.addEventListener("keyup", function (e) {
      var k = keyName(e);
      if (!k) return;
      down[k] = false;
    });

    window.addEventListener("blur", function () {
      down = {};
      pressed = {};
    });

    canvas.addEventListener("mousemove", function (e) {
      var p = toLogical(e);
      mouse.x = p.x; mouse.y = p.y;
    });

    canvas.addEventListener("mousedown", function (e) {
      var p = toLogical(e);
      mouse.x = p.x; mouse.y = p.y;
      mouse.down = true;
      mouse.clicked = true;
      if (e.button === 0) e.preventDefault();
    });

    window.addEventListener("mouseup", function () { mouse.down = false; });

    canvas.addEventListener("touchstart", function (e) {
      if (!e.touches.length) return;
      var p = toLogical(e.touches[0]);
      mouse.x = p.x; mouse.y = p.y;
      mouse.down = true;
      mouse.clicked = true;
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener("touchmove", function (e) {
      if (!e.touches.length) return;
      var p = toLogical(e.touches[0]);
      mouse.x = p.x; mouse.y = p.y;
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener("touchend", function (e) {
      mouse.down = false;
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  }

  function toLogical(e) {
    var r = canvas.getBoundingClientRect();
    var cx = (e.clientX !== undefined ? e.clientX : 0);
    var cy = (e.clientY !== undefined ? e.clientY : 0);
    return {
      x: (cx - r.left) / r.width * LOGICAL_W,
      y: (cy - r.top) / r.height * LOGICAL_H
    };
  }

  function isDown(k) { return !!down[k]; }
  function wasPressed(k) { return !!pressed[k]; }
  function consume(k) {
    if (pressed[k]) { pressed[k] = false; return true; }
    return false;
  }

  /* Virtual keys: the touch layer drives the game through these, so a thumb
     and a keyboard produce byte-identical input state. `pressVirtual` does the
     edge-detection a real keydown does (only the first press in a frame counts
     as "pressed"), and the per-frame clear in endFrame() finishes the job. */
  function pressVirtual(k) {
    if (!k) return;
    if (!down[k]) pressed[k] = true;
    down[k] = true;
  }

  function releaseVirtual(k) {
    if (!k) return;
    down[k] = false;
  }

  function anyPressed(keys) {
    for (var i = 0; i < keys.length; i++) {
      if (pressed[keys[i]]) { pressed[keys[i]] = false; return keys[i]; }
    }
    return null;
  }

  // call at end of every frame
  function endFrame() {
    pressed = {};
    mouse.clicked = false;
  }

  // Returns a list of number keys pressed this frame, 1..9
  function numberPressed() {
    for (var i = 1; i <= 9; i++) {
      if (pressed["" + i]) { pressed["" + i] = false; return i; }
    }
    return 0;
  }

  return {
    init: init,
    isDown: isDown,
    wasPressed: wasPressed,
    consume: consume,
    pressVirtual: pressVirtual,
    releaseVirtual: releaseVirtual,
    anyPressed: anyPressed,
    numberPressed: numberPressed,
    endFrame: endFrame,
    mouse: mouse,
    clearPressed: function () { pressed = {}; }
  };
})();
