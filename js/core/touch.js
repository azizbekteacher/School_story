/* Touch controls — feeds the same G.input events the keyboard produces, so
   nothing downstream needs to know whether a thumb or a key drove it.

   Design:
   - The canvas is letterboxed to fit the viewport; game coordinates are mapped
     back through the same transform so taps land where they look.
   - A virtual d-pad on the left, action buttons on the right, only shown on
     touch devices (or when there is no fine pointer).
   - Taps on the dialogue panel pick the option under the finger; taps elsewhere
     advance dialogue, which is what a player expects from a text box.

   Stub until the mobile layer lands. Must not throw at load time. */
window.G = window.G || {};

G.touch = (function () {
  var enabled = false;
  var active = [];

  function isTouchDevice() {
    if (typeof window === "undefined") return false;
    if (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) return true;
    return typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
  }

  /* Map a pointer position in CSS pixels to logical canvas coordinates. */
  function toGame(clientX, clientY) {
    var cv = document.getElementById("game");
    if (!cv || !cv.getBoundingClientRect) return { x: 0, y: 0 };
    var r = cv.getBoundingClientRect();
    if (!r.width || !r.height) return { x: 0, y: 0 };
    return {
      x: (clientX - r.left) * (cv.width / r.width),
      y: (clientY - r.top) * (cv.height / r.height)
    };
  }

  function install() {
    enabled = isTouchDevice();
    return enabled;
  }

  function isEnabled() { return enabled; }
  function held() { return active; }

  return {
    install: install,
    isEnabled: isEnabled,
    isTouchDevice: isTouchDevice,
    toGame: toGame,
    held: held
  };
})();
